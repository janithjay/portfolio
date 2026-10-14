import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { isValidElement, type ComponentPropsWithoutRef, type ReactElement, type ReactNode } from "react";
import { BatteryDemo, PlaygroundDemo, PowerTraceDemo, RobotDemo } from "@/components/demos";
import { BatteryPipelineDiagram, PowerTraceDiagram, RobotStateDiagram, ThunderArchitectureDiagram } from "@/components/diagrams";
import { CodeBlock } from "@/components/mdx/Code";
import { ModeLink } from "@/components/site/ModeLink";
import { withPlaceholders } from "@/components/ui/Placeholders";
import { slugify } from "@/lib/slug";

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

function Deep({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="deep-only space-y-[1.1em]">{children}</div>
      <p className="skim-only rounded-[var(--radius)] border border-dashed border-line-strong px-4 py-3 font-mono text-xs text-muted">
        Engineering details hidden in Skim mode.{" "}
        <ModeLink to="deep">Show them (Deep mode)</ModeLink>
      </p>
    </>
  );
}

function Callout({ children, tone = "note" }: { children: ReactNode; tone?: "note" | "warn" }) {
  return (
    <aside className={`rounded-[var(--radius)] border-l-2 bg-surface-2 px-4 py-3 text-sm ${tone === "warn" ? "border-warm" : "border-accent-ink"}`}>
      {children}
    </aside>
  );
}

const components: MDXComponents = {
  h2: ({ children }) => {
    const id = slugify(textOf(children));
    return (
      <h2 id={id} className="group">
        <a href={`#${id}`} className="no-underline">
          {children}
          <span aria-hidden="true" className="ml-2 font-mono text-[0.5em] text-muted opacity-0 transition-opacity group-hover:opacity-100">
            #
          </span>
        </a>
      </h2>
    );
  },
  h3: ({ children }) => <h3 id={slugify(textOf(children))}>{children}</h3>,
  p: ({ children }) => <p>{withPlaceholders(children)}</p>,
  li: ({ children }) => <li>{withPlaceholders(children)}</li>,
  a: ({ href = "", children, ...rest }: ComponentPropsWithoutRef<"a">) =>
    href.startsWith("/") || href.startsWith("#") ? (
      <Link href={href} {...rest}>
        {children}
      </Link>
    ) : (
      <a href={href} target="_blank" rel="noopener" {...rest}>
        {children}
      </a>
    ),
  pre: ({ children }) => {
    const code = children as ReactElement<{ className?: string; children?: string }>;
    const lang = code?.props?.className?.replace("language-", "");
    return <CodeBlock code={String(code?.props?.children ?? "")} lang={lang} />;
  },
  Deep,
  Callout,
  PlaygroundDemo: () => (
    <div className="not-prose my-8 lg:-mx-24" id="demo">
      <PlaygroundDemo />
    </div>
  ),
  PowerTraceDemo: () => (
    <div className="not-prose my-8 lg:-mx-24" id="demo">
      <PowerTraceDemo />
    </div>
  ),
  RobotDemo: () => (
    <div className="not-prose my-8 lg:-mx-24" id="demo">
      <RobotDemo />
    </div>
  ),
  BatteryDemo: ({ hfSpace }: { hfSpace?: string }) => (
    <div className="not-prose my-8 lg:-mx-24" id="demo">
      <BatteryDemo hfSpace={hfSpace} />
    </div>
  ),
  ThunderArchitectureDiagram,
  RobotStateDiagram,
  PowerTraceDiagram,
  BatteryPipelineDiagram,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
