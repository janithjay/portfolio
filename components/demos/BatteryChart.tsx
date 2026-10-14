import { capacity, curve, type BatteryInputs } from "@/lib/demos/battery";

const W = 640;
const H = 240;
const P = { l: 40, r: 12, t: 14, b: 30 };
const MAX_C = 2000;

export function BatteryChart({ inputs }: { inputs: BatteryInputs }) {
  const x = (c: number) => P.l + (c / MAX_C) * (W - P.l - P.r);
  const y = (cap: number) => P.t + ((100 - cap) / 50) * (H - P.t - P.b);
  const pts = curve(inputs, MAX_C);
  const d = pts.map(([c, v], i) => `${i ? "L" : "M"}${x(c).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const now = capacity(inputs);
  const eol = 80;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Illustrative capacity curve. At ${inputs.cycles} cycles the battery retains about ${now.toFixed(1)}% of its capacity.`}
      className="block h-auto w-full"
    >
      {[100, 90, 80, 70, 60, 50].map((v) => (
        <g key={v}>
          <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="var(--line)" />
          <text x={P.l - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">
            {v}%
          </text>
        </g>
      ))}
      {[0, 500, 1000, 1500, 2000].map((c) => (
        <text key={c} x={x(c)} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">
          {c}
        </text>
      ))}
      <line x1={P.l} x2={W - P.r} y1={y(eol)} y2={y(eol)} stroke="var(--warm)" strokeDasharray="5 4" />
      <text x={W - P.r} y={y(eol) - 6} textAnchor="end" fontSize="11" fill="var(--warm-ink)" fontFamily="var(--font-mono)">
        80%: typical end of life
      </text>
      <path d={d} fill="none" stroke="var(--accent-ink)" strokeWidth="2.5" />
      <line x1={x(inputs.cycles)} x2={x(inputs.cycles)} y1={P.t} y2={H - P.b} stroke="var(--line-strong)" />
      <circle cx={x(inputs.cycles)} cy={y(now)} r="6" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2" />
    </svg>
  );
}
