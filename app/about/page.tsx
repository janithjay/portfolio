import type { Metadata } from "next";
import About from "@/content/about.mdx";
import { AskButton } from "@/components/palette/Overlays";
import { Icon } from "@/components/ui/Icon";
import { T } from "@/components/ui/Placeholders";
import { getFaq } from "@/lib/faq";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "How I work, what I'm looking for next, and answers to the questions recruiters usually ask.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const faq = getFaq();
  return (
    <div className="container-x pt-14">
      <p className="eyebrow">About</p>
      <h1 className="mt-3 max-w-[18ch] text-step-5">I build the layer other developers build on.</h1>
      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <div className="prose lg:col-span-7">
          <About />
        </div>
        <aside className="lg:col-span-5">
          <div className="card sticky top-24 p-[var(--space-card)]">
            <p className="eyebrow">Quick facts</p>
            <dl className="mt-3 space-y-3 text-sm">
              {[
                ["Role", site.role],
                ["Education", site.education],
                ["Location", `${site.location} · remote or relocation`],
                ["Availability", site.availability.label],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[7rem_1fr] gap-3">
                  <dt className="text-muted">{k}</dt>
                  <dd>
                    <T>{v!}</T>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={site.links.cvPdf} className="btn btn-primary" download>
                <Icon name="download" size={16} /> CV
              </a>
              <a href={`mailto:${site.email}`} className="btn btn-ghost">
                <Icon name="mail" size={16} /> Email
              </a>
            </div>
          </div>
        </aside>
      </div>

      <section id="faq" aria-labelledby="faq-title" className="mt-[var(--space-section)] scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
          <h2 id="faq-title" className="text-step-4">
            FAQ
          </h2>
          <AskButton className="btn btn-ghost">
            <Icon name="spark" size={16} /> Ask a question instead
          </AskButton>
        </div>
        <div className="divide-y divide-line">
          {faq.map((f) => (
            <details key={f.id} id={f.id} className="group scroll-mt-24 py-2">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-2 text-step-1 [&::-webkit-details-marker]:hidden">
                <span>{f.question}</span>
                <span aria-hidden="true" className="font-mono text-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="max-w-[var(--measure)] space-y-3 pb-4 text-muted">
                {f.answer.map((p, i) => (
                  <p key={i}>
                    <T>{p}</T>
                  </p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
