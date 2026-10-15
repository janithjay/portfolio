import { site } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { T } from "@/components/ui/Placeholders";
import { ModeLink } from "@/components/site/ModeLink";

export function Hero() {
  const [first, ...rest] = site.name.split(" ");
  return (
    <section aria-labelledby="skim-title" className="skim-only relative overflow-hidden border-b border-line">
      <div className="tech-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden="true" />
      <div className="container-x relative grid gap-10 py-10 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-8">
        <div className="lg:col-span-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <p className="inline-flex items-center gap-2.5 border border-line bg-bg-elev py-1.5 pl-3 pr-4 text-sm">
              <span className="signal-dot" aria-hidden="true" />
              <span>
                <T>{site.availability.label}</T>
              </span>
            </p>
          </div>

          <h1 id="skim-title" className="mt-6 font-display text-[clamp(3rem,1rem+7vw,7.5rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.035em]">
            <span className="block">
              {first}
              <span className="hero-aka">/{site.handle}</span>
            </span>
            <span className="block">{rest.join(" ")}</span>
          </h1>

          <p className="mt-6 max-w-[40ch] text-step-1 leading-snug text-text">
            {site.positioning}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href={site.links.cvPdf} className="btn btn-primary" download>
              <Icon name="download" size={16} /> Download CV
            </a>
            <a href={`mailto:${site.email}`} className="btn btn-ghost">
              <Icon name="mail" size={16} /> Email me
            </a>
            <a href={site.links.linkedin} className="btn btn-ghost" target="_blank" rel="noopener">
              <Icon name="linkedin" size={16} /> LinkedIn
            </a>
          </div>
          <p className="mt-6 font-mono text-xs text-muted">
            This is the 30-second version.{" "}
            <ModeLink to="deep">Switch to Deep for case studies, demos and code</ModeLink>.
          </p>
        </div>

        <div className="lg:col-span-6">
          <SkimPanel />
        </div>

      </div>
    </section>
  );
}

/** The recruiter view: three outcomes and the stack, readable in one screen. */
function SkimPanel() {
  return (
    <div className="card p-[var(--space-card)]">
      <h2 className="eyebrow">Three things I&apos;ve shipped</h2>
      <ol className="mt-3 divide-y divide-line">
        {site.achievements.map((a, i) => (
          <li key={a.title}>
            <a href={a.href} className="group grid grid-cols-[2rem_1fr] gap-x-3 py-3.5">
              <span className="font-mono text-xs text-muted">0{i + 1}</span>
              <span>
                <span className="block font-medium leading-snug group-hover:underline">{a.title}</span>
                <span className="mt-1 block font-mono text-xs text-accent-ink">
                  <T>{a.metric}</T>
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
      <h2 className="eyebrow mt-5 border-t border-line pt-5">Stack</h2>
      <dl className="mt-3 space-y-2 text-sm">
        {site.stack.map((g) => (
          <div key={g.group} className="grid grid-cols-[7.5rem_1fr] gap-3">
            <dt className="text-muted">{g.group}</dt>
            <dd>
              <T>{g.items.join(" · ")}</T>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
