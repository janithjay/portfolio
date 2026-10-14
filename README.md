# jjay / janith jayashan

Portfolio of Janith Jayashan (JJay): identity SDK components, Go, ML and embedded robotics.

The idea is **proof, not claims**: every claim on the site comes with something you can run, drag, or click. The site is built on its own design-token system, the same way the identity components it shows are.

- **Two reading modes.** *Skim* is the 30-second recruiter version. *Deep* has the case studies, diagrams, code and trade-offs. The choice is remembered per visitor and lives in the URL (`?mode=skim`), so it can be shared.
- **Identity component playground.** A working sign-in and profile flow (mock auth only) with a live theme editor, a WCAG contrast check, and a framework switcher (React, Next.js, Vue, Nuxt, Express). *Apply to this site* re-themes the whole page.
- **Interactive demos.** A threshold lab that reproduces the final-year project's threshold-overwrite bug, a 2D simulator of the ESP32-S3 robot (click to place obstacles; reverse moves stay at 0), and an EV battery capacity explorer with a click-to-load Hugging Face Space.
- **⌘K / Ctrl+K command palette.** Jump anywhere, switch mode or theme, copy the email address, or download the CV.
- **"Ask about me".** Answers only from `/content` and cites the section each answer came from. Without a model configured, it quotes the best-matching passage word for word, so it can't invent facts.
- **Live proof strip.** Recently merged public PRs from the GitHub API, cached with ISR (6 h), with a curated fallback.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS v4 on CSS-variable tokens · MDX (`@next/mdx`) · cmdk + Radix Dialog (both lazy-loaded) · hand-rolled SVG charts and Canvas · sugar-high (highlighting at build time) · Vercel Analytics.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Node 20.9+ is required. `npm run dev` and `npm run build` regenerate the assistant's knowledge index first.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` / `npm run typecheck` | ESLint and `tsc --noEmit` |
| `npm run audit` | axe-core WCAG 2.2 AA audit of every page, in both themes and both modes (needs a running server; set `AUDIT_URL` to audit production) |
| `npm run cv:pdf` | Prints `/cv` to `public/cv/janith-jayashan-cv.pdf` (needs a running server) |

`audit` and `cv:pdf` drive Chromium through `playwright-core`. Set `CHROME_PATH`, or run `npx playwright install chromium` once.

## Project layout

```
app/                    routes: / · /work · /work/[slug] · /about · /now · /cv · /api/ask · 404
  globals.css           design tokens (light + dark), base styles, motion, print
  */opengraph-image.tsx generated Open Graph images (lib/og.tsx)
components/
  home/                 hero, sections, proof strip
  playground/           identity playground (lazy) + static fallback
  demos/                threshold lab, robot sim, battery widget + lazy loaders
  diagrams/             themeable SVG architecture diagrams
  palette/              ⌘K palette and global overlays (lazy)
  ask/                  "Ask about me" panel (lazy)
content/                everything you edit (see below)
lib/                    tokens (theme.ts, color.ts), content loaders, demo models, retrieval
scripts/                knowledge index, CV PDF, accessibility audit
docs/DESIGN.md          sitemap, wireframes, tokens and component inventory
```

## Content

All copy lives in `/content`. You shouldn't need to touch components to update it.

Text in square brackets in **CAPITALS** (for example `[METRIC]`, `[ADD: …]` or `[2027]`) is a placeholder. The site highlights placeholders in amber so none get missed. Search for them with:

```bash
grep -rn "\[[A-Z0-9]" content
```

| File | What it holds |
| --- | --- |
| `content/site.json` | Name, positioning line, availability, links, the three Skim achievements, stack, nav |
| `content/work/*.mdx` | Case studies (one file each) |
| `content/cv.json` | The CV (`/cv` and the PDF) |
| `content/about.mdx`, `content/now.mdx` | `/about` and `/now` |
| `content/faq.md` | The FAQ on `/about`; also a source for the assistant |
| `content/proof.json` | GitHub username, optional repo filter, curated PR fallback |
| `content/playground.json` | Package names shown in the playground's code and the mock user |

### Add a project

1. Copy an existing file in `content/work/` to `content/work/my-project.mdx`. The filename becomes the URL: `/work/my-project`.
2. Edit the `meta` export at the top: `title`, `kicker`, `summary`, `role`, `period`, `stack`, `tldr` (shown in Skim mode), `links`, `order` (position in lists) and `demo` (`playground`, `robot`, `power-trace` or `battery`).
3. Keep the template's sections: **Problem → Constraints → My role → Approach (diagram) → Interactive demo → Results → What went wrong → Stack → Links**. Each `## ` heading becomes an anchor and a table-of-contents entry.
4. MDX components you can use:
   - `<Deep>…</Deep>`: engineering detail, collapsed in Skim mode.
   - `<Callout>…</Callout>`
   - Any diagram in `components/diagrams/index.tsx`, such as `<RobotStateDiagram />`.
   - Any demo, such as `<RobotDemo />`. To add a new one, write it in `components/demos/`, add a lazy wrapper in `components/demos/lazy.tsx` and a server fallback in `components/demos/index.tsx`, then register it in `mdx-components.tsx`.
   - Fenced code blocks are highlighted at build time. `diff` blocks show additions and removals.
