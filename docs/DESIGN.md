# Design notes

## Sitemap

```
/                     Hero → (Skim panel | spec sheet) → Work → Playground → More demos → Live proof → About → Contact
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
Hero: status · huge serif name · positioning · CTAs │ token spec-sheet drawing of <SignIn/>
Spec row: Now · Studying · Works across · Based in
01 Selected work: numbered rows (kicker, title, summary, stack chips, demo label)
02 Playground: preview | theme editor (+contrast) / framework code tabs
03 More to try: robot · threshold lab · battery cards
04 Live proof: merged PRs (ISR, fallback)
05 About teaser: story + three working principles
06 Contact: big copyable email · CV · LinkedIn · GitHub · Ask about me
```

Mobile: one column. Header keeps the monogram, mode switch, theme toggle and a no-JS `<details>` menu. Demos switch to touch layouts: the robot arena goes portrait, sliders get 24 px thumbs, and the chart keeps native scrolling while the slider handles input.

## Design tokens

Defined in `app/globals.css`, mirrored for components in `lib/theme.ts`.

| Role | Light | Dark |
| --- | --- | --- |
| bg / surface | `#F5F4EF` / `#FFFFFF` | `#070B14` / `#0E1424` |
| text / muted | `#0A1020` / `#4A5468` (6.9:1) | `#E8ECF4` / `#A0ABC0` (8.5:1) |
| accent fill | `#3DFFA2` | `#3DFFA2` |
| accent ink (text) | `#00753D` (≥5:1) | `#3DFFA2` (15:1) |
| warm fill / ink | `#FFB547` / `#935800` | `#FFB547` / `#FFB547` |

- **Type:** Instrument Serif for display headings, Inter for body text, JetBrains Mono for labels and code. All three are self-hosted and subset to Latin. The fluid scale runs `--step--1` to `--step-6` with `clamp()`.
- **Shape and space:** `--radius` (10 px), `--density` (0.8 / 1 / 1.2) scaling section and card padding, and a 64 px technical grid.
- **Motion:** View Transitions for route changes (case-study titles morph), CSS scroll-driven reveals (transform only), and micro-interactions on hover and focus. `prefers-reduced-motion` turns all of it off, and the robot simulator then waits for *Run*.

## Component inventory

| Area | Components |
| --- | --- |
| Shell | `ThemeScript` (pre-paint mode/theme/tokens), `Header`, `NavLinks`, `ModeSwitch`, `SchemeToggle`, `Footer`, skip link |
| Home | `Hero`, `HeroVisual`, `SkimPanel`, `FeaturedWork`, `SkimWork`, `PlaygroundSection`, `DemosTeaser`, `ProofStrip`, `AboutTeaser`, `Contact`, `CopyEmail` |
| Case study | MDX map (`mdx-components.tsx`): anchored headings, `Deep`, `Callout`, `CodeBlock` (build-time highlight, diff), placeholders, diagrams, demos |
| Demos | `Playground` (`IdentityPreview`, theme editor, `ContrastReport`, `CodePanel`), `PowerTraceDemo` + `TraceChart`, `RobotDemo`, `BatteryDemo` + `BatteryChart`. Each has a server-rendered static fallback and a lazy loader that hydrates near the viewport |
| Overlays | `Overlays` (⌘K listener, first-visit hint), `CommandPalette` (cmdk + Radix Dialog), `AskPanel` (Radix Dialog). All lazy-loaded |
| SEO | Metadata per route, JSON-LD `Person` + `CreativeWork`, per-page OG images, sitemap, robots |
