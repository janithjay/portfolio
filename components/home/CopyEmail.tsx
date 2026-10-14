"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

/** Big email link: copies on click when possible, always works as mailto without JS. */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a href={`mailto:${email}`} className="heading break-all text-step-3 underline decoration-line-strong decoration-1 underline-offset-[0.15em] hover:decoration-accent-ink sm:text-step-4">
        {email}
      </a>
      <button
        type="button"
        className="js-only btn btn-ghost min-h-10 px-3"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          } catch {
            window.location.href = `mailto:${email}`;
          }
        }}
      >
        <Icon name={copied ? "check" : "copy"} size={15} />
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
