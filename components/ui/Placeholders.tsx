import { Children, Fragment, isValidElement, type ReactNode } from "react";

/** Matches content placeholders like [METRIC] or [ADD: something]. */
const TOKEN = /(\[[A-Z0-9][A-Z0-9 _/&.'-]*(?:[:,][^\]]*)?\])/g;

export function markPlaceholders(text: string): ReactNode {
  if (!text.includes("[")) return text;
  const parts = text.split(TOKEN);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="placeholder" title="Placeholder: replace with real content">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** Wrap placeholder tokens found in direct string children. */
export function withPlaceholders(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string") return markPlaceholders(child);
    if (isValidElement(child)) return child;
    return child;
  });
}

export function T({ children }: { children: string }) {
  return <>{markPlaceholders(children)}</>;
}
