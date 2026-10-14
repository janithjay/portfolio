import Link from "next/link";
import { site } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { PaletteButton } from "@/components/palette/Overlays";
import { ModeSwitch } from "./ModeSwitch";
import { NavLinks } from "./NavLinks";
import { SchemeToggle } from "./SchemeToggle";

export function Header() {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70">
      <div className="container-x flex h-16 items-center gap-2 sm:gap-3">
        <Link href="/" className="group mr-auto flex items-center gap-2.5" aria-label={`${site.name}, home`}>
          <Monogram />
          <span className="hidden font-mono text-[0.8rem] tracking-[0.04em] text-muted transition-colors group-hover:text-text sm:inline">
            {site.handle.toLowerCase()} / {site.name.toLowerCase()}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <NavLinks items={site.nav} className="flex items-center" />
        </nav>

        <ModeSwitch />
        <PaletteButton />
        <SchemeToggle />

        {/* Mobile menu works without JavaScript */}
        <details className="group relative md:hidden">
          <summary
            className="grid size-10 cursor-pointer list-none place-items-center rounded-full text-muted hover:text-text [&::-webkit-details-marker]:hidden"
            aria-label="Menu"
          >
            <Icon name="menu" className="group-open:hidden" />
            <Icon name="close" className="hidden group-open:block" />
          </summary>
          <nav
            aria-label="Mobile"
            className="absolute right-0 top-12 w-56 rounded-[var(--radius-lg)] border border-line bg-bg-elev p-2 shadow-xl"
          >
            <NavLinks items={site.nav} className="flex flex-col [&_a]:w-full" />
          </nav>
        </details>
      </div>
    </header>
  );
}

export function Monogram({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="var(--text)" />
      <path d="M12.5 8v11.5a3.5 3.5 0 0 1-6 2.45" fill="none" stroke="var(--bg)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M21 8v11.5a3.5 3.5 0 0 1-6 2.45" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
