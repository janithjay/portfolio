import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[70vh] items-center gap-10 py-16 lg:grid-cols-2">
      <div>
        <p className="eyebrow">404 · cliff detected</p>
        <h1 className="mt-3 text-step-5">This page is a drop.</h1>
        <p className="mt-4 max-w-[46ch] text-step-1 text-muted">
          My robot isn&apos;t allowed to reverse, and neither are you. Rotate in place and pick a new heading:
        </p>
        <ul className="mt-8 flex flex-wrap gap-3">
          <li>
            <Link href="/" className="btn btn-primary">
              Home <Icon name="arrowRight" size={16} />
            </Link>
          </li>
          <li>
            <Link href="/work" className="btn btn-ghost">
              Case studies
            </Link>
          </li>
          <li>
            <Link href="/work/esp32-autonomous-robot#demo" className="btn btn-ghost">
              Watch the robot do it properly
            </Link>
          </li>
        </ul>
      </div>
      <figure aria-hidden="true" className="card overflow-hidden">
        <svg viewBox="0 0 480 300" className="block h-auto w-full">
          <rect width="480" height="300" fill="var(--surface-2)" />
          <rect x="0" y="0" width="330" height="300" fill="var(--bg-elev)" />
          <line x1="330" y1="0" x2="330" y2="300" stroke="var(--warm)" strokeWidth="2" strokeDasharray="8 6" />
          <text x="346" y="28" fontSize="12" fill="var(--warm-ink)" fontFamily="var(--font-mono)">
            404 / DROP
          </text>
          <g className="robot-404">
            <circle r="26" fill="var(--text)" />
            <line x1="0" y1="0" x2="26" y2="0" stroke="var(--accent)" strokeWidth="4" />
            <circle className="cliff-led" cx="34" cy="-16" r="5" fill="var(--accent)" />
            <circle className="cliff-led" cx="34" cy="16" r="5" fill="var(--accent)" />
          </g>
          <text x="20" y="282" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">
            reverse moves: 0
          </text>
        </svg>
      </figure>
    </div>
  );
}
