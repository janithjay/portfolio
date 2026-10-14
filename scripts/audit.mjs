// Accessibility audit: runs axe-core (WCAG 2.0/2.1/2.2 A + AA rules) on every page,
// in light and dark, in Skim and Deep mode, after the lazy demos have hydrated.
//
//   npm run build && npm start   (in another terminal)
//   npm run audit                (AUDIT_URL=https://your-site npm run audit to audit production)
//
// Chromium: set CHROME_PATH, or install one with `npx playwright install chromium`.
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright-core";

const base = process.env.AUDIT_URL ?? "http://localhost:3000";
const pages = ["/", "/work", "/work/thunderid-identity-components", "/work/esp32-autonomous-robot", "/work/power-trace-detection", "/work/ev-battery-prediction", "/about", "/now", "/cv", "/does-not-exist"];

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
let failures = 0;

for (const scheme of ["light", "dark"]) {
  for (const mode of ["deep", "skim"]) {
    const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    for (const path of pages) {
      await page.goto(`${base}${path}${path.includes("?") ? "&" : "?"}mode=${mode}`, { waitUntil: "load" });
      // scroll through so lazy demos hydrate and get audited too
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(600);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
        .disableRules(["region"]) // skip-link + landmarks are present; decorative fixed overlays trip this rule
        .analyze();
      const label = `${scheme}/${mode} ${path}`;
      if (results.violations.length) {
        failures += results.violations.length;
        console.log(`✗ ${label}`);
        for (const v of results.violations) {
          console.log(`   [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length})`);
          for (const n of v.nodes.slice(0, 3)) console.log(`      ${n.target.join(" ")}  ${n.failureSummary?.split("\n")[1] ?? ""}`);
        }
      } else console.log(`✓ ${label}`);
    }
    await ctx.close();
  }
}
await browser.close();
console.log(failures ? `\n${failures} violation group(s)` : "\nNo axe violations.");
process.exit(failures ? 1 : 0);
