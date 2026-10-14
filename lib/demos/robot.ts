import { mulberry32 } from "./rng";

/**
 * A 2D approximation of the robot's firmware behaviour.
 * Priority order per tick: cliff → obstacle → rotate (gyro-closed-loop) → forward.
 * There is no reverse state: no code path produces negative velocity.
 */

export type State = "cruise" | "stop" | "rotate" | "check";
export type Power = "turbo" | "eco";

export interface Rect { x: number; y: number; w: number; h: number }
export interface Obstacle { x: number; y: number; r: number }

export interface World {
  w: number;
  h: number;
  floor: Rect;
  holes: Rect[];
  obstacles: Obstacle[];
}

export interface Robot {
  x: number;
  y: number;
  heading: number; // radians
  state: State;
  timer: number;
  target: number; // degrees to rotate
  turned: number; // degrees integrated "from the gyro"
  dir: 1 | -1;
  reason: string;
}

export interface SimEvent {
  t: number;
  text: string;
}

export interface Sim {
  world: World;
  robot: Robot;
  power: Power;
  t: number;
  distance: number;
  reverseMoves: number;
  turns: number;
  cliffSaves: number;
  covered: Uint8Array;
  coverCols: number;
  coverRows: number;
  coveredCount: number;
  floorCells: number;
  events: SimEvent[];
  trail: [number, number][];
  rand: () => number;
}

export const ROBOT_R = 14;
export const US_RANGE = 70; // ultrasonic range, px
export const STOP_DIST = 26; // obstacle threshold, px
export const CLIFF_OFFSET = ROBOT_R + 7;
export const CLIFF_SPREAD = 0.55; // radians either side of heading
const CELL = 10;

export const POWER = {
  turbo: { speed: 72, omega: 150, brush: ROBOT_R + 2, label: "Turbo" },
  eco: { speed: 42, omega: 105, brush: ROBOT_R - 2, label: "Eco" },
} as const;

export function makeWorld(w: number, h: number): World {
  const m = Math.round(Math.min(w, h) * 0.06);
  const portrait = h > w;
  return {
    w,
    h,
    floor: { x: m, y: m, w: w - 2 * m, h: h - 2 * m },
    holes: portrait
      ? [{ x: w * 0.55, y: h * 0.58, w: w * 0.24, h: h * 0.14 }]
      : [{ x: w * 0.62, y: h * 0.52, w: w * 0.16, h: h * 0.24 }],
    obstacles: portrait
      ? [
          { x: w * 0.3, y: h * 0.3, r: 22 },
          { x: w * 0.7, y: h * 0.22, r: 16 },
        ]
      : [
          { x: w * 0.3, y: h * 0.35, r: 22 },
          { x: w * 0.45, y: h * 0.72, r: 18 },
        ],
  };
}

export function makeSim(world: World, seed = 3): Sim {
  const cols = Math.ceil(world.w / CELL);
  const rows = Math.ceil(world.h / CELL);
  const covered = new Uint8Array(cols * rows);
  let floorCells = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) if (onFloor(world, c * CELL + CELL / 2, r * CELL + CELL / 2)) floorCells++;
  return {
    world,
    robot: {
      x: world.w * 0.18,
      y: world.h * 0.7,
      heading: -0.5,
      state: "cruise",
      timer: 0,
      target: 0,
      turned: 0,
      dir: 1,
      reason: "",
    },
    power: "turbo",
    t: 0,
    distance: 0,
    reverseMoves: 0,
    turns: 0,
    cliffSaves: 0,
    covered,
    coverCols: cols,
    coverRows: rows,
    coveredCount: 0,
    floorCells,
    events: [],
    trail: [],
    rand: mulberry32(seed),
  };
}

const inRect = (r: Rect, x: number, y: number) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

export function onFloor(world: World, x: number, y: number): boolean {
  return inRect(world.floor, x, y) && !world.holes.some((h) => inRect(h, x, y));
}

