import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { slugify } from "./slug";

export interface FaqEntry {
  id: string;
  question: string;
  answer: string[];
}

export function getFaq(): FaqEntry[] {
  const src = readFileSync(path.join(process.cwd(), "content", "faq.md"), "utf8").replace(/<!--[\s\S]*?-->/g, "");
  return src
    .split(/^##\s+/m)
    .slice(1)
    .map((block) => {
      const [q, ...body] = block.split("\n");
      const question = q!.trim();
      return {
        id: `faq-${slugify(question)}`,
        question,
        answer: body.join("\n").trim().split(/\n{2,}/).map((p) => p.replace(/\n/g, " ")),
      };
    });
}
