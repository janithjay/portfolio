"use client";

import { STORAGE, tokensToCss, type SchemePreference, type ThemeTokens } from "./theme";

export type Mode = "skim" | "deep";

const EVT = "jj:prefs";

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: preference lasts for this page view only */
  }
}

export function subscribePrefs(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}
const emit = () => window.dispatchEvent(new Event(EVT));

function withTransition(update: () => void) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!reduce && doc.startViewTransition) doc.startViewTransition(update);
  else update();
}

/* ---------- reading mode ---------- */

export function getMode(): Mode {
  return document.documentElement.dataset.mode === "skim" ? "skim" : "deep";
}

export function setMode(mode: Mode) {
  withTransition(() => {
    document.documentElement.dataset.mode = mode;
  });
  safeSet(STORAGE.mode, mode);
  const url = new URL(window.location.href);
  url.searchParams.set("mode", mode);
  window.history.replaceState(null, "", url);
  emit();
}

/** Keep ?mode= in the address bar so the current view can be shared. */
export function syncModeToUrl() {
  const url = new URL(window.location.href);
  const stored = safeGet(STORAGE.mode);
  const current = getMode();
  if (!stored && !url.searchParams.has("mode")) return;
  if (url.searchParams.get("mode") !== current) {
    url.searchParams.set("mode", current);
    window.history.replaceState(null, "", url);
  }
}

/* ---------- colour scheme ---------- */

export function getScheme(): SchemePreference {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "system";
}

export function setScheme(pref: SchemePreference) {
  withTransition(() => {
    if (pref === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = pref;
  });
  safeSet(STORAGE.scheme, pref === "system" ? null : pref);
  emit();
}

export function resolvedScheme(): "light" | "dark" {
  const pref = getScheme();
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/* ---------- design tokens ---------- */

export function getSiteTokens(): ThemeTokens | null {
  const raw = safeGet(STORAGE.tokens);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ThemeTokens;
  } catch {
    return null;
  }
}

export function applySiteTokens(tokens: ThemeTokens | null) {
  const css = tokens ? tokensToCss(tokens) : "";
  withTransition(() => {
    let el = document.getElementById("jj-tokens");
    if (!css) {
      el?.remove();
      return;
    }
    if (!el) {
      el = document.createElement("style");
      el.id = "jj-tokens";
      document.head.appendChild(el);
    }
    el.textContent = css;
  });
  safeSet(STORAGE.tokens, tokens ? JSON.stringify(tokens) : null);
  safeSet(STORAGE.tokensCss, css || null);
  emit();
}

export function getFlag(key: string) {
  return safeGet(key);
}
export function setFlag(key: string, value: string) {
  safeSet(key, value);
}
