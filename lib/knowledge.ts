import "server-only";
import knowledge from "@/content/.generated/knowledge.json";

export interface Chunk {
  id: string;
  source: string;
  title: string;
  href: string;
  text: string;
}

const STOP = new Set(
  "a an and are as at be but by can do does did for from has have how i in is it its me my of on or so tell that the their there this to was what when where which who why will with you your about he his him her she they them janith jjay".split(
    " ",
  ),
);

const SYNONYMS: Record<string, string[]> = {
  job: ["role", "roles", "looking", "hire", "hiring", "work"],
  hire: ["looking", "roles", "available"],
  available: ["looking", "open", "roles"],
  robot: ["esp32", "firmware", "robotics"],
  ml: ["machine", "learning", "model"],
  ai: ["ml", "model", "machine", "learning"],
  contact: ["email", "linkedin", "reach"],
  resume: ["cv"],
  identity: ["thunderid", "auth", "sign"],
  sdk: ["sdks", "components", "thunderid"],
  fyp: ["final", "year", "project", "power", "trace"],
  thesis: ["fyp", "final", "project"],
  battery: ["ev", "hugging", "face"],
  location: ["based", "sri", "lanka"],
  university: ["education", "degree", "kotelawala", "kdu"],
  study: ["education", "degree", "university"],
};

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map((t) => (t.length > 4 && t.endsWith("s") ? t.slice(0, -1) : t));
}

const chunks = (knowledge as { chunks: Chunk[] }).chunks;
const docs = chunks.map((c) => ({ chunk: c, terms: tokens(`${c.title} ${c.title} ${c.text}`) }));
const avgLen = docs.reduce((n, d) => n + d.terms.length, 0) / Math.max(docs.length, 1);
const df = new Map<string, number>();
for (const d of docs) for (const t of new Set(d.terms)) df.set(t, (df.get(t) ?? 0) + 1);

/** BM25 over our own content. Small corpus, so this runs in well under a millisecond. */
export function retrieve(question: string, k = 4): { chunk: Chunk; score: number }[] {
  const q = tokens(question);
  const expanded = [...q, ...q.flatMap((t) => SYNONYMS[t] ?? [])];
  if (!expanded.length) return [];
  const N = docs.length;
  const scored = docs.map((d) => {
    let score = 0;
    for (const term of new Set(expanded)) {
      const f = d.terms.filter((t) => t === term).length;
      if (!f) continue;
      const n = df.get(term) ?? 0;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      const weight = q.includes(term) ? 1 : 0.5;
      score += weight * idf * ((f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (d.terms.length / avgLen))));
    }
    return { chunk: d.chunk, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export const MIN_SCORE = 2.2;