export function cliffSensors(r: Robot) {
  return {
    left: { x: r.x + Math.cos(r.heading - CLIFF_SPREAD) * CLIFF_OFFSET, y: r.y + Math.sin(r.heading - CLIFF_SPREAD) * CLIFF_OFFSET },
    right: { x: r.x + Math.cos(r.heading + CLIFF_SPREAD) * CLIFF_OFFSET, y: r.y + Math.sin(r.heading + CLIFF_SPREAD) * CLIFF_OFFSET },
  };
}

/** Distance along a ray to the nearest obstacle edge (Infinity if none in range). */
export function rayDistance(world: World, x: number, y: number, angle: number, range = US_RANGE): number {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let best = Infinity;
  for (const o of world.obstacles) {
    const fx = x - o.x;
    const fy = y - o.y;
    const b = fx * dx + fy * dy;
    const c = fx * fx + fy * fy - o.r * o.r;
    const disc = b * b - c;
    if (disc < 0) continue;
    const tHit = -b - Math.sqrt(disc);
    if (tHit >= 0 && tHit < best) best = tHit;
  }
  return best <= range ? best : Infinity;
}

/** Front distance as the ultrasonic sensor sees it: a narrow cone, nearest echo wins. */
export function ultrasonic(world: World, r: Robot): number {
  const fromX = r.x + Math.cos(r.heading) * ROBOT_R;
  const fromY = r.y + Math.sin(r.heading) * ROBOT_R;
  return Math.min(
    rayDistance(world, fromX, fromY, r.heading),
    rayDistance(world, fromX, fromY, r.heading - 0.28),
    rayDistance(world, fromX, fromY, r.heading + 0.28),
  );
}

function log(sim: Sim, text: string) {
  sim.events.unshift({ t: sim.t, text });
  if (sim.events.length > 6) sim.events.pop();
}

function cover(sim: Sim) {
  const { x, y } = sim.robot;
  const brush = POWER[sim.power].brush;
  const c0 = Math.max(0, Math.floor((x - brush) / CELL));
  const c1 = Math.min(sim.coverCols - 1, Math.floor((x + brush) / CELL));
  const r0 = Math.max(0, Math.floor((y - brush) / CELL));
  const r1 = Math.min(sim.coverRows - 1, Math.floor((y + brush) / CELL));
  for (let r = r0; r <= r1; r++)
    for (let c = c0; c <= c1; c++) {
      const cx = c * CELL + CELL / 2;
      const cy = r * CELL + CELL / 2;
      if ((cx - x) ** 2 + (cy - y) ** 2 > brush * brush) continue;
      const idx = r * sim.coverCols + c;
      if (!sim.covered[idx] && onFloor(sim.world, cx, cy)) {
        sim.covered[idx] = 1;
        sim.coveredCount++;
      }
    }
}

const sideSpace = (sim: Sim, side: 1 | -1) => {
  const r = sim.robot;
  const d = rayDistance(sim.world, r.x, r.y, r.heading + side * 1.1, 160);
  // distance to the floor edge on that side counts too
  let edge = 0;
  for (let s = 0; s < 160; s += 8) {
    if (!onFloor(sim.world, r.x + Math.cos(r.heading + side * 1.1) * s, r.y + Math.sin(r.heading + side * 1.1) * s)) break;
    edge = s;
  }
  return Math.min(d, edge);
};

