"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  canPlace,
  cliffSensors,
  coverage,
  makeSim,
  makeWorld,
  POWER,
  ROBOT_R,
  step,
  ultrasonic,
  US_RANGE,
  type Power,
  type Sim,
} from "@/lib/demos/robot";

interface Readout {
  state: string;
  coverage: number;
  turns: number;
  cliffs: number;
  reverse: number;
  front: number;
  events: { t: number; text: string }[];
}

function readColors() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  return {
    bg: v("--bg-elev"),
    drop: v("--surface-2"),
    line: v("--line-strong"),
    text: v("--text"),
    muted: v("--text-muted"),
    accent: v("--accent"),
    warm: v("--warm"),
    danger: v("--danger-ink"),
  };
}

export default function RobotDemo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Sim | null>(null);
  const colorsRef = useRef<ReturnType<typeof readColors> | null>(null);
  // client-only component (lazy-loaded after mount), so reading matchMedia here is safe
  const [running, setRunning] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [power, setPower] = useState<Power>("turbo");
  const powerRef = useRef<Power>("turbo");
  const [readout, setReadout] = useState<Readout | null>(null);
  const [visible, setVisible] = useState(true);
  const [announce, setAnnounce] = useState("");

  const draw = useCallback(() => {
    const sim = simRef.current;
    const canvas = canvasRef.current;
    if (!sim || !canvas) return;
    const c = colorsRef.current ?? (colorsRef.current = readColors());
    const ctx = canvas.getContext("2d")!;
    const { world, robot: r } = sim;

    ctx.fillStyle = c.drop;
    ctx.fillRect(0, 0, world.w, world.h);
    ctx.fillStyle = c.bg;
    ctx.fillRect(world.floor.x, world.floor.y, world.floor.w, world.floor.h);
    ctx.strokeStyle = c.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(world.floor.x + 0.5, world.floor.y + 0.5, world.floor.w - 1, world.floor.h - 1);

    // coverage
    ctx.fillStyle = c.accent;
    ctx.globalAlpha = 0.22;
    for (let row = 0; row < sim.coverRows; row++)
      for (let col = 0; col < sim.coverCols; col++)
        if (sim.covered[row * sim.coverCols + col]) ctx.fillRect(col * 10, row * 10, 10, 10);
    ctx.globalAlpha = 1;

    // holes (drops)
    for (const h of world.holes) {
      ctx.fillStyle = c.drop;
      ctx.fillRect(h.x, h.y, h.w, h.h);
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = c.warm;
      ctx.strokeRect(h.x + 0.5, h.y + 0.5, h.w - 1, h.h - 1);
      ctx.setLineDash([]);
    }
    ctx.fillStyle = c.muted;
    ctx.font = "11px ui-monospace, monospace";
    ctx.fillText("DROP", world.holes[0]!.x + 6, world.holes[0]!.y + 16);
    ctx.fillText("EDGE: DROP", world.floor.x + 4, world.floor.y - 6);

    // obstacles
    for (const o of world.obstacles) {
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fillStyle = c.muted;
      ctx.fill();
    }

    // ultrasonic cone
    const front = ultrasonic(world, r);
    const range = Number.isFinite(front) ? front + ROBOT_R : US_RANGE + ROBOT_R;
    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.arc(r.x, r.y, range, r.heading - 0.28, r.heading + 0.28);
    ctx.closePath();
    ctx.fillStyle = Number.isFinite(front) ? c.warm : c.accent;
    ctx.globalAlpha = 0.18;
    ctx.fill();
    ctx.globalAlpha = 1;

    // body
    ctx.beginPath();
    ctx.arc(r.x, r.y, ROBOT_R, 0, Math.PI * 2);
    ctx.fillStyle = c.text;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x + Math.cos(r.heading) * ROBOT_R, r.y + Math.sin(r.heading) * ROBOT_R);
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 3;
    ctx.stroke();

    // cliff sensors
    const cl = cliffSensors(r);
    for (const p of [cl.left, cl.right]) {
      const onFloorNow =
        p.x >= world.floor.x && p.x <= world.floor.x + world.floor.w && p.y >= world.floor.y && p.y <= world.floor.y + world.floor.h &&
        !world.holes.some((h) => p.x >= h.x && p.x <= h.x + h.w && p.y >= h.y && p.y <= h.y + h.h);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = onFloorNow ? c.accent : c.danger;
      ctx.fill();
    }
  }, []);

  const reset = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const portrait = wrap.clientWidth < 600;
    const world = portrait ? makeWorld(480, 600) : makeWorld(800, 500);
    const sim = makeSim(world);
    sim.power = powerRef.current;
    simRef.current = sim;
    const canvas = canvasRef.current!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = world.w * dpr;
    canvas.height = world.h * dpr;
    canvas.style.aspectRatio = `${world.w} / ${world.h}`;
    canvas.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }, [draw]);

  const publish = useCallback(() => {
    const sim = simRef.current;
    if (!sim) return;
    setReadout({
      state: sim.robot.state,
      coverage: coverage(sim),
      turns: sim.turns,
      cliffs: sim.cliffSaves,
      reverse: sim.reverseMoves,
      front: ultrasonic(sim.world, sim.robot),
      events: sim.events.slice(0, 4),
    });
  }, []);

  // init + theme changes
  useEffect(() => {
    reset();
    publish();
    const mo = new MutationObserver(() => {
      colorsRef.current = null;
      draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "style"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      colorsRef.current = null;
      draw();
    };
    mq.addEventListener("change", onScheme);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", onScheme);
    };
  }, [reset, publish, draw]);

  // pause when off-screen
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // main loop
  useEffect(() => {
    if (!running || !visible) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let lastPublish = 0;
    const loop = (now: number) => {
      const sim = simRef.current;
      if (!sim) return;
      acc += Math.min(0.1, (now - last) / 1000);
      last = now;
      while (acc >= 1 / 120) {
        step(sim, 1 / 120);
        acc -= 1 / 120;
      }
      draw();
      if (now - lastPublish > 250) {
        publish();
        lastPublish = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, visible, draw, publish]);

  useEffect(() => {
    powerRef.current = power;
    if (simRef.current) simRef.current.power = power;
  }, [power]);

  const toWorld = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current!;
    const sim = simRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: ((clientX - rect.left) / rect.width) * sim.world.w, y: ((clientY - rect.top) / rect.height) * sim.world.h };
  };

  const placeAt = (x: number, y: number) => {
    const sim = simRef.current;
    if (!sim) return;
    const hit = sim.world.obstacles.findIndex((o) => (o.x - x) ** 2 + (o.y - y) ** 2 <= (o.r + 4) ** 2);
    if (hit >= 0) {
      sim.world.obstacles.splice(hit, 1);
      setAnnounce(`Obstacle removed. ${sim.world.obstacles.length} on the floor.`);
    } else if (canPlace(sim, x, y, 18)) {
      sim.world.obstacles.push({ x, y, r: 18 });
      setAnnounce(`Obstacle placed. ${sim.world.obstacles.length} on the floor.`);
    } else {
      setAnnounce("Can't place there: too close to the robot or off the floor.");
    }
    draw();
  };

  const addRandom = () => {
    const sim = simRef.current;
    if (!sim) return;
    for (let i = 0; i < 40; i++) {
      const x = sim.world.floor.x + 30 + Math.random() * (sim.world.floor.w - 60);
      const y = sim.world.floor.y + 30 + Math.random() * (sim.world.floor.h - 60);
      if (canPlace(sim, x, y, 18)) {
        placeAt(x, y);
        return;
      }
    }
  };

  const clearObstacles = () => {
    const sim = simRef.current;
    if (!sim) return;
    sim.world.obstacles = [];
    setAnnounce("All obstacles cleared.");
    draw();
  };

  const stateLabel: Record<string, string> = { cruise: "Driving forward", stop: "Stopped", rotate: "Rotating (gyro)", check: "Checking path" };

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-[var(--space-card)] py-3">
        <button type="button" className="btn btn-ghost min-h-10 px-3" onClick={() => setRunning((r) => !r)} aria-pressed={running}>
          <Icon name={running ? "pause" : "play"} size={16} />
          {running ? "Pause" : "Run"}
        </button>
        <button
          type="button"
          className="btn btn-ghost min-h-10 px-3"
          onClick={() => {
            reset();
            publish();
          }}
        >
          <Icon name="reset" size={16} /> Reset
        </button>
        <div role="radiogroup" aria-label="Vacuum mode" className="inline-flex rounded-full border border-line bg-bg-elev p-0.5 font-mono text-xs">
          {(Object.keys(POWER) as Power[]).map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={power === p}
              onClick={() => setPower(p)}
              className={`min-h-9 rounded-full px-3 ${power === p ? "bg-text text-bg" : "text-muted hover:text-text"}`}
            >
              {POWER[p].label}
            </button>
          ))}
        </div>
        <span className="ml-auto flex gap-2">
          <button type="button" className="btn btn-ghost min-h-10 px-3" onClick={addRandom}>
            Add obstacle
          </button>
          <button type="button" className="btn btn-ghost min-h-10 px-3" onClick={clearObstacles}>
            Clear
          </button>
        </span>
      </div>

      <div className="grid lg:grid-cols-[1fr_17rem]">
        <div ref={wrapRef} className="relative">
          <canvas
            ref={canvasRef}
            className="block h-auto w-full cursor-crosshair"
            role="img"
            aria-label="Robot simulation. Click or tap the floor to place or remove obstacles. The shaded border and dashed area are drops."
            onPointerDown={(e) => {
              const { x, y } = toWorld(e.clientX, e.clientY);
              placeAt(x, y);
            }}
          />
          <span className="sr-only" role="status" aria-live="polite">
            {announce}
          </span>
        </div>
        <aside aria-label="Robot telemetry" className="border-t border-line p-[var(--space-card)] font-mono text-xs lg:border-l lg:border-t-0">
          <dl className="grid grid-cols-2 gap-x-3 gap-y-3 lg:grid-cols-1">
            <Stat label="State" value={readout ? stateLabel[readout.state] ?? readout.state : "…"} />
            <Stat label="Front distance" value={readout ? (Number.isFinite(readout.front) ? `${Math.round(readout.front)} px` : "clear") : "…"} />
            <Stat label="Floor covered" value={readout ? `${Math.round(readout.coverage * 100)}%` : "…"} />
            <Stat label="Turns / cliff stops" value={readout ? `${readout.turns} / ${readout.cliffs}` : "…"} />
            <Stat label="Reverse moves" value={readout ? String(readout.reverse) : "0"} accent />
          </dl>
          <p className="eyebrow mt-5">Event log</p>
          <ol className="mt-2 space-y-1.5 text-[0.7rem] leading-snug text-muted">
            {readout?.events.length ? (
              readout.events.map((e, i) => (
                <li key={`${e.t}-${i}`}>
                  <span className="text-text">{e.t.toFixed(1)}s</span> {e.text}
                </li>
              ))
            ) : (
              <li>Waiting for the first event…</li>
            )}
          </ol>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <dt className="text-[0.65rem] uppercase tracking-[0.08em] text-muted">{label}</dt>
      <dd className={`mt-0.5 text-sm ${accent ? "text-accent-ink" : "text-text"}`}>{value}</dd>
    </div>
  );
}
