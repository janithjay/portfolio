// Builds content/.generated/knowledge.json: the only material the
// "Ask about me" assistant is allowed to answer from.
// Runs automatically before `next build` (see package.json "prebuild").
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const content = path.join(root, "content");
const out = path.join(content, ".generated");

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

/** Strip MDX/JSX/markdown down to readable text. */
function plain(src) {
  return src
    .replace(/^export const meta = \{[\s\S]*?\n\}\n/m, "")
    .replace(/^export .*$/gm, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[A-Z][^>]*\/>/g, " ")
    .replace(/<\/?[A-Za-z][^>]*>/g, " ")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/** Split a markdown document into chunks at "## " headings. */
function sections(src) {
  const parts = [];
  let current = { heading: null, body: [] };
  for (const line of src.split("\n")) {
    const m = /^##\s+(.+)$/.exec(line);
    if (m) {
      if (current.heading || current.body.join("").trim()) parts.push(current);
      current = { heading: m[1].trim(), body: [] };
    } else current.body.push(line);
  }
  parts.push(current);
  return parts.filter((p) => p.heading || p.body.join("").trim());
}

function metaFrom(src) {
  const block = /export const meta = (\{[\s\S]*?\n\})\n/.exec(src);
  if (!block) return {};
  // meta is a plain object literal in our own content files
  return Function(`"use strict"; return (${block[1]});`)();
}

const chunks = [];

// FAQ
for (const s of sections(readFileSync(path.join(content, "faq.md"), "utf8"))) {
  if (!s.heading) continue;
  chunks.push({
    id: `faq-${slugify(s.heading)}`,
    source: "FAQ",
    title: s.heading,
    href: `/about#faq-${slugify(s.heading)}`,
    text: plain(s.body.join("\n")),
  });
}

// About + Now
for (const [file, label, href] of [
  ["about.mdx", "About", "/about"],
  ["now.mdx", "Now", "/now"],
]) {
  for (const s of sections(readFileSync(path.join(content, file), "utf8"))) {
    const text = plain(s.body.join("\n"));
    if (!text) continue;
    chunks.push({
      id: `${label.toLowerCase()}-${slugify(s.heading ?? "intro")}`,
      source: label,
      title: s.heading ? `${label}: ${s.heading}` : label,
      href: s.heading ? `${href}#${slugify(s.heading)}` : href,
      text,
    });
  }
}

// Case studies
for (const file of readdirSync(path.join(content, "work")).filter((f) => f.endsWith(".mdx"))) {
  const src = readFileSync(path.join(content, "work", file), "utf8");
  const meta = metaFrom(src);
  const slug = file.replace(/\.mdx$/, "");
  chunks.push({
    id: `work-${slug}-summary`,
    source: "Case study",
    title: meta.title ?? slug,
    href: `/work/${slug}`,
    text: [meta.summary, ...(meta.tldr ?? []), meta.role ? `Role: ${meta.role}` : "", meta.stack ? `Stack: ${meta.stack.join(", ")}` : ""]
      .filter(Boolean)
      .join("\n"),
  });
  for (const s of sections(src)) {
    if (!s.heading) continue;
    const text = plain(s.body.join("\n"));
    if (text.length < 20) continue;
    chunks.push({
      id: `work-${slug}-${slugify(s.heading)}`,
      source: "Case study",
      title: `${meta.title ?? slug}: ${s.heading}`,
      href: `/work/${slug}#${slugify(s.heading)}`,
      text,
    });
  }
}

// CV
const cv = JSON.parse(readFileSync(path.join(content, "cv.json"), "utf8"));
chunks.push({ id: "cv-summary", source: "CV", title: "CV: Summary", href: "/cv#summary", text: cv.summary });
for (const e of cv.experience)
  chunks.push({
    id: `cv-exp-${slugify(e.org)}`,
    source: "CV",
    title: `CV: ${e.role}, ${e.org}`,
    href: "/cv#experience",
    text: `${e.role} at ${e.org} (${e.period}). ${e.bullets.join(" ")}`,
  });
for (const e of cv.education)
  chunks.push({
    id: `cv-edu-${slugify(e.org)}`,
    source: "CV",
    title: `CV: ${e.degree}`,
    href: "/cv#education",
    text: `${e.degree}, ${e.org} (${e.period}). ${e.detail}`,
  });
chunks.push({
  id: "cv-skills",
  source: "CV",
  title: "CV: Skills",
  href: "/cv#skills",
  text: cv.skills.map((g) => `${g.group}: ${g.items.join(", ")}`).join(". "),
});

mkdirSync(out, { recursive: true });
writeFileSync(path.join(out, "knowledge.json"), JSON.stringify({ chunks }, null, 2));
console.log(`knowledge: ${chunks.length} chunks → content/.generated/knowledge.json`);
