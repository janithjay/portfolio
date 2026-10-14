import { coverage, makeSim, makeWorld, ROBOT_R, step } from "@/lib/demos/robot";

/** Server-rendered snapshot: the same simulation, run for 40 s, drawn as SVG. */
export function RobotStatic() {
  const world = makeWorld(800, 500);
  const sim = makeSim(world);
  for (let i = 0; i < 60 * 40; i++) step(sim, 1 / 60);
  const r = sim.robot;
  const trail = sim.trail.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(0)},${y.toFixed(0)}`).join("");
  return (
    <figure className="card overflow-hidden">
      <svg viewBox={`0 0 ${world.w} ${world.h}`} role="img" aria-label={`Robot simulation snapshot after 40 seconds: ${Math.round(coverage(sim) * 100)}% of the floor covered, ${sim.turns} turns, ${sim.cliffSaves} cliff stops, 0 reverse moves.`} className="block h-auto w-full bg-bg">
        <rect width={world.w} height={world.h} fill="var(--surface-2)" />
        <rect {...world.floor} width={world.floor.w} height={world.floor.h} fill="var(--bg-elev)" stroke="var(--line-strong)" />
        {world.holes.map((h, i) => (
          <rect key={i} x={h.x} y={h.y} width={h.w} height={h.h} fill="var(--surface-2)" stroke="var(--warm)" strokeDasharray="6 4" />
        ))}
        <path d={trail} fill="none" stroke="var(--accent)" strokeOpacity="0.35" strokeWidth={ROBOT_R * 2} strokeLinecap="round" strokeLinejoin="round" />
        {world.obstacles.map((o, i) => (
          <circle key={i} cx={o.x} cy={o.y} r={o.r} fill="var(--text-muted)" />
        ))}
        <circle cx={r.x} cy={r.y} r={ROBOT_R} fill="var(--text)" />
        <line x1={r.x} y1={r.y} x2={r.x + Math.cos(r.heading) * ROBOT_R} y2={r.y + Math.sin(r.heading) * ROBOT_R} stroke="var(--accent)" strokeWidth="3" />
      </svg>
      <figcaption className="border-t border-line px-[var(--space-card)] py-3 text-sm text-muted">
        Snapshot after 40 simulated seconds: {Math.round(coverage(sim) * 100)}% covered, {sim.cliffSaves} cliff stops, 0 reverse moves.{" "}
        <span className="js-only">Loading the live simulator…</span>
        <noscript>Turn on JavaScript to run it and place obstacles.</noscript>
      </figcaption>
    </figure>
  );
}
