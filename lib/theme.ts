import { contrast, ensureContrast, onColor } from "./color";

/**
 * The token system. The site and the identity playground share it,
 * the same way the SDK components share one theme contract.
 */

export type Scheme = "light" | "dark";
export type SchemePreference = Scheme | "system";
export type FontChoice = "editorial" | "grotesk" | "mono" | "system";
export type Density = "compact" | "comfortable" | "spacious";

export interface ThemeTokens {
  accent: string;
  radius: number; // px
  font: FontChoice;
  density: Density;
}

export const DEFAULT_TOKENS: ThemeTokens = {
  accent: "#3DFFA2",
  radius: 10,
  font: "editorial",
  density: "comfortable",
};

export const ACCENT_PRESETS = [
  { name: "Signal", value: "#3DFFA2" },
  { name: "Amber", value: "#FFB547" },
  { name: "Ion", value: "#5AB8FF" },
  { name: "Violet", value: "#A88BFF" },
  { name: "Coral", value: "#FF7A6B" },
] as const;

/** Surface colours per scheme. Mirrors the defaults in app/globals.css. */
export const SCHEME_SURFACES: Record<Scheme, { bg: string; surface: string; text: string; muted: string; line: string }> = {
  dark: { bg: "#070B14", surface: "#0E1424", text: "#E8ECF4", muted: "#A0ABC0", line: "#1F2A42" },
  light: { bg: "#F5F4EF", surface: "#FFFFFF", text: "#0A1020", muted: "#4A5468", line: "#D6D4CA" },
};

export const FONT_STACKS: Record<FontChoice, { heading: string; weight: string; tracking: string; label: string }> = {
  editorial: { heading: "var(--font-serif)", weight: "400", tracking: "-0.01em", label: "Editorial serif" },
  grotesk: { heading: "var(--font-sans)", weight: "650", tracking: "-0.035em", label: "Tight grotesk" },
  mono: { heading: "var(--font-mono)", weight: "600", tracking: "-0.04em", label: "Mono" },
  system: { heading: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", weight: "650", tracking: "-0.02em", label: "System UI" },
};

export const DENSITY_SCALE: Record<Density, number> = { compact: 0.8, comfortable: 1, spacious: 1.2 };

/** Scheme-dependent accent variables, contrast-corrected against that scheme's surfaces. */
export function accentVars(accent: string, scheme: Scheme): Record<string, string> {
  const s = SCHEME_SURFACES[scheme];
  const ink = ensureContrast(accent, s.bg, 5);
  return {
    "--accent": accent,
    "--accent-ink": ink,
    "--on-accent": onColor(accent),
    "--accent-soft": `color-mix(in oklab, ${accent} ${scheme === "dark" ? 14 : 18}%, transparent)`,
  };
}

/** Scheme-independent variables. */
export function sharedVars(tokens: ThemeTokens): Record<string, string> {
  const f = FONT_STACKS[tokens.font];
  return {
    "--radius": `${tokens.radius}px`,
    "--font-heading": f.heading,
    "--heading-weight": f.weight,
    "--heading-tracking": f.tracking,
    "--density": String(DENSITY_SCALE[tokens.density]),
  };
}

export function tokenReport(accent: string, scheme: Scheme) {
  const s = SCHEME_SURFACES[scheme];
  const v = accentVars(accent, scheme);
  return {
    inkOnBg: contrast(v["--accent-ink"]!, s.bg),
    textOnAccent: contrast(v["--on-accent"]!, accent),
    adjusted: v["--accent-ink"]!.toUpperCase() !== accent.toUpperCase(),
    ink: v["--accent-ink"]!,
  };
}

const decl = (vars: Record<string, string>) =>
  Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");

/**
 * Serialise tokens into a stylesheet that overrides the defaults for both schemes.
 * Stored in localStorage and injected before first paint by the theme script.
 */
export function tokensToCss(tokens: ThemeTokens): string {
  const light = decl(accentVars(tokens.accent, "light"));
  const dark = decl(accentVars(tokens.accent, "dark"));
  return [
    `:root{${decl(sharedVars(tokens))};${light}}`,
    `@media (prefers-color-scheme:dark){:root:not([data-theme=light]){${dark}}}`,
    `:root[data-theme=dark]{${dark}}`,
  ].join("");
}

export function isDefaultTokens(t: ThemeTokens): boolean {
  return (
    t.accent.toUpperCase() === DEFAULT_TOKENS.accent &&
    t.radius === DEFAULT_TOKENS.radius &&
    t.font === DEFAULT_TOKENS.font &&
    t.density === DEFAULT_TOKENS.density
  );
}

export const STORAGE = {
  mode: "jj:mode",
  scheme: "jj:scheme",
  tokens: "jj:tokens",
  tokensCss: "jj:tokens-css",
  hintSeen: "jj:palette-hint",
} as const;

/** Full variable set for rendering a component in a given scheme, independent of the page. */
export function scopedVars(tokens: ThemeTokens, scheme: Scheme): Record<string, string> {
  const s = SCHEME_SURFACES[scheme];
  const dark = scheme === "dark";
  return {
    "--bg": s.bg,
    "--bg-elev": s.surface,
    "--surface": s.surface,
    "--surface-2": dark ? "#131B2E" : "#ECEBE4",
    "--line": s.line,
    "--line-strong": dark ? "#2F3D5C" : "#B9B6A8",
    "--text": s.text,
    "--text-muted": s.muted,
    "--danger-ink": dark ? "#FF8A80" : "#B42318",
    "--warm-ink": dark ? "#FFB547" : "#935800",
    "--radius-sm": `calc(${tokens.radius}px * 0.6)`,
    "--radius-lg": `calc(${tokens.radius}px * 1.6)`,
    colorScheme: scheme,
    ...sharedVars(tokens),
    ...accentVars(tokens.accent, scheme),
  };
}
