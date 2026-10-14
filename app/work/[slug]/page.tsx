import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { T } from "@/components/ui/Placeholders";
import { siteUrl } from "@/lib/site";
import { allWork, loadWork, workHeadings, workSlugs } from "@/lib/work";

export const dynamicParams = false;

export function generateStaticParams() {
  return workSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const mod = await loadWork(slug);
  if (!mod) return {};
  return {
    title: mod.meta.title,
    description: mod.meta.summary.replace(/\[[^\]]+\]/g, "").replace(/\s+/g, " "),
    alternates: { canonical: `/work/${slug}` },
    openGraph: { type: "article", url: `/work/${slug}` },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = await loadWork(slug);
  if (!mod) notFound();
  const { default: Content, meta } = mod;
  const headings = workHeadings(slug);
  const all = await allWork();
  const idx = all.findIndex((w) => w.slug === slug);
  const next = all[(idx + 1) % all.length]!;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: meta.title,
    abstract: meta.summary,
    url: `${siteUrl()}/work/${slug}`,
    author: { "@type": "Person", name: "Janith Jayashan", url: siteUrl() },
    keywords: meta.stack.join(", "),
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <header className="relative overflow-hidden border-b border-line">
        <div className="tech-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden="true" />
        <div className="container-x relative py-12 sm:py-16">
          <Link href="/work" transitionTypes={["nav-back"]} className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-text">
            <Icon name="arrowRight" size={14} className="rotate-180" /> All work
          </Link>
          <p className="eyebrow mt-8">{meta.kicker}</p>
          <ViewTransition name={`work-title-${slug}`} share="morph" default="none">
            <h1 className="mt-3 max-w-[22ch] text-step-5">{meta.title}</h1>
          </ViewTransition>
          <p className="mt-6 max-w-[60ch] text-step-1 text-muted">
            <T>{meta.summary}</T>
          </p>
          <dl className="mt-10 grid gap-6 border-t border-line pt-6 text-sm sm:grid-cols-3">
            <div>
              <dt className="eyebrow">Role</dt>
              <dd className="mt-1.5">
                <T>{meta.role}</T>
              </dd>
            </div>
            <div>
              <dt className="eyebrow">When</dt>
              <dd className="mt-1.5">
                <T>{meta.period}</T>
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Links</dt>
              <dd className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                {meta.links.map((l) =>
                  /^\[.*\]$/.test(l.href) ? (
                    <span key={l.label} className="text-muted">
                      {l.label} <span className="placeholder">{l.href}</span>
                    </span>
                  ) : (
                    <a key={l.label} href={l.href} className="link" {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}>
                      {l.label}
                    </a>
                  ),
                )}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="container-x grid gap-12 pt-12 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
        <aside className="no-print hidden lg:block">
          <nav aria-label="On this page" className="sticky top-24">
            <p className="eyebrow">On this page</p>
            <ol className="mt-3 space-y-1.5 border-l border-line text-sm">
              {headings.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="-ml-px block border-l border-transparent pl-3 text-muted hover:border-accent-ink hover:text-text">
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="min-w-0">
          <section aria-labelledby="tldr" className="card mb-10 max-w-[var(--measure)] p-[var(--space-card)]">
            <h2 id="tldr" className="eyebrow">
              TL;DR <span className="skim-only normal-case tracking-normal">· Skim mode: deep sections are collapsed</span>
            </h2>
            <ul className="mt-3 space-y-2">
              {meta.tldr.map((t) => (
                <li key={t} className="grid grid-cols-[1rem_1fr] gap-2">
                  <span className="mt-[0.7em] h-px w-3 bg-accent-ink" aria-hidden="true" />
                  <span>
                    <T>{t}</T>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {meta.stack.map((s) => (
                <span key={s} className="chip">
                  <T>{s}</T>
                </span>
              ))}
            </div>
          </section>

          <div className="prose">
            <Content />
          </div>

          <nav aria-label="Next case study" className="mt-16 border-t border-line pt-8">
            <Link href={`/work/${next.slug}`} transitionTypes={["nav-forward"]} className="group block">
              <span className="eyebrow">Next case study</span>
              <span className="heading mt-2 flex items-center gap-3 text-step-3 group-hover:text-accent-ink">
                {next.title} <Icon name="arrowRight" size={24} className="shrink-0 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </article>
  );
}