export function step(sim: Sim, dt: number) {
  const r = sim.robot;
  const p = POWER[sim.power];
  sim.t += dt;
  const cliffs = cliffSensors(r);
  const cliffL = !onFloor(sim.world, cliffs.left.x, cliffs.left.y);
  const cliffR = !onFloor(sim.world, cliffs.right.x, cliffs.right.y);
  const front = ultrasonic(sim.world, r);

  switch (r.state) {
    case "cruise": {
      // 1. cliff first, always
      if (cliffL || cliffR) {
        r.state = "stop";
        r.timer = 0.22;
        r.dir = cliffL && !cliffR ? 1 : cliffR && !cliffL ? -1 : sideSpace(sim, 1) >= sideSpace(sim, -1) ? 1 : -1;
        r.target = 110 + Math.round(sim.rand() * 50);
        r.reason = "cliff";
        sim.cliffSaves++;
        log(sim, `Cliff under ${cliffL && cliffR ? "both sensors" : cliffL ? "left sensor" : "right sensor"}: stop, rotate ${r.target}° ${r.dir > 0 ? "right" : "left"}`);
        break;
      }
      // 2. obstacle
      if (front < STOP_DIST) {
        r.state = "stop";
        r.timer = 0.18;
        r.dir = sideSpace(sim, 1) >= sideSpace(sim, -1) ? 1 : -1;
        r.target = 70 + Math.round(sim.rand() * 70);
        r.reason = "obstacle";
        log(sim, `Obstacle at ${Math.round(front)} px: stop, rotate ${r.target}° ${r.dir > 0 ? "right" : "left"}`);
        break;
      }
      // 3. forward only, never negative
      const v = p.speed * dt;
      if (v < 0) sim.reverseMoves++; // unreachable by construction; kept as an assertion
      const nx = r.x + Math.cos(r.heading) * v;
      const ny = r.y + Math.sin(r.heading) * v;
      const bump = sim.world.obstacles.some((o) => (o.x - nx) ** 2 + (o.y - ny) ** 2 < (o.r + ROBOT_R) ** 2);
      if (bump) {
        r.state = "stop";
        r.timer = 0.18;
        r.dir = sideSpace(sim, 1) >= sideSpace(sim, -1) ? 1 : -1;
        r.target = 90 + Math.round(sim.rand() * 60);
        r.reason = "bumper";
        log(sim, `Bumper contact: stop, rotate ${r.target}° ${r.dir > 0 ? "right" : "left"}`);
        break;
      }
      r.x = nx;
      r.y = ny;
      sim.distance += v;
      cover(sim);
      const last = sim.trail[sim.trail.length - 1];
      if (!last || (last[0] - r.x) ** 2 + (last[1] - r.y) ** 2 > 36) {
        sim.trail.push([r.x, r.y]);
        if (sim.trail.length > 600) sim.trail.shift();
      }
      break;
    }
    case "stop":
      r.timer -= dt;
      if (r.timer <= 0) {
        r.state = "rotate";
        r.turned = 0;
        sim.turns++;
      }
      break;
    case "rotate": {
      // gyro-closed-loop: integrate yaw rate until the target heading, slow near the end
      const remaining = r.target - r.turned;
      const omega = remaining < 15 ? p.omega * 0.4 : p.omega;
      const d = Math.min(remaining, omega * dt);
      r.turned += d;
      r.heading += r.dir * (d * Math.PI) / 180;
      if (r.turned >= r.target - 0.01) {
        r.state = "check";
        r.timer = 0.12;
      }
      break;
    }
    case "check":
      r.timer -= dt;
      if (r.timer > 0) break;
      if (cliffL || cliffR || front < STOP_DIST * 1.6) {
        r.state = "rotate";
        r.turned = 0;
        r.target = 35 + Math.round(sim.rand() * 30);
        log(sim, `Path still blocked: rotate another ${r.target}°`);
      } else {
        r.state = "cruise";
      }
      break;
  }
}

export const coverage = (sim: Sim) => (sim.floorCells ? sim.coveredCount / sim.floorCells : 0);

/** Can an obstacle go here? Not on the robot, and only on the floor. */
export function canPlace(sim: Sim, x: number, y: number, r: number) {
  const rb = sim.robot;
  return onFloor(sim.world, x, y) && (rb.x - x) ** 2 + (rb.y - y) ** 2 > (r + ROBOT_R + 8) ** 2;
}
