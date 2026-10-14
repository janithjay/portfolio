import { gaussian, mulberry32 } from "./rng";

/**
 * Illustrative synthetic power trace for the threshold demo.
 * Not real project data: a drifting noise floor with injected events of
 * different heights, so the threshold trade-off is visible.
 */

export const N = 480;
export const CALIBRATION_END = 80;
/** The value the buggy calibration wrote into config.threshold (in σ units). */
export const CALIBRATED_K = 3.2;
/** Starting position of the threshold slider (σ units). */
export const DEFAULT_K = 2.2;

export interface Trace {
  samples: number[];
  events: { at: number; height: number }[];
  baseline: number;
  sigma: number;
}

export function makeTrace(seed = 7): Trace {
  const rand = mulberry32(seed);
  const samples: number[] = [];
  for (let i = 0; i < N; i++) {
    const drift = 0.35 * Math.sin(i / 70) + 0.15 * Math.sin(i / 23);
    samples.push(10 + drift + gaussian(rand) * 0.45);
  }
  // events after calibration, with deliberately mixed amplitudes
  const heights = [1.6, 3.2, 1.2, 2.4, 4.0, 1.9, 2.8, 1.4, 3.6];
  const events = heights.map((h, j) => ({ at: 105 + j * 41 + Math.floor(rand() * 14), height: h }));
  for (const e of events) {
    for (let d = -3; d <= 3; d++) {
      const idx = e.at + d;
      if (idx >= 0 && idx < N) samples[idx]! += e.height * Math.exp(-(d * d) / 3);
    }
  }
  const cal = samples.slice(0, CALIBRATION_END);
  const baseline = cal.reduce((a, b) => a + b, 0) / cal.length;
  const sigma = Math.sqrt(cal.reduce((a, b) => a + (b - baseline) ** 2, 0) / cal.length);
  return { samples, events, baseline, sigma };
}

/** Threshold in effect at sample i. */
export function effectiveThreshold(trace: Trace, userK: number, buggy: boolean, i: number): number {
  const k = buggy && i >= CALIBRATION_END ? CALIBRATED_K : userK;
  return trace.baseline + k * trace.sigma;
}

export interface Detection {
  start: number;
  peak: number;
  end: number;
}

export function detect(trace: Trace, userK: number, buggy: boolean): Detection[] {
  const out: Detection[] = [];
  let open: Detection | null = null;
  for (let i = CALIBRATION_END; i < N; i++) {
    const above = trace.samples[i]! > effectiveThreshold(trace, userK, buggy, i);
    if (above && !open) open = { start: i, peak: i, end: i };
    if (above && open) {
      open.end = i;
      if (trace.samples[i]! > trace.samples[open.peak]!) open.peak = i;
    }
    if (!above && open) {
      out.push(open);
      open = null;
    }
  }
  if (open) out.push(open);
  return out;
}

export function score(trace: Trace, detections: Detection[]) {
  const matched = new Set<number>();
  let tp = 0;
  let fp = 0;
  for (const d of detections) {
    const hit = trace.events.findIndex((e, idx) => !matched.has(idx) && Math.abs(e.at - d.peak) <= 4);
    if (hit >= 0) {
      matched.add(hit);
      tp++;
    } else fp++;
  }
  const fn = trace.events.length - tp;
  const precision = tp + fp ? tp / (tp + fp) : 1;
  const recall = trace.events.length ? tp / trace.events.length : 1;
  return { tp, fp, fn, precision, recall };
}

/* ---------- chart geometry (shared by SVG fallback and live chart) ---------- */

export const W = 720;
export const H = 260;
export const PAD = { l: 8, r: 8, t: 16, b: 22 };

export function scales(trace: Trace) {
  const min = Math.min(...trace.samples) - 0.5;
  const max = Math.max(...trace.samples) + 0.6;
  const x = (i: number) => PAD.l + (i / (N - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - (v - min) / (max - min)) * (H - PAD.t - PAD.b);
  const yInv = (py: number) => min + (1 - (py - PAD.t) / (H - PAD.t - PAD.b)) * (max - min);
  return { x, y, yInv, min, max };
}

export function tracePath(trace: Trace): string {
  const { x, y } = scales(trace);
  return trace.samples.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
}
