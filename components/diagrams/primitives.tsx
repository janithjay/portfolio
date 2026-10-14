import type { ReactNode } from "react";

/** Small SVG vocabulary for architecture diagrams. Colours come from tokens, so they theme. */

export function DiagramFrame({
  title,
  desc,
  width,
  height,
  children,
  caption,
}: {
  title: string;
  desc: string;
  width: number;
  height: number;
  children: ReactNode;
  caption?: ReactNode;
}) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <figure className="card not-prose my-8 overflow-hidden">
      <div className="overflow-x-auto p-4 sm:p-6" tabIndex={0} role="region" aria-label={`${title} (scrolls sideways on small screens)`}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby={`${id}-t ${id}-d`}
          className="mx-auto block h-auto w-full min-w-[560px]"
          style={{ maxWidth: width }}
        >
          <title id={`${id}-t`}>{title}</title>
          <desc id={`${id}-d`}>{desc}</desc>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--text-muted)" />
            </marker>
            <marker id="arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--accent-ink)" />
            </marker>
          </defs>
          {children}
        </svg>
      </div>
      {caption && <figcaption className="border-t border-line px-5 py-3 text-sm text-muted">{caption}</figcaption>}
    </figure>
  );
}

export function Box({
  x,
  y,
  w,
  h,
  label,
  sub,
  tone = "default",
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  tone?: "default" | "accent" | "warm" | "muted" | "danger";
}) {
  const stroke = {
    default: "var(--line-strong)",
    accent: "var(--accent-ink)",
    warm: "var(--warm)",
    muted: "var(--line)",
    danger: "var(--danger-ink)",
  }[tone];
  const fill = tone === "accent" ? "var(--accent-soft)" : tone === "muted" ? "transparent" : "var(--bg-elev)";
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" fill={fill} stroke={stroke} strokeDasharray={tone === "muted" || tone === "danger" ? "5 4" : undefined} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 3 : h / 2 + 5)} textAnchor="middle" fontSize="14" fill="var(--text)" fontFamily="var(--font-sans)" fontWeight="550">
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 15} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">
          {sub}
        </text>
      )}
    </g>
  );
}

export function Arrow({ d, accent, label, lx, ly, dashed }: { d: string; accent?: boolean; label?: string; lx?: number; ly?: number; dashed?: boolean }) {
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={accent ? "var(--accent-ink)" : "var(--text-muted)"}
        strokeWidth="1.5"
        strokeDasharray={dashed ? "4 4" : undefined}
        markerEnd={`url(#${accent ? "arrow-accent" : "arrow"})`}
      />
      {label && lx !== undefined && ly !== undefined && (
        <text x={lx} y={ly} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">
          {label}
        </text>
      )}
    </g>
  );
}

export function Label({ x, y, children, anchor = "start", tone = "muted" }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; tone?: "muted" | "warm" | "danger" | "accent" }) {
  const fill = { muted: "var(--text-muted)", warm: "var(--warm-ink)", danger: "var(--danger-ink)", accent: "var(--accent-ink)" }[tone];
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize="11" fill={fill} fontFamily="var(--font-mono)" letterSpacing="0.06em">
      {children}
    </text>
  );
}
