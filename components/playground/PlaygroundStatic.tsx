import type { CSSProperties } from "react";
import { highlight } from "sugar-high";
import playground from "@/content/playground.json";
import { generateCode, type Packages } from "@/lib/playground-code";
import { DEFAULT_TOKENS, scopedVars } from "@/lib/theme";

/** Server-rendered stand-in: same look, no behaviour. Swapped for the live playground on scroll. */
export function PlaygroundStatic() {
  const code = generateCode("react", DEFAULT_TOKENS, "dark", playground.packages as Packages);
  return (
    <div className="card overflow-hidden">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="tech-grid border-b border-line p-4 sm:p-8 lg:border-b-0 lg:border-r">
          <p className="eyebrow mb-4">Live preview · mock auth</p>
          <div
            style={scopedVars(DEFAULT_TOKENS, "dark") as CSSProperties}
            className="mx-auto w-full max-w-[26rem] rounded-[var(--radius-lg)] border border-line bg-surface p-7 text-text"
            aria-hidden="true"
          >
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-[var(--radius-sm)] bg-accent font-bold text-on-accent">A</span>
              <span className="text-sm font-semibold">Acme</span>
            </div>
            <p className="heading mt-4 text-[1.6rem]">Sign in to Acme</p>
            <p className="mt-1 text-[0.85rem] text-muted">Demo: any email, any password with 8+ characters.</p>
            {["Email", "Password"].map((l) => (
              <div key={l} className="mt-4">
                <p className="mb-1.5 text-[0.8rem] font-medium">{l}</p>
                <div className="h-11 rounded-[var(--radius)] border border-line bg-bg" />
              </div>
            ))}
            <div className="mt-4 grid h-11 place-items-center rounded-[var(--radius)] bg-accent font-semibold text-on-accent">Continue</div>
          </div>
        </div>
        <div className="space-y-3 p-[var(--space-card)] text-sm text-muted">
          <p className="eyebrow">Theme editor</p>
          <p>Accent, radius, heading font, density and light/dark, with a live WCAG contrast check.</p>
          <p className="js-only">Loading the interactive playground…</p>
          <noscript>
            <p>The playground needs JavaScript. Here is the React integration it generates.</p>
          </noscript>
        </div>
      </div>
      <div className="border-t border-line p-[var(--space-card)]">
        <p className="mb-2 font-mono text-xs text-muted">App.tsx · illustrative API in the style of the SDK</p>
        <pre className="code-block max-h-[26rem]" tabIndex={0} aria-label="React integration code">
          <code dangerouslySetInnerHTML={{ __html: highlight(code) }} />
        </pre>
      </div>
    </div>
  );
}
