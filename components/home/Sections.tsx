import Link from "next/link";
import { ViewTransition } from "react";
import { site } from "@/lib/site";
import type { WorkMeta } from "@/lib/work";
import { Icon } from "@/components/ui/Icon";
import { T } from "@/components/ui/Placeholders";
import { PlaygroundDemo } from "@/components/demos";
import { AskButton } from "@/components/palette/Overlays";
import { CopyEmail } from "./CopyEmail";

export function SectionHead({ n, title, id, children }: { n: string; title: string; id: string; children?: React.ReactNode }) {
  const [num, ...label] = n.split(" · ");
  return (
    <div className="title-block">
      <div className="title-block__meta hud">
        <span>
          <span className="text-accent-ink">{num}</span> / {label.join(" · ")}
        </span>
        <span aria-hidden="true">jj—sheet {num}/06</span>
      </div>
      <div className="grid gap-5 pt-6 md:grid-cols-12 md:items-end">
        <h2 id={id} className="text-step-5 md:col-span-8">
          {title}
        </h2>
        {children && <div className="text-muted md:col-span-4 md:pb-2">{children}</div>}
      </div>
    </div>
  );
}

const DEMO_LABEL: Record<WorkMeta["demo"], string> = {
  playground: "Live component playground",
  robot: "Robot simulator",
  "power-trace": "Threshold lab",
  battery: "Capacity explorer",
};

