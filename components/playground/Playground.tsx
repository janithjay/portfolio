"use client";

import { useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { highlight } from "sugar-high";
import playground from "@/content/playground.json";
import { Icon } from "@/components/ui/Icon";
import { isHex } from "@/lib/color";
import { FRAMEWORKS, generateCode, type Framework, type Packages } from "@/lib/playground-code";
import { applySiteTokens, getSiteTokens, resolvedScheme } from "@/lib/prefs";
import {
  ACCENT_PRESETS,
  DEFAULT_TOKENS,
  FONT_STACKS,
  isDefaultTokens,
  scopedVars,
  tokenReport,
  type Density,
  type FontChoice,
  type Scheme,
  type ThemeTokens,
} from "@/lib/theme";
import { IdentityPreview } from "./IdentityPreview";

export default function Playground() {
  // Client-only (lazy-loaded after mount): start from the site's current look so playground and page agree.
  const [saved] = useState(getSiteTokens);
  const [tokens, setTokens] = useState<ThemeTokens>(saved ?? DEFAULT_TOKENS);
  const [scheme, setScheme] = useState<Scheme>(resolvedScheme);
  const [fw, setFw] = useState<Framework>("react");
  const [applied, setApplied] = useState(!!saved);
  const [hexDraft, setHexDraft] = useState((saved ?? DEFAULT_TOKENS).accent);
  const id = useId();

  const set = <K extends keyof ThemeTokens>(key: K, value: ThemeTokens[K]) => {
    setTokens((t) => ({ ...t, [key]: value }));
    setApplied(false);
  };

  const style = useMemo(() => scopedVars(tokens, scheme) as CSSProperties, [tokens, scheme]);
  const report = tokenReport(tokens.accent, scheme);
  const code = generateCode(fw, tokens, scheme, playground.packages as Packages);

  return (
    <div className="card overflow-hidden">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Preview */}
        <div className="tech-grid relative border-b border-line p-4 sm:p-8 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="eyebrow">Live preview · mock auth</p>
            <Segmented
              label="Component colour scheme"
              value={scheme}
              onChange={(v) => setScheme(v as Scheme)}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
            />
          </div>
          <div
            style={style}
            className="mx-auto w-full max-w-[26rem] rounded-[var(--radius-lg)] border border-line bg-surface text-text shadow-[0_30px_60px_-30px_rgb(0_0_0/0.45)]"
          >
            <div style={{ padding: "calc(1.75rem * var(--density))" }}>
              <IdentityPreview />
            </div>
          </div>
        </div>

        {/* Theme editor */}
        <form className="space-y-6 p-[var(--space-card)]" onSubmit={(e) => e.preventDefault()} aria-label="Theme editor">
          <fieldset>
            <legend className="eyebrow mb-3">Accent</legend>
            <div className="flex flex-wrap items-center gap-2">
              {ACCENT_PRESETS.map((p) => (
                <label key={p.value} className="relative cursor-pointer" title={p.name}>
                  <input
                    type="radio"
                    name={`${id}-accent`}
                    value={p.value}
                    checked={tokens.accent.toUpperCase() === p.value}
                    onChange={() => {
                      set("accent", p.value);
                      setHexDraft(p.value);
                    }}
                    className="peer sr-only"
                  />
                  <span
                    className="block size-9 rounded-full border-2 border-transparent ring-offset-2 ring-offset-surface peer-checked:ring-2 peer-checked:ring-text peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent-ink"
                    style={{ background: p.value }}
                  />
                  <span className="sr-only">{p.name}</span>
                </label>
              ))}
              <label className="relative size-9 cursor-pointer overflow-hidden rounded-full border border-line-strong" title="Custom colour">
                <span className="sr-only">Custom accent colour</span>
                <input
                  type="color"
                  value={tokens.accent.length === 7 ? tokens.accent.toLowerCase() : "#c6f432"}
                  onChange={(e) => {
                    set("accent", e.target.value.toUpperCase());
                    setHexDraft(e.target.value.toUpperCase());
                  }}
                  className="absolute -inset-2 size-14 cursor-pointer"
                />
              </label>
              <label className="sr-only" htmlFor={`${id}-hex`}>
                Accent hex value
              </label>
              <input
                id={`${id}-hex`}
                value={hexDraft}
                onChange={(e) => {
                  const v = e.target.value;
                  setHexDraft(v);
                  if (isHex(v) && v.length === 7) set("accent", v.toUpperCase());
                }}
                spellCheck={false}
                className="h-9 w-24 rounded-[var(--radius-sm)] border border-line bg-bg px-2 font-mono text-sm uppercase"
              />
            </div>
            <ContrastReport report={report} />
          </fieldset>

          <div>
            <label htmlFor={`${id}-radius`} className="eyebrow flex justify-between">
              <span>Radius</span>
              <span className="normal-case tracking-normal text-text">{tokens.radius}px</span>
            </label>
            <input
              id={`${id}-radius`}
              type="range"
              min={0}
              max={24}
              step={1}
              value={tokens.radius}
              onChange={(e) => set("radius", Number(e.target.value))}
              className="range mt-1 w-full"
            />
          </div>

          <div>
            <label htmlFor={`${id}-font`} className="eyebrow mb-2 block">
              Heading font
            </label>
            <select
              id={`${id}-font`}
              value={tokens.font}
              onChange={(e) => set("font", e.target.value as FontChoice)}
              className="h-11 w-full rounded-[var(--radius)] border border-line bg-bg px-3 text-sm"
            >
              {(Object.keys(FONT_STACKS) as FontChoice[]).map((f) => (
                <option key={f} value={f}>
                  {FONT_STACKS[f].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="eyebrow mb-2" id={`${id}-density`}>
              Density
            </p>
            <Segmented
              labelledBy={`${id}-density`}
              value={tokens.density}
              onChange={(v) => set("density", v as Density)}
              options={[
                { value: "compact", label: "Compact" },
                { value: "comfortable", label: "Comfy" },
                { value: "spacious", label: "Spacious" },
              ]}
              full
            />
          </div>

          <div className="flex flex-wrap gap-2 border-t border-line pt-5">
            <button
              type="button"
              className="btn btn-primary flex-1"
              onClick={() => {
                applySiteTokens(isDefaultTokens(tokens) ? null : tokens);
                setApplied(true);
              }}
            >
              {applied ? (
                <>
                  <Icon name="check" size={16} /> Applied to site
                </>
              ) : (
                "Apply to this site"
              )}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setTokens(DEFAULT_TOKENS);
                setHexDraft(DEFAULT_TOKENS.accent);
                applySiteTokens(null);
                setApplied(false);
              }}
            >
              Reset
            </button>
          </div>
          <p className="text-xs text-muted">
            The site runs on the same tokens. Applying saves them in this browser only.
          </p>
        </form>
      </div>

      <CodePanel fw={fw} setFw={setFw} code={code} />
    </div>
  );
}

function ContrastReport({ report }: { report: ReturnType<typeof tokenReport> }) {
  const row = (label: string, ratio: number, note?: string) => (
    <li className="flex items-center justify-between gap-2">
      <span>{label}</span>
      <span className={ratio >= 4.5 ? "text-text" : "text-danger"}>
        {ratio.toFixed(1)}:1 {ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "fails AA"}
        {note && <span className="text-muted"> · {note}</span>}
      </span>
    </li>
  );
  return (
    <ul className="mt-3 space-y-1 rounded-[var(--radius)] border border-line bg-bg-elev p-3 font-mono text-[0.72rem] text-muted" aria-label="Contrast check">
      {row("Button text", report.textOnAccent)}
      {row("Links on background", report.inkOnBg, report.adjusted ? `auto-darkened to ${report.ink}` : undefined)}
    </ul>
  );
}

function Segmented({
  label,
  labelledBy,
  value,
  options,
  onChange,
  full,
}: {
  label?: string;
  labelledBy?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  full?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-labelledby={labelledBy}
      className={`inline-flex rounded-full border border-line bg-bg-elev p-0.5 font-mono text-xs ${full ? "flex w-full" : ""}`}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-9 rounded-full px-3 transition-colors ${full ? "flex-1" : ""} ${value === o.value ? "bg-text text-bg" : "text-muted hover:text-text"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function CodePanel({ fw, setFw, code }: { fw: Framework; setFw: (f: Framework) => void; code: string }) {
  const [copied, setCopied] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const html = useMemo(() => highlight(code), [code]);
  const current = FRAMEWORKS.find((f) => f.id === fw)!;

  const onKey = (e: KeyboardEvent, i: number) => {
    const n = FRAMEWORKS.length;
    const next = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    setFw(FRAMEWORKS[next]!.id);
    tabs.current[next]?.focus();
  };

  return (
    <div className="border-t border-line">
      <div className="flex flex-wrap items-center justify-between gap-2 px-[var(--space-card)] pt-3">
        <div role="tablist" aria-label="Framework" className="-mb-px flex overflow-x-auto">
          {FRAMEWORKS.map((f, i) => (
            <button
              key={f.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`pg-tab-${f.id}`}
              aria-selected={fw === f.id}
              aria-controls="pg-code"
              tabIndex={fw === f.id ? 0 : -1}
              onClick={() => setFw(f.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`min-h-11 whitespace-nowrap border-b-2 px-3 text-sm transition-colors ${fw === f.id ? "border-accent-ink text-text" : "border-transparent text-muted hover:text-text"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-ghost min-h-9 px-3"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            } catch {
              /* clipboard blocked: the code is still selectable */
            }
          }}
        >
          <Icon name={copied ? "check" : "copy"} size={15} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div role="tabpanel" id="pg-code" aria-labelledby={`pg-tab-${fw}`} className="p-[var(--space-card)] pt-3">
        <p className="mb-2 font-mono text-xs text-muted">
          {current.file} · illustrative API in the style of the SDK, updates live with your theme
        </p>
        <pre className="code-block max-h-[26rem]" tabIndex={0} aria-label={`${current.label} integration code`}>
          <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      </div>
    </div>
  );
}
