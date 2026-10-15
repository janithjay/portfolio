"use client";

import { useSyncExternalStore } from "react";
import { getScheme, setScheme, subscribePrefs } from "@/lib/prefs";
import type { SchemePreference } from "@/lib/theme";
import { Icon } from "@/components/ui/Icon";

const NEXT: Record<SchemePreference, SchemePreference> = { system: "light", light: "dark", dark: "system" };
const ICON = { system: "monitor", light: "sun", dark: "moon" } as const;

export function SchemeToggle() {
  const scheme = useSyncExternalStore(subscribePrefs, getScheme, () => "system" as SchemePreference);
  return (
    <button
      type="button"
      onClick={() => setScheme(NEXT[scheme])}
      className="js-only inline-grid size-10 place-items-center rounded-[var(--radius)] text-muted transition-colors hover:bg-surface-2 hover:text-text"
      aria-label={`Colour theme: ${scheme}. Switch to ${NEXT[scheme]}.`}
      title={`Theme: ${scheme}`}
    >
      <Icon name={ICON[scheme]} />
    </button>
  );
}
