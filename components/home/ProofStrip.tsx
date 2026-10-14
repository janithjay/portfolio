import { site } from "@/lib/site";
import type { ProofData } from "@/lib/github";
import { Icon } from "@/components/ui/Icon";

const fmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });

export function ProofStrip({ data }: { data: ProofData }) {
  return (
    <section id="proof" aria-labelledby="proof-title" className="container-x deep-only scroll-mt-24 pt-[var(--space-section)]">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="eyebrow">04 · Live proof</p>
          <h2 id="proof-title" className="mt-2 text-step-3">
            Recently merged
          </h2>
        </div>
        <p className="font-mono text-xs text-muted">
          {data.source === "live"
            ? `${data.total ?? data.items.length} merged public PRs · from the GitHub API, refreshed every 6h`
            : data.source === "curated"
              ? "Hand-picked PRs (live GitHub feed unavailable right now)"
              : "Live feed unavailable right now"}
        </p>
      </div>
      {data.items.length ? (
        <ul className="grid gap-px overflow-hidden border-b border-line sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((pr) => (
            <li key={pr.url}>
              <a href={pr.url} target="_blank" rel="noopener" className="group flex h-full flex-col gap-2 py-5 pr-6 transition-colors hover:text-text">
                <span className="flex items-center gap-2 font-mono text-xs text-muted">
                  <span className="inline-block size-2 rounded-full bg-[#8957e5]" aria-hidden="true" />
                  merged{pr.mergedAt ? ` · ${fmt.format(new Date(pr.mergedAt))}` : ""}
                </span>
                <span className="font-medium leading-snug group-hover:underline">{pr.title}</span>
                <span className="mt-auto font-mono text-xs text-muted">{pr.repo}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-6 text-muted">
          GitHub isn&apos;t answering right now. My merged work is on{" "}
          <a className="link" href={site.links.github} target="_blank" rel="noopener">
            github.com/janithjay
          </a>
          .
        </p>
      )}
      <a href={`${site.links.github}?tab=overview`} target="_blank" rel="noopener" className="link mt-4 inline-flex items-center gap-1 text-sm">
        All activity on GitHub <Icon name="arrowUpRight" size={14} />
      </a>
    </section>
  );
}
