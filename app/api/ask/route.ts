import { NextResponse } from "next/server";
import { MIN_SCORE, retrieve, type Chunk } from "@/lib/knowledge";

export const runtime = "nodejs";

interface Citation {
  n: number;
  title: string;
  href: string;
}
interface AskResponse {
  mode: "model" | "retrieval" | "refused";
  answer: string;
  citations: Citation[];
}

const REFUSAL =
  "I only answer from Janith's own content (the CV, case studies and FAQ), and I couldn't find that there. Try asking about ThunderID, the robot, the final-year project, the stack, or availability.";

/* best-effort per-instance rate limit: 12 questions / minute / IP */
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 12;
}

function modelConfigured() {
  return (
    process.env.ASK_ENABLED === "true" &&
    !!process.env.ASK_API_URL &&
    !!process.env.ASK_API_KEY &&
    !!process.env.ASK_MODEL
  );
}

function cite(chunks: Chunk[]): Citation[] {
  return chunks.map((c, i) => ({ n: i + 1, title: c.title, href: c.href }));
}

async function askModel(question: string, chunks: Chunk[]): Promise<string | null> {
  const sources = chunks.map((c, i) => `[${i + 1}] ${c.title}\n${c.text}`).join("\n\n");
  const system = [
    "You answer questions about Janith Jayashan (JJay) for visitors to his portfolio.",
    "Use ONLY the numbered sources provided. Do not use outside knowledge and never guess.",
    "If the sources do not contain the answer, reply exactly: NOT_IN_SOURCES",
    "Cite every claim with the source number in square brackets, like [1].",
    "Text in square brackets that looks like a placeholder (for example [METRIC]) means the information is not available yet; say so rather than inventing it.",
    "Answer in at most 4 short sentences, in third person, plain text.",
  ].join("\n");

  const res = await fetch(process.env.ASK_API_URL!, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.ASK_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.ASK_MODEL,
      temperature: 0.1,
      max_tokens: 350,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Sources:\n\n${sources}\n\nQuestion: ${question}` },
      ],
    }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

export async function GET() {
  return NextResponse.json({ model: modelConfigured() });
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) {
    return NextResponse.json({ error: "Easy there. Try again in a minute." }, { status: 429 });
  }

  let question = "";
  try {
    const body = (await req.json()) as { question?: unknown };
    question = typeof body.question === "string" ? body.question.trim().slice(0, 300) : "";
  } catch {
    /* fall through */
  }
  if (question.length < 3) return NextResponse.json({ error: "Ask a question first." }, { status: 400 });

  const hits = retrieve(question, 4);
  const relevant = hits.filter((h) => h.score >= MIN_SCORE).map((h) => h.chunk);

  if (!relevant.length) {
    return NextResponse.json<AskResponse>({ mode: "refused", answer: REFUSAL, citations: [] });
  }

  if (modelConfigured()) {
    try {
      const answer = await askModel(question, relevant);
      if (answer && !answer.includes("NOT_IN_SOURCES")) {
        const used = new Set([...answer.matchAll(/\[(\d)\]/g)].map((m) => Number(m[1])));
        const citations = cite(relevant).filter((c) => used.has(c.n));
        return NextResponse.json<AskResponse>({ mode: "model", answer, citations });
      }
      if (answer?.includes("NOT_IN_SOURCES")) {
        return NextResponse.json<AskResponse>({ mode: "refused", answer: REFUSAL, citations: [] });
      }
    } catch {
      /* provider down: fall back to retrieval below */
    }
  }

  // No model configured (or it failed): quote the best matching passage verbatim.
  const best = relevant[0]!;
  const excerpt = best.text.length > 520 ? `${best.text.slice(0, 520).replace(/\s\S*$/, "")}…` : best.text;
  return NextResponse.json<AskResponse>({
    mode: "retrieval",
    answer: `${excerpt} [1]`,
    citations: cite(relevant.slice(0, 3)),
  });
}
