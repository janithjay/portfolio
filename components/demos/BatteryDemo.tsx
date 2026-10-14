"use client";

import { useId, useState } from "react";
import { capacity, DEFAULT_BATTERY, type BatteryInputs } from "@/lib/demos/battery";
import { BatteryChart } from "./BatteryChart";

const FIELDS: { key: keyof BatteryInputs; label: string; min: number; max: number; step: number; unit: string }[] = [
  { key: "cycles", label: "Charge cycles", min: 0, max: 2000, step: 10, unit: "" },
  { key: "temp", label: "Average temperature", min: 10, max: 45, step: 1, unit: "°C" },
  { key: "dod", label: "Depth of discharge", min: 20, max: 100, step: 5, unit: "%" },
  { key: "fast", label: "DC fast charging share", min: 0, max: 100, step: 5, unit: "%" },
];

export default function BatteryDemo({ hfSpace }: { hfSpace?: string }) {
  const [inputs, setInputs] = useState<BatteryInputs>(DEFAULT_BATTERY);
  const [embed, setEmbed] = useState(false);
  const id = useId();
  const cap = capacity(inputs);
  const embedUrl = toEmbedUrl(hfSpace);
  const validSpace = !!embedUrl;
  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-[var(--space-card)] py-3">
          <p className="eyebrow">Capacity explorer · illustrative curve, not the model</p>
          <p className="font-mono text-sm" aria-live="polite">
            Retained capacity: <strong className={cap < 80 ? "text-warm-ink" : "text-accent-ink"}>{cap.toFixed(1)}%</strong>
          </p>
        </div>
        <div className="grid gap-6 p-[var(--space-card)] lg:grid-cols-[1fr_18rem]">
          <BatteryChart inputs={inputs} />
          <div className="space-y-4">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label htmlFor={`${id}-${f.key}`} className="flex justify-between text-sm">
                  <span>{f.label}</span>
                  <span className="font-mono text-muted">
                    {inputs[f.key]}
                    {f.unit}
                  </span>
                </label>
                <input
                  id={`${id}-${f.key}`}
                  type="range"
                  className="range w-full"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={inputs[f.key]}
                  onChange={(e) => setInputs((s) => ({ ...s, [f.key]: Number(e.target.value) }))}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-[var(--space-card)]">
        <p className="text-sm">
          <strong>The real model</strong> runs on Hugging Face.{" "}
          {validSpace ? "It loads only when you ask, to keep this page fast." : "Space link coming soon."}
        </p>
        {validSpace &&
          (embed ? (
            <iframe
              src={embedUrl}
              title="EV battery prediction model on Hugging Face Spaces"
              className="mt-4 h-[640px] w-full rounded-[var(--radius)] border border-line"
              loading="lazy"
              allow="clipboard-write"
            />
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary" onClick={() => setEmbed(true)}>
                Load the live model here
              </button>
              <a className="btn btn-ghost" href={hfSpace} target="_blank" rel="noopener">
                Open on Hugging Face
              </a>
            </div>
          ))}
      </div>
    </div>
  );
}

/** https://huggingface.co/spaces/owner/name → https://owner-name.hf.space (the embeddable host). */
function toEmbedUrl(url?: string): string {
  if (!url) return "";
  const m = /^https:\/\/huggingface\.co\/spaces\/([\w.-]+)\/([\w.-]+)/.exec(url);
  if (m) return `https://${`${m[1]}-${m[2]}`.toLowerCase().replace(/[._]/g, "-")}.hf.space`;
  if (/^https:\/\/[\w-]+\.hf\.space\/?$/.test(url)) return url;
  return "";
}