5. The sitemap, ⌘K palette, Open Graph image and assistant index all pick up the new file automatically.

### Update `/now`

Edit `content/now.mdx` and change `meta.updated` to today's date (`YYYY-MM-DD`).

### Replace the CV PDF

Either regenerate it from the HTML CV (`npm run build && npm start`, then `npm run cv:pdf` in another terminal), or drop your own file at `public/cv/janith-jayashan-cv.pdf`.

## Theme tokens

Tokens are CSS custom properties defined once in `app/globals.css`. Light values sit on `:root`; dark values sit under `prefers-color-scheme: dark` and `[data-theme="dark"]`. Tailwind reads them through `@theme inline`, so `bg-surface`, `text-accent-ink`, `rounded-[var(--radius)]` and so on all follow the tokens.

| Token | Purpose |
| --- | --- |
| `--bg`, `--bg-elev`, `--surface`, `--surface-2` | Page and card surfaces |
| `--text`, `--text-muted`, `--line`, `--line-strong` | Text and hairlines |
| `--accent` | Signal green, used for fills (buttons, dots) |
| `--accent-ink` | Accent for text and links. Contrast-corrected per scheme (≥ 5:1) |
| `--on-accent` | Text on accent fills |
| `--warm`, `--warm-ink` | Amber secondary (fill / text) |
| `--radius`, `--font-heading`, `--heading-weight`, `--heading-tracking`, `--density` | Shape, type and spacing knobs (the same ones the playground edits) |
| `--step--1` … `--step-6` | Fluid type scale (`clamp()`, 320 → 1440 px) |

To change the default brand:

1. Edit the values in `app/globals.css`, in **both** the light block and the two dark blocks.
2. Mirror the surface colours in `SCHEME_SURFACES` and the defaults in `DEFAULT_TOKENS`, both in `lib/theme.ts`. The playground and the contrast-correction logic use them.
3. Run `npm run audit` to confirm contrast in both themes.

When a visitor clicks *Apply to this site*, `lib/theme.ts › tokensToCss()` serialises their tokens to a small stylesheet. It's stored in `localStorage` and injected before first paint by `components/site/ThemeScript.tsx`, so there's no flash.

## "Ask about me"

- `scripts/build-knowledge.mjs` chunks the FAQ, CV, about/now pages and case studies into `content/.generated/knowledge.json`. This runs automatically before `dev` and `build`.
- `app/api/ask/route.ts` retrieves the best passages with BM25. With no relevant passage, it refuses.
- **Without a model** (the default), it quotes the best passage verbatim with its source link.
- **With a model**, it sends only the retrieved passages and asks for cited, source-only answers. Set these to enable it:

```bash
ASK_ENABLED=true
ASK_API_URL=https://…/v1/chat/completions   # any standard chat-completions endpoint
ASK_API_KEY=…
ASK_MODEL=…
```

Requests are rate-limited per IP (best effort, per instance). Questions are capped at 300 characters.

## Deploy (Vercel)

1. Import the repository in Vercel. The framework preset is detected automatically, so no build settings are needed.
2. Set environment variables (see `.env.example`):
   - `NEXT_PUBLIC_SITE_URL`: your production URL. Used for canonical URLs, Open Graph, the sitemap and JSON-LD.
   - `GITHUB_TOKEN` (optional): a read-only token that raises the GitHub API rate limit for the proof strip.
   - `ASK_*` (optional): see above.
3. Turn on **Analytics** in the Vercel project. The analytics script only loads on Vercel, uses no cookies and needs no banner.
4. Deploy. The home page revalidates every 6 hours (ISR), so the proof strip stays fresh without slowing anything down.

## Quality checks (local production build)

| | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Mobile (`/`, case studies, `/cv`) | 96–98 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

- **axe-core:** 0 violations across 10 pages × light/dark × Skim/Deep, with demos hydrated.
- **CLS:** 0.000.
- **Lab LCP (simulated slow 4G):** 2.3–2.8 s. Observed LCP on the unthrottled local run was about 0.2 s. Confirm field Core Web Vitals in Vercel Speed Insights after launch.
- **Home-page JavaScript:** about 146 KB gzipped. Of that, about 128 KB is the React 19 + Next.js 16 runtime and about 18 KB is site code. Demos, the palette and the assistant load on demand.

Lab numbers come from Lighthouse 13 against `next start` on a single machine. Expect some variance on real devices.
