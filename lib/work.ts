import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { ComponentType } from "react";
import { slugify } from "./slug";

export type DemoKind = "playground" | "robot" | "power-trace" | "battery";

export interface WorkMeta {
  slug: string;
  order: number;
  kicker: string;
  title: string;
  summary: string;
  role: string;
  period: string;
  stack: string[];
  tldr: string[];
  links: { label: string; href: string }[];
  demo: DemoKind;
  hfSpace?: string;
}

interface WorkModule {
  default: ComponentType;
  meta: WorkMeta;
}

const WORK_DIR = path.join(process.cwd(), "content", "work");

export function workSlugs(): string[] {
  return readdirSync(WORK_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export async function loadWork(slug: string): Promise<WorkModule | null> {
  if (!workSlugs().includes(slug)) return null;
  const mod = (await import(`@/content/work/${slug}.mdx`)) as WorkModule;
  return mod;
}

export async function allWork(): Promise<WorkMeta[]> {
  const metas = await Promise.all(
    workSlugs().map(async (slug) => (await import(`@/content/work/${slug}.mdx`)).meta as WorkMeta),
  );
  return metas.sort((a, b) => a.order - b.order);
}


/** "## " headings of a case study, for the table of contents. */
export function workHeadings(slug: string): { id: string; text: string }[] {
  const src = readFileSync(path.join(WORK_DIR, `${slug}.mdx`), "utf8");
  return [...src.matchAll(/^##\s+(.+)$/gm)].map((m) => ({ id: slugify(m[1]!), text: m[1]!.trim() }));
}
