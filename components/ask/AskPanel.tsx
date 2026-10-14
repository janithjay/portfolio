"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

interface Citation {
  n: number;
  title: string;
  href: string;
}
interface Message {
  role: "user" | "assistant";
  text: string;
  mode?: "model" | "retrieval" | "refused" | "error";
  citations?: Citation[];
}

const SUGGESTIONS = [
  "What do you do at WSO2?",
  "Are you open to relocation?",
  "How does the robot avoid falling?",
  "What was the threshold bug?",
];

export default function AskPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [modelOn, setModelOn] = useState<boolean | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || modelOn !== null) return;
    fetch("/api/ask")
      .then((r) => r.json() as Promise<{ model: boolean }>)
      .then((d) => setModelOn(d.model))
      .catch(() => setModelOn(false));
  }, [open, modelOn]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = (await res.json()) as { answer?: string; mode?: Message["mode"]; citations?: Citation[]; error?: string };
      setMessages((m) => [
        ...m,
        data.error
          ? { role: "assistant", text: data.error, mode: "error" }
          : { role: "assistant", text: data.answer ?? "", mode: data.mode, citations: data.citations },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "I couldn't reach the server. The FAQ on the About page has the same answers.", mode: "error" },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(input);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(460px,100vw)] flex-col border-l border-line bg-bg-elev text-text shadow-2xl">
          <header className="flex items-start justify-between gap-4 border-b border-line p-5">
            <div>
              <Dialog.Title className="heading text-step-2">Ask about me</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted">
                Answers come only from my CV, case studies and FAQ, with a link to the source. If it isn&apos;t written there, it
                says so.
              </Dialog.Description>
              {modelOn === false && (
                <p className="mt-2 font-mono text-xs text-muted">Offline mode: quoting the closest passage word for word.</p>
              )}
            </div>
            <Dialog.Close className="grid size-10 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text" aria-label="Close">
              <Icon name="close" />
            </Dialog.Close>
          </header>

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite" aria-busy={busy}>
            {messages.length === 0 && (
              <div>
                <p className="eyebrow mb-3">Try</p>
                <ul className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <li key={s}>
                      <button type="button" className="chip min-h-10 hover:border-line-strong" onClick={() => void ask(s)}>
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                {m.role === "user" ? (
                  <p className="max-w-[85%] rounded-[var(--radius)] bg-text px-3.5 py-2 text-sm text-bg">{m.text}</p>
                ) : (
                  <div className="max-w-[95%] text-sm leading-relaxed">
                    <p className={m.mode === "error" ? "text-danger" : ""}>{withCitations(m.text, m.citations ?? [])}</p>
                    {!!m.citations?.length && (
                      <ol className="mt-2 space-y-1 border-l border-line pl-3 font-mono text-xs text-muted">
                        {m.citations.map((c) => (
                          <li key={c.n}>
                            [{c.n}]{" "}
                            <Link href={c.href} className="link" onClick={() => onOpenChange(false)}>
                              {c.title}
                            </Link>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
              </div>
            ))}
            {busy && <p className="font-mono text-xs text-muted">Looking it up…</p>}
          </div>

          <form onSubmit={onSubmit} className="border-t border-line p-4">
            <label htmlFor="ask-input" className="sr-only">
              Your question
            </label>
            <div className="flex gap-2">
              <input
                id="ask-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={300}
                placeholder="e.g. What stack do you use?"
                autoComplete="off"
                className="min-h-11 flex-1 rounded-[var(--radius)] border border-line bg-bg px-3 text-sm outline-none focus-visible:border-accent-ink"
              />
              <button type="submit" className="btn btn-primary" disabled={busy || input.trim().length < 3}>
                Ask
              </button>
            </div>
            <p className="mt-2 text-xs text-muted">
              Prefer reading? <Link href="/about#faq" className="link" onClick={() => onOpenChange(false)}>Browse the FAQ</Link>.
            </p>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function withCitations(text: string, citations: Citation[]): ReactNode {
  const parts = text.split(/(\[\d\])/g);
  return parts.map((p, i) => {
    const m = /^\[(\d)\]$/.exec(p);
    if (!m) return p;
    const c = citations.find((x) => x.n === Number(m[1]));
    if (!c) return null;
    return (
      <sup key={i}>
        <Link href={c.href} className="link px-0.5 font-mono" aria-label={`Source ${c.n}: ${c.title}`}>
          {c.n}
        </Link>
      </sup>
    );
  });
}
