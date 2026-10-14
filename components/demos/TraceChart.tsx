import { CALIBRATION_END, H, N, PAD, W, scales, tracePath, type Detection, type Trace } from "@/lib/demos/power-trace";

/** Pure SVG chart: rendered on the server as the no-JS fallback and reused by the live demo. */
export function TraceChart({
  trace,
  userK,
  effectiveK,
  detections,
  buggy,
  label,
  children,
}: {
  trace: Trace;
  userK: number;
  effectiveK: number;
  detections: Detection[];
  buggy: boolean;
  label: string;
  children?: React.ReactNode;
}) {
  const { x, y } = scales(trace);
  const userY = y(trace.baseline + userK * trace.sigma);
  const effY = y(trace.baseline + effectiveK * trace.sigma);
  const calX = x(CALIBRATION_END);
  const diverged = buggy && Math.abs(userK - effectiveK) > 0.05;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block h-auto w-full">
      <defs>
        <pattern id="cal-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--line-strong)" strokeWidth="1" />
        </pattern>
      </defs>
      {/* calibration window */}
      <rect x={PAD.l} y={PAD.t} width={calX - PAD.l} height={H - PAD.t - PAD.b} fill="url(#cal-hatch)" opacity="0.6" />
      <text x={PAD.l + 6} y={H - 6} fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">
        calibration
      </text>
      <text x={calX + 6} y={H - 6} fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">
        detection →
      </text>
      {/* ground-truth events */}
      {trace.events.map((e) => (
        <path key={e.at} d={`M${x(e.at) - 4},${PAD.t - 2} h8 l-4,6 z`} fill="var(--text-muted)" opacity="0.7" />
      ))}
      {/* detections */}
      {detections.map((d) => (
        <rect
          key={d.start}
          x={x(d.start) - 2}
          y={PAD.t}
          width={Math.max(4, x(d.end) - x(d.start) + 4)}
          height={H - PAD.t - PAD.b}
          fill="var(--accent)"
          opacity="0.22"
        />
      ))}
      {/* signal */}
      <path d={tracePath(trace)} fill="none" stroke="var(--text)" strokeWidth="1.2" strokeLinejoin="round" />
      {/* user threshold (what you set) */}
      <line x1={PAD.l} x2={W - PAD.r} y1={userY} y2={userY} stroke="var(--warm)" strokeWidth="1.5" strokeDasharray="5 4" />
      {/* effective threshold (what the code used) */}
      {diverged && (
        <>
          <line x1={PAD.l} x2={calX} y1={userY} y2={userY} stroke="var(--danger-ink)" strokeWidth="2" />
          <line x1={calX} x2={W - PAD.r} y1={effY} y2={effY} stroke="var(--danger-ink)" strokeWidth="2" />
          <line x1={calX} x2={calX} y1={userY} y2={effY} stroke="var(--danger-ink)" strokeWidth="2" strokeDasharray="2 3" />
          <text x={W - PAD.r - 4} y={effY - 6} textAnchor="end" fontSize="11" fill="var(--danger-ink)" fontFamily="var(--font-mono)">
            effective {effectiveK.toFixed(1)}σ (overwritten)
          </text>
        </>
      )}
      <text x={W - PAD.r - 4} y={userY - 6 + (diverged && Math.abs(userY - effY) < 16 ? 22 : 0)} textAnchor="end" fontSize="11" fill="var(--warm-ink)" fontFamily="var(--font-mono)">
        your threshold {userK.toFixed(1)}σ
      </text>
      {children}
      <title>{label}</title>
      <desc>{`Synthetic power trace with ${N} samples. Triangles at the top mark the true events.`}</desc>
    </svg>
  );
}
