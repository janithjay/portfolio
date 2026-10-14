// Prints the /cv page to public/cv/janith-jayashan-cv.pdf so the download always matches the HTML CV.
//
//   npm run build && npm start      (in another terminal)
//   npm run cv:pdf                  (CV_URL=http://localhost:3000/cv by default)
//
// Chromium: set CHROME_PATH, or install one with `npx playwright install chromium`.
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const url = process.env.CV_URL ?? "http://localhost:3000/cv";
const out = path.join(process.cwd(), "public", "cv", "janith-jayashan-cv.pdf");

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage({ colorScheme: "light" });
await page.goto(url, { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print", colorScheme: "light" });
mkdirSync(path.dirname(out), { recursive: true });
await page.pdf({
  path: out,
  format: "A4",
  printBackground: false,
  margin: { top: "16mm", bottom: "16mm", left: "16mm", right: "16mm" },
});
await browser.close();
console.log(`CV PDF written to ${path.relative(process.cwd(), out)}`);
