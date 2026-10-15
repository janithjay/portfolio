"use client";

import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { getFlag, setFlag } from "@/lib/prefs";
import { STORAGE } from "@/lib/theme";
import type { PaletteItem } from "./types";

const CommandPalette = lazy(() => import("./CommandPalette"));
const AskPanel = lazy(() => import("@/components/ask/AskPanel"));

export const OPEN_PALETTE = "jj:open-palette";
export const OPEN_ASK = "jj:open-ask";

const preloadPalette = () => void import("./CommandPalette");

/** Global, lazily-loaded overlays: ⌘K palette, first-visit hint, Ask panel. */
export function Overlays({ items }: { items: PaletteItem[] }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteLoaded, setPaletteLoaded] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [askLoaded, setAskLoaded] = useState(false);
  const [hint, setHint] = useState(false);

  const openPalette = useCallback(() => {
    setPaletteLoaded(true);
    setPaletteOpen(true);
    setHint(false);
    setFlag(STORAGE.hintSeen, "1");
  }, []);

  const openAsk = useCallback(() => {
    setAskLoaded(true);
    setAskOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (paletteOpen) setPaletteOpen(false);
        else openPalette();
      }
    };
    const onOpen = () => openPalette();
    const onAsk = () => openAsk();
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE, onOpen);
    window.addEventListener(OPEN_ASK, onAsk);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE, onOpen);
      window.removeEventListener(OPEN_ASK, onAsk);
    };
  }, [openPalette, openAsk, paletteOpen]);

  useEffect(() => {
    if (getFlag(STORAGE.hintSeen)) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse) return; // no hardware keyboard: the hint would be noise
    const t = window.setTimeout(() => setHint(true), 2500);
    return () => window.clearTimeout(t);
  }, []);

  const dismissHint = () => {
    setHint(false);
    setFlag(STORAGE.hintSeen, "1");
  };

  return (
    <>
      {hint && (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-[var(--radius)] border border-line bg-bg-elev py-1.5 pl-4 pr-1.5 text-sm shadow-lg shadow-black/10"
        >
          <span>
            Tip: press <kbd className="kbd">⌘</kbd> <kbd className="kbd">K</kbd> or <kbd className="kbd">Ctrl</kbd>{" "}
            <kbd className="kbd">K</kbd> to jump anywhere
          </span>
          <button type="button" className="btn btn-ghost min-h-8 px-3 py-1" onClick={openPalette}>
            Try it
          </button>
          <button
            type="button"
            aria-label="Dismiss tip"
            className="grid size-8 place-items-center rounded-[var(--radius)] text-muted hover:text-text"
            onClick={dismissHint}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {paletteLoaded && (
        <Suspense fallback={null}>
          <CommandPalette
            open={paletteOpen}
            onOpenChange={setPaletteOpen}
            items={items}
            onAsk={() => {
              setPaletteOpen(false);
              openAsk();
            }}
          />
        </Suspense>
      )}
      {askLoaded && (
        <Suspense fallback={null}>
          <AskPanel open={askOpen} onOpenChange={setAskOpen} />
        </Suspense>
      )}
    </>
  );
}

export function PaletteButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE))}
      onPointerEnter={preloadPalette}
      onFocus={preloadPalette}
      className="js-only hidden min-h-10 items-center gap-2 rounded-[var(--radius)] border border-line px-3 text-sm sm:inline-flex text-muted transition-colors hover:border-line-strong hover:text-text"
      aria-label="Open command palette"
      aria-keyshortcuts="Meta+K Control+K"
    >
      <Icon name="search" size={16} />
      <span className="hidden lg:inline">Jump to</span>
      <kbd className="kbd hidden sm:inline-flex">⌘K</kbd>
    </button>
  );
}

export function AskButton({ className = "btn btn-ghost", children }: { className?: string; children?: React.ReactNode }) {
  return (
    <button type="button" className={`js-only ${className}`} onClick={() => window.dispatchEvent(new Event(OPEN_ASK))}>
      {children ?? "Ask about me"}
    </button>
  );
}
