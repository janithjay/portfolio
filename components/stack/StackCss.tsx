import { LAYERS, type LayerId } from "@/lib/stack";

/**
 * Server-rendered exploded stack in pure CSS 3D: the no-JS version, and what you see
 * for the first moments before the WebGL scene takes over. --explode (0–1) is set by
 * StackStage on scroll; without JS it stays at its default.
 */
export function StackCss() {
  return (
    <div className="iso-wrap">
      <div className="iso">
        {LAYERS.map((l, i) => (
          <div key={l.id} className="iso-plate" style={{ ["--i" as string]: i }}>
            <Art id={l.id} />
            <span className="iso-label">
              {l.code} / {l.name.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Art({ id }: { id: LayerId }) {
  const common = { viewBox: "0 0 440 300", className: "absolute inset-0 h-full w-full", preserveAspectRatio: "none" as const };
  if (id === "ui")
    return (
      <svg {...common}>
        <rect x="24" y="24" width="240" height="220" rx="10" fill="var(--bg)" stroke="var(--line-strong)" />
        <rect x="46" y="60" width="140" height="14" rx="3" fill="var(--text)" />
        <rect x="46" y="92" width="196" height="24" rx="5" fill="none" stroke="var(--line-strong)" />
        <rect x="46" y="126" width="196" height="24" rx="5" fill="none" stroke="var(--line-strong)" />
        <rect x="46" y="166" width="196" height="26" rx="5" fill="var(--accent)" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x="290" y={30 + i * 34} width="120" height="22" rx="11" fill="none" stroke={i === 0 ? "var(--accent)" : "var(--line-strong)"} />
        ))}
      </svg>
    );
  if (id === "api")
    return (
      <svg {...common}>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x="28" y={30 + i * 40} width="60" height="22" rx="4" fill={i === 1 ? "var(--accent)" : "var(--surface-2)"} />
            <rect x="100" y={37 + i * 40} width={110 + ((i * 37) % 60)} height="8" rx="2" fill="var(--text-muted)" />
          </g>
        ))}
        <circle cx="330" cy="70" r="22" fill="var(--bg)" stroke="var(--line-strong)" />
        <circle cx="290" cy="160" r="22" fill="var(--bg)" stroke="var(--line-strong)" />
        <circle cx="380" cy="160" r="22" fill="var(--bg)" stroke="var(--line-strong)" />
        <circle cx="335" cy="240" r="22" fill="var(--accent)" />
        <path d="M330 92 L290 138 M352 80 L380 138 M290 182 L335 218 M380 182 L335 218" stroke="var(--line-strong)" strokeDasharray="5 4" />
      </svg>
    );
  if (id === "ml")
    return (
      <svg {...common}>
        <line x1="24" x2="290" y1="120" y2="120" stroke="var(--warm)" strokeDasharray="7 5" strokeWidth="1.5" />
        <path
          d="M24 160 L50 156 L66 164 L82 70 L92 160 L120 154 L140 162 L152 128 L160 158 L190 156 L206 60 L214 160 L240 154 L258 66 L266 158 L290 156"
          fill="none"
          stroke="var(--text)"
          strokeWidth="2"
        />
        <rect x="306" y="40" width="110" height="200" fill="none" stroke="var(--line-strong)" />
        {Array.from({ length: 18 }, (_, i) => (
          <circle key={i} cx={316 + i * 5.4} cy={60 + (i / 18) ** 2 * 160 + ((i * 13) % 9)} r="3" fill={i % 6 === 0 ? "var(--warm)" : "var(--accent)"} />
        ))}
      </svg>
    );
  return (
    <svg {...common}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M60 ${70 + i * 28} H110 M210 ${70 + i * 28} H260 L280 ${60 + i * 34} H320`} stroke="var(--line-strong)" strokeWidth="3" fill="none" />
      ))}
      <rect x="110" y="56" width="100" height="170" rx="6" fill="var(--bg)" stroke="var(--text)" strokeWidth="2" />
      <text x="160" y="140" textAnchor="middle" fontSize="20" fontWeight="760" fill="var(--text)" fontFamily="var(--font-display)">
        ESP32
      </text>
      <circle cx="372" cy="140" r="26" fill="var(--text)" />
      <path d="M372 140 L350 70 A 74 74 0 0 1 394 70 Z" fill="var(--accent)" opacity="0.3" />
    </svg>
  );
}