export function FeaturedWork({ work }: { work: WorkMeta[] }) {
  return (
    <section aria-labelledby="work-title" className="container-x pt-[var(--space-section)]">
      <SectionHead n="01 · Index of work" title="Case studies, each with something to poke at" id="work-title">
        <p>
          Every project has an interactive demo and an honest &ldquo;what went wrong&rdquo;.
        </p>
      </SectionHead>
      <ol>
        {work.map((w, i) => (
          <li key={w.slug} className="reveal border-b border-line">
            <Link
              href={`/work/${w.slug}`}
              transitionTypes={["nav-forward"]}
              className="work-row group grid gap-x-8 gap-y-3 py-8 md:grid-cols-12 md:py-10"
            >
              <span className="font-display text-step-4 font-extrabold leading-none text-muted transition-colors group-hover:text-accent-ink md:col-span-1">
                0{i + 1}
              </span>
              <span className="md:col-span-7">
                <span className="eyebrow block">{w.kicker}</span>
                <ViewTransition name={`work-title-${w.slug}`} share="morph" default="none">
                  <span className="heading mt-2 block text-step-4 transition-transform duration-300 group-hover:translate-x-2">{w.title}</span>
                </ViewTransition>
                <span className="deep-only mt-3 block max-w-[60ch] text-muted">
                  <T>{w.summary}</T>
                </span>
              </span>
              <span className="flex flex-col gap-3 md:col-span-4 md:items-end md:text-right">
                <span className="deep-only flex flex-wrap gap-1.5 md:justify-end">
                  {w.stack.slice(0, 4).map((s) => (
                    <span key={s} className="chip">
                      <T>{s}</T>
                    </span>
                  ))}
                </span>
                <span className="inline-flex items-center gap-2 font-mono text-xs text-muted">
                  <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" /> {DEMO_LABEL[w.demo]}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                  Read case study
                  <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PlaygroundSection() {
  return (
    <section id="playground" aria-labelledby="playground-title" className="deep-only scroll-mt-20 pt-[var(--space-section)]">
      <div className="container-x">
        <SectionHead n="02 · Playground" title="Don't take my word for it. Theme my component." id="playground-title">
          <p>
            A working sign-in and profile flow in the style of what I ship at WSO2. Change the tokens, switch frameworks, then apply
            your theme to this whole site.
          </p>
        </SectionHead>
        <div className="mt-8">
          <PlaygroundDemo />
        </div>
      </div>
    </section>
  );
}

export function DemosTeaser({ work }: { work: WorkMeta[] }) {
  const others = work.filter((w) => w.demo !== "playground");
  return (
    <section aria-labelledby="demos-title" className="container-x deep-only pt-[var(--space-section)]">
      <SectionHead n="03 · More to try" title="Hardware and ML, interactive" id="demos-title" />
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {others.map((w) => (
          <li key={w.slug} className="reveal">
            <Link href={`/work/${w.slug}#demo`} className="card group flex h-full flex-col p-[var(--space-card)] transition-colors hover:border-line-strong">
              <DemoGlyph kind={w.demo} />
              <span className="eyebrow mt-6">{DEMO_LABEL[w.demo]}</span>
              <span className="heading mt-2 text-step-2">{w.title}</span>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium">
                Open the demo <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DemoGlyph({ kind }: { kind: WorkMeta["demo"] }) {
  const common = { width: "100%", height: 88, viewBox: "0 0 240 88", "aria-hidden": true as const };
  if (kind === "robot")
    return (
      <svg {...common}>
        <rect x="8" y="8" width="224" height="72" rx="6" fill="none" stroke="var(--line-strong)" strokeDasharray="4 4" />
        <path d="M30 60 C 70 60, 80 25, 120 25 S 170 55, 200 30" fill="none" stroke="var(--accent)" strokeWidth="14" strokeOpacity="0.25" strokeLinecap="round" />
        <circle cx="200" cy="30" r="10" fill="var(--text)" />
        <circle cx="140" cy="58" r="9" fill="var(--text-muted)" />
      </svg>
    );
  if (kind === "power-trace")
    return (
      <svg {...common}>
        <path d="M0 60 L20 58 L30 62 L45 57 L55 20 L62 58 L80 60 L100 56 L110 61 L125 35 L132 59 L150 57 L170 61 L182 12 L190 58 L215 60 L240 57" fill="none" stroke="var(--text)" strokeWidth="1.5" />
        <line x1="0" x2="240" y1="42" y2="42" stroke="var(--warm)" strokeDasharray="5 4" strokeWidth="1.5" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M8 14 C 80 16, 150 28, 232 64" fill="none" stroke="var(--accent-ink)" strokeWidth="2.5" />
      <line x1="8" x2="232" y1="50" y2="50" stroke="var(--warm)" strokeDasharray="5 4" />
      <circle cx="150" cy="31" r="6" fill="var(--accent)" />
    </svg>
  );
}

export function SkimWork({ work }: { work: WorkMeta[] }) {
  return (
    <section aria-labelledby="skim-work-title" className="container-x skim-only pt-12">
      <h2 id="skim-work-title" className="eyebrow">
        Case studies
      </h2>
      <ul className="mt-3 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-2">
        {work.map((w) => (
          <li key={w.slug} className="bg-bg">
            <Link href={`/work/${w.slug}`} className="group flex items-center justify-between gap-4 p-5 hover:bg-surface">
              <span>
                <span className="eyebrow block">{w.kicker}</span>
                <span className="mt-1 block font-medium group-hover:underline">{w.title}</span>
              </span>
              <Icon name="arrowRight" size={18} className="shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AboutTeaser() {
  return (
    <section aria-labelledby="about-title" className="container-x deep-only pt-[var(--space-section)]">
      <SectionHead n="05 · About" title="Layers other people build on" id="about-title" />
      <div className="mt-8 grid gap-10 md:grid-cols-12">
        <div className="space-y-4 text-step-1 leading-relaxed md:col-span-7">
          <p>
            I&apos;m a final-year Computer Engineering student in Sri Lanka and a Software Engineering Intern at WSO2, where I build the
            self-service identity components in ThunderID.
          </p>
          <p className="text-muted">
            A good SDK component disappears into someone else&apos;s product. It takes on their brand, works with their keyboard users,
            and nobody has to think about the auth flow under it. I like building that kind of layer, whether it&apos;s a Vue
            component, a Go endpoint, or firmware that won&apos;t let a robot reverse.
          </p>
          <Link href="/about" className="link inline-flex items-center gap-1 text-base">
            How I work and what I&apos;m looking for <Icon name="arrowRight" size={16} />
          </Link>
        </div>
        <ul className="space-y-4 border-l border-line pl-6 md:col-span-5">
          {[
            ["Contracts first", "Props, tokens and events before pixels. Theming is an API."],
            ["Proof over adjectives", "If I claim it, there's a demo, a PR or a number."],
            ["Write down what broke", "Every case study has a what-went-wrong section."],
          ].map(([t, d]) => (
            <li key={t}>
              <p className="font-medium">{t}</p>
              <p className="text-sm text-muted">{d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="container-x scroll-mt-20 pt-[var(--space-section)] skim:pt-12">
      <div className="card ticks relative overflow-hidden p-[calc(var(--space-card)*1.5)]">
        <div className="tech-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative">
          <p className="eyebrow">06 · Contact</p>
          <h2 id="contact-title" className="mt-2 max-w-[18ch] text-step-5">
            Hiring for platform, identity or full-stack?
          </h2>
          <p className="mt-3 max-w-[56ch] text-muted">
            <T>{`${site.availability.label}. ${site.availability.detail}`}</T> I usually reply within a day.
          </p>
          <div className="mt-8">
            <CopyEmail email={site.email} />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={site.links.cvPdf} className="btn btn-primary" download>
              <Icon name="download" size={16} /> Download CV
            </a>
            <a href={site.links.linkedin} className="btn btn-ghost" target="_blank" rel="noopener">
              <Icon name="linkedin" size={16} /> LinkedIn
            </a>
            <a href={site.links.github} className="btn btn-ghost" target="_blank" rel="noopener">
              <Icon name="github" size={16} /> GitHub
            </a>
            <AskButton className="btn btn-ghost">
              <Icon name="spark" size={16} /> Ask about me
            </AskButton>
          </div>
        </div>
      </div>
    </section>
  );
}
