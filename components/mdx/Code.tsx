import { highlight } from "sugar-high";

/** Server-side syntax highlighting: zero client JavaScript. Supports ```diff blocks. */
export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const source = code.replace(/\n$/, "");
  if (lang === "diff") {
    const lines = source.split("\n").map((line) => {
      const kind = line.startsWith("+") ? "is-add" : line.startsWith("-") ? "is-del" : "";
      const body = kind ? line.slice(1) : line.replace(/^ /, "");
      return `<span class="sh__line ${kind}">${kind === "is-add" ? "+ " : kind === "is-del" ? "- " : "  "}${highlight(body).replace(/<\/?span class="sh__line">/g, "")}</span>`;
    });
    return (
      <pre className="code-block is-diff" aria-label="Code diff" tabIndex={0}>
        <code dangerouslySetInnerHTML={{ __html: lines.join("") }} />
      </pre>
    );
  }
  return (
    <pre className="code-block" data-lang={lang} tabIndex={0} aria-label={lang ? `${lang} code` : "Code"}>
      <code dangerouslySetInnerHTML={{ __html: highlight(source) }} />
    </pre>
  );
}
