"use client";

import { useId, useMemo, useRef, useState, type PointerEvent } from "react";
import { CALIBRATED_K, CALIBRATION_END, DEFAULT_K, detect, makeTrace, scales, score, H } from "@/lib/demos/power-trace";
import { TraceChart } from "./TraceChart";

const MIN_K = 1;
const MAX_K = 5;

export default function PowerTraceDemo() {
  const trace = useMemo(() => makeTrace(), []);
  const [k, setK] = useState(DEFAULT_K);
  const [buggy, setBuggy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const svgWrap = useRef<HTMLDivElement>(null);
  const id = useId();

  const detections = useMemo(() => detect(trace, k, buggy), [trace, k, buggy]);
  const s = score(trace, detections);
  const effectiveK = buggy ? CALIBRATED_K : k;
  const ignored = buggy && Math.abs(k - CALIBRATED_K) > 0.05;

  const setFromPointer = (e: PointerEvent) => {
    const el = svgWrap.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const v = scales(trace).yInv(py);
    const nextK = (v - trace.baseline) / trace.sigma;
    setK(Math.round(Math.min(MAX_K, Math.max(MIN_K, nextK)) * 10) / 10);
  };

  const summary = `${detections.length} detections: ${s.tp} correct, ${s.fp} false alarm${s.fp === 1 ? "" : "s"}, ${s.fn} missed.`;

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-[var(--space-card)] py-3">
        <p className="eyebrow">Threshold lab · synthetic data</p>
        <div role="group" aria-label="Code version" className="inline-flex rounded-full border border-line bg-bg-elev p-0.5 font-mono text-xs">
          {[
            { v: false, label: "Fixed code" },
            { v: true, label: "Reproduce bug" },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={buggy === o.v}
              onClick={() => setBuggy(o.v)}
              className={`min-h-9 rounded-full px-3 transition-colors ${buggy === o.v ? (o.v ? "bg-danger text-bg" : "bg-text text-bg") : "text-muted hover:text-text"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-[var(--space-card)]">
        <div
          ref={svgWrap}
          className={`relative select-none ${dragging ? "cursor-grabbing" : "cursor-ns-resize"}`}
          onPointerDown={(e) => {
            // touch keeps native scrolling; the slider below is the touch control
            if (e.pointerType === "touch") return;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            setDragging(true);
            setFromPointer(e);
          }}
          onPointerMove={(e) => dragging && setFromPointer(e)}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
        >
          <TraceChart
            trace={trace}
            userK={k}
            effectiveK={effectiveK}
            detections={detections}
            buggy={buggy}
            label={`Power trace chart. Your threshold ${k.toFixed(1)} sigma${ignored ? `, but the code is using ${CALIBRATED_K} sigma after calibration` : ""}. ${summary}`}
          />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label htmlFor={`${id}-k`} className="flex items-baseline justify-between text-sm">
              <span>Detection threshold</span>
              <span className="font-mono text-warm-ink">{k.toFixed(1)}σ above baseline</span>
            </label>
            <input
              id={`${id}-k`}
              type="range"
              min={MIN_K}
              max={MAX_K}
              step={0.1}
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              aria-valuetext={`${k.toFixed(1)} sigma`}
              className="range mt-2 w-full"
            />
            <p className="mt-1 text-xs text-muted">Drag the slider (or drag on the chart with a mouse). Triangles mark the true events.</p>
          </div>
          <dl className="grid grid-cols-4 gap-px overflow-hidden rounded-[var(--radius)] border border-line bg-line text-center font-mono">
            {[
              ["found", s.tp],
              ["false", s.fp],
              ["missed", s.fn],
              ["recall", `${Math.round(s.recall * 100)}%`],
            ].map(([label, value]) => (
              <div key={label} className="bg-surface px-3 py-2">
                <dt className="text-[0.65rem] uppercase tracking-[0.08em] text-muted">{label}</dt>
                <dd className="text-lg tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p role="status" aria-live="polite" className={`mt-4 rounded-[var(--radius)] border px-4 py-3 text-sm ${ignored ? "border-danger/50 bg-danger/10" : "border-line bg-bg-elev"}`}>
          {ignored ? (
            <>
              <strong className="text-danger">Bug reproduced.</strong> You set {k.toFixed(1)}σ, but after sample {CALIBRATION_END}{" "}
              calibration overwrote <code className="font-mono">config.threshold</code> with {CALIBRATED_K}σ. Move the slider
              all you like, the detections won&apos;t change. {summary}
            </>
          ) : buggy ? (
            <>Bug mode is on, but your threshold happens to match the calibrated value. Drag it away from {CALIBRATED_K}σ. {summary}</>
          ) : (
            <>
              <strong>Fixed.</strong> Calibration owns the baseline, you own the margin. {summary}
            </>
          )}
        </p>
      </div>
    </div>
  );
}

