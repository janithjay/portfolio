import { DEFAULT_K, detect, makeTrace, score } from "@/lib/demos/power-trace";
import { TraceChart } from "./TraceChart";

export function PowerTraceStatic() {
  const trace = makeTrace();
  const detections = detect(trace, DEFAULT_K, false);
  const s = score(trace, detections);
  return (
    <figure className="card overflow-hidden p-[var(--space-card)]">
      <TraceChart
        trace={trace}
        userK={DEFAULT_K}
        effectiveK={DEFAULT_K}
        detections={detections}
        buggy={false}
        label={`Power trace with threshold ${DEFAULT_K} sigma: ${detections.length} detections, ${s.tp} correct, ${s.fp} false alarms, ${s.fn} missed.`}
      />
      <figcaption className="mt-3 text-sm text-muted">
        Illustrative synthetic data. Threshold {DEFAULT_K}σ: {s.tp} of {trace.events.length} events found, {s.fp} false
        alarms. <span className="js-only">Loading the interactive version…</span>
        <noscript>Turn on JavaScript to drag the threshold and reproduce the bug.</noscript>
      </figcaption>
    </figure>
  );
}
