import { site } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { T } from "@/components/ui/Placeholders";
import { ModeLink } from "@/components/site/ModeLink";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  const [first, ...rest] = site.name.split(" ");
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden border-b border-line">
      <div className="tech-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden="true" />
      <div className="container-x relative grid gap-10 py-14 sm:py-20 lg:grid-cols-12 lg:gap-12 skim:py-10 skim:lg:min-h-[calc(100svh-4rem)] skim:lg:items-center skim:lg:py-8">
        <div className="lg:col-span-7 skim:lg:col-span-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-bg-elev py-1.5 pl-3 pr-4 text-sm">
              <span className="signal-dot" aria-hidden="true" />
              <span>
                <T>{site.availability.label}</T>
              </span>
            </p>
            <p className="eyebrow deep-only">LK · UTC+05:30 · {site.role}</p>
          </div>

          <h1 id="hero-title" className="mt-8 text-step-6 leading-[0.92] skim:mt-6 skim:text-step-5">
            <span className="block">{first}</span>
            <span className="block italic">
              {rest.join(" ")}
              <span className="ml-3 align-middle font-mono text-[0.16em] not-italic tracking-[0.08em] text-muted">aka {site.handle}</span>
            </span>
          </h1>

          <p className="mt-8 max-w-[34ch] text-step-2 leading-snug text-text skim:mt-6 skim:max-w-[40ch] skim:text-step-1">
            {site.positioning}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 skim:mt-6">
            <a href={site.links.cvPdf} className="btn btn-primary" download>
              <Icon name="download" size={16} /> Download CV
            </a>
            <a href={`mailto:${site.email}`} className="btn btn-ghost">
              <Icon name="mail" size={16} /> Email me
            </a>
            <a href="#playground" className="deep-only link ml-1 inline-flex items-center gap-1 text-sm">
              Or theme my component <Icon name="arrowRight" size={14} />
            </a>
            <a href={site.links.linkedin} className="skim-only btn btn-ghost" target="_blank" rel="noopener">
              <Icon name="linkedin" size={16} /> LinkedIn
            </a>
          </div>
          <p className="skim-only mt-6 font-mono text-xs text-muted">
            This is the 30-second version.{" "}
            <ModeLink to="deep">Switch to Deep for case studies, demos and code</ModeLink>.
          </p>
        </div>

        <div className="deep-only hidden self-center lg:col-span-5 lg:block">
          <HeroVisual />
        </div>

        <div className="skim-only lg:col-span-6">
          <SkimPanel />
        </div>

        <dl className="deep-only grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-8 text-sm lg:col-span-12 lg:grid-cols-4">
          {[
            ["Now", site.role],
            ["Studying", site.education],
            ["Works across", "TypeScript, Go, Python, embedded firmware"],
            ["Based in", `${site.location}. Open to remote or relocation`],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="eyebrow">{k}</dt>
              <dd className="mt-1.5 text-text">{v}</dd>
            </div>
          ))}
        </dl>
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
