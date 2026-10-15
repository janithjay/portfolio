# Design notes

## Sitemap

```
/                     Deep: 3D stack hero + 4 scroll chapters → Index of work → Playground → More demos → Live proof → About → Contact
                      Skim: one-screen hero with three outcomes + stack → case-study list → Contact
/work                 All case studies
/work/[slug]          Problem → Constraints → My role → Approach (diagram) → Interactive demo → Results → What went wrong → Stack → Links
  thunderid-identity-components   · demo: identity playground
  esp32-autonomous-robot          · demo: robot simulator
  power-trace-detection           · demo: threshold lab (bug toggle)
  ev-battery-prediction           · demo: capacity explorer + HF Space
/about                Story, how I work, what's next, FAQ (#faq)
/now                  Current focus (content/now.mdx)
/cv                   ATS-friendly HTML CV, print styles, PDF download
/api/ask              "Ask about me" (POST question → cited answer)
404                   Robot meets a cliff
/sitemap.xml /robots.txt /*/opengraph-image
```

## Home page wireframes

**Skim (desktop, one screen, no scrolling needed)**

```
┌ header: monogram · nav · [SKIM|deep] · ⌘K · theme ───────────────────────────┐
│ ● Open to SWE roles from [2027]          │ THREE THINGS I'VE SHIPPED          │
│ Janith                                    │ 01 Identity components × 5 SDKs   │
│ Jayashan  aka JJay                        │ 02 ESP32-S3 robot, 0 reverse moves │
│ Positioning line                          │ 03 Power-trace bug, found + fixed  │
│ [Download CV] [Email] [LinkedIn]          │ STACK  product · backend · ML · hw │
│ "30-second version → switch to Deep"      │                                     │
└───────────────────────────────────────────┴─────────────────────────────────────┘
  Case studies (2×2 compact list) · Contact card
```

**Deep (desktop, scrolls)**

```
┌ sticky WebGL stage (100svh) ───────────────────────────────────────────────┐
│ ● status · HUD: Sri Lanka · SE Intern WSO2 · BSc CompEng                   │
│                                               ╱▔▔▔▔▔▔▔▔▔╲  L4 Interface    │
│ JANITH /JJay                                 ╱  plates   ╲ L3 Identity     │
│ JAYASHAN                                     ╲  exploded ╱ L2 Models       │
│ positioning · [Download CV] [Email]           ╲▁▁▁▁▁▁▁▁▁╱  L1 Firmware     │
│ │ scroll to explode the stack                                              │
└─────────────────────────────────────────────────────────────────────────────┘
  4 chapter cards scroll over the stage (left); the active one lights its plate
01 Index of work: giant condensed rows · 02 Playground · 03 More to try
04 Live proof · 05 About · 06 Contact  (each under a drawing-style title block)
```

Mobile: one column. Header keeps the monogram, mode switch, theme toggle and a no-JS `<details>` menu. Demos switch to touch layouts: the robot arena goes portrait, sliders get 24 px thumbs, and the chart keeps native scrolling while the slider handles input.

## Design tokens

Defined in `app/globals.css`, mirrored for components in `lib/theme.ts`.

| Role | Light | Dark |
| --- | --- | --- |
| bg / surface | `#EEEDE8` / `#FFFFFF` | `#06070B` / `#0F1219` |
| text / muted | `#0A0B0F` / `#4B5162` (6.8:1) | `#ECEEF2` / `#9AA1B2` (7.8:1) |
| accent fill | `#C6F432` acid lime | `#C6F432` |
| accent ink (text) | `#516906` (≥5:1) | `#C6F432` (15.7:1) |
| warm fill / ink | `#FF6A2B` / `#B53600` | `#FF6A2B` / `#FF7A3D` |

- **Type:** Bricolage Grotesque, pinned condensed and set heavy, for display; Hanken Grotesk for body text; Martian Mono for HUD labels and code. All three are self-hosted, instanced and subset to Latin. The fluid scale runs `--step--1` to `--step-6` with `clamp()`, and the hero name goes up to 11.5rem.
- **Motifs:** drawing title blocks on section heads, crop-mark corners (`.ticks`), mono HUD labels, square controls.
- **Shape and space:** `--radius` (6 px), `--density` (0.8 / 1 / 1.2) scaling section and card padding, and a 64 px technical grid.
- **Motion:** View Transitions for route changes (case-study titles morph), CSS scroll-driven reveals (transform only), and micro-interactions on hover and focus. `prefers-reduced-motion` turns all of it off, and the robot simulator then waits for *Run*.

## Component inventory

| Area | Components |
| --- | --- |
| Shell | `ThemeScript` (pre-paint mode/theme/tokens), `Header`, `NavLinks`, `ModeSwitch`, `SchemeToggle`, `Footer`, skip link |
| 3D stack | `StackStory` (hero + chapters), `StackStage` (sticky stage, scroll progress, WebGL upgrade), `scene.ts` (three.js), `artwork.ts` (token-coloured plate textures), `StackCss` (no-JS CSS-3D fallback) |
| Home | `Hero` (Skim), `SkimPanel`, `FeaturedWork`, `SkimWork`, `PlaygroundSection`, `DemosTeaser`, `ProofStrip`, `AboutTeaser`, `Contact`, `CopyEmail` |
| Case study | MDX map (`mdx-components.tsx`): anchored headings, `Deep`, `Callout`, `CodeBlock` (build-time highlight, diff), placeholders, diagrams, demos |
| Demos | `Playground` (`IdentityPreview`, theme editor, `ContrastReport`, `CodePanel`), `PowerTraceDemo` + `TraceChart`, `RobotDemo`, `BatteryDemo` + `BatteryChart`. Each has a server-rendered static fallback and a lazy loader that hydrates near the viewport |
| Overlays | `Overlays` (⌘K listener, first-visit hint), `CommandPalette` (cmdk + Radix Dialog), `AskPanel` (Radix Dialog). All lazy-loaded |
| SEO | Metadata per route, JSON-LD `Person` + `CreativeWork`, per-page OG images, sitemap, robots |
