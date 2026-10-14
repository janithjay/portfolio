"use client";

import { setMode, type Mode } from "@/lib/prefs";

export function ModeLink({ to, children, className = "link" }: { to: Mode; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => setMode(to)}
    >
      {children}
    </button>
  );
}
