import Link from "next/link";
import { LAYERS } from "@/lib/stack";
import { site } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { T } from "@/components/ui/Placeholders";
import { StackCss } from "./StackCss";
import { StackStage } from "./StackStage";

/**
 * Deep-mode hero + scroll story. A sticky 3D stage sits behind normal-flow content,
 * so scrolling stays native (no scroll-jacking): the hero scrolls away, the stack
 * explodes, and each chapter lights up its layer.
 */
export function StackStory() {
  const [first, ...rest] = site.name.split(" ");
  return (
    <section aria-labelledby="hero-title" className="stack-story deep-only relative" data-active="-1">
      <StackStage>
        <StackCss />
      </StackStage>

      <div className="relative z-10 -mt-[100svh]">
        {/* Hero */}
        <header className="container-x flex min-h-[100svh] flex-col justify-between pb-10 pt-24 sm:pb-14">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <p className="inline-flex items-center gap-2.5 border border-line bg-bg/80 py-1.5 pl-3 pr-4 text-sm backdrop-blur-sm">
              <span className="signal-dot" aria-hidden="true" />
              <span>
                <T>{site.availability.label}</T>
              </span>
            </p>
            <ul className="hud flex flex-wrap gap-x-5 gap-y-1">
              <li>Sri Lanka · UTC+05:30</li>
              <li>SE Intern · WSO2</li>
              <li>BSc CompEng · final year</li>
            </ul>
          </div>

          <div>
            <h1 id="hero-title" className="hero-name">
              <span className="block">
                {first}
                <span className="hero-aka">/{site.handle}</span>
              </span>
              <span className="block">{rest.join(" ")}</span>
            </h1>
            <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-6">
              <p className="max-w-[34ch] text-step-1 leading-snug">{site.positioning}</p>
              <div className="flex flex-wrap items-center gap-3">
                <a href={site.links.cvPdf} className="btn btn-primary" download>
                  <Icon name="download" size={16} /> Download CV
                </a>
                <a href={`mailto:${site.email}`} className="btn btn-ghost bg-bg/60 backdrop-blur-sm">
                  <Icon name="mail" size={16} /> Email me
                </a>
              </div>
            </div>
          </div>

          <p className="hud flex items-center gap-3">
            <span className="scroll-cue" aria-hidden="true" />
            Scroll to explode the stack
          </p>
        </header>

        {/* Chapters */}
        <h2 className="sr-only">The stack I work across</h2>
        <ol className="container-x pb-[20svh]">
          {LAYERS.map((l, i) => (
            <li key={l.id} data-chapter={i} className="flex min-h-[85svh] items-center py-10">
              <article className="chapter ticks w-full max-w-[28rem] border border-line bg-bg/85 p-[var(--space-card)] backdrop-blur-md">
                <p className="hud flex justify-between">
                  <span className="text-accent-ink">
                    {l.code} / {l.name}
                  </span>
                  <span>
                    0{i + 1} — 0{LAYERS.length}
                  </span>
                </p>
                <h3 className="mt-4 text-step-4">{l.title}</h3>
                <p className="mt-4 text-muted">{l.body}</p>
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {l.tags.map((t) => (
                    <li key={t} className="chip">
                      {t}
                    </li>
                  ))}
                </ul>
                <Link href={l.href} className="group mt-6 inline-flex items-center gap-2 font-medium" transitionTypes={["nav-forward"]}>
                  <span className="border-b border-accent-ink pb-0.5">{l.cta}</span>
                  <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
