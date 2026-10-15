"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { getMode, setMode, subscribePrefs, syncModeToUrl, type Mode } from "@/lib/prefs";

const OPTIONS: { value: Mode; label: string; hint: string }[] = [
  { value: "skim", label: "Skim", hint: "The 30-second version" },
  { value: "deep", label: "Deep", hint: "Case studies, diagrams and trade-offs" },
];

export function ModeSwitch({ compact = false }: { compact?: boolean }) {
  const mode = useSyncExternalStore(subscribePrefs, getMode, () => "deep" as Mode);
  const pathname = usePathname();

  useEffect(() => {
    syncModeToUrl();
  }, [pathname]);

  return (
    <div
      role="radiogroup"
      aria-label="Reading mode"
      className="js-only relative inline-flex items-center rounded-[var(--radius)] border border-line bg-bg-elev p-0.5 font-mono text-[0.75rem]"
    >
      {OPTIONS.map((o) => {
        const active = mode === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={o.hint}
            onClick={() => setMode(o.value)}
            className={`relative min-h-9 rounded-[var(--radius)] px-3 uppercase tracking-[0.08em] transition-colors ${
              active ? "bg-text text-bg" : "text-muted hover:text-text"
            } ${compact ? "px-2.5" : ""}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
