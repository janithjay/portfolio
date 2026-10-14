import type { Metadata } from "next";
import cv from "@/content/cv.json";
import { Icon } from "@/components/ui/Icon";
import { T } from "@/components/ui/Placeholders";
import { site } from "@/lib/site";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = {
  title: "CV",
  description: `${cv.name}: ${cv.headline}. ATS-friendly CV with a PDF download.`,
  alternates: { canonical: "/cv" },
};

/** Plain semantic HTML, single column, standard headings: parses cleanly in ATS tools and prints to one page. */
export default function CvPage() {
  return (
    <div className="container-x max-w-4xl pt-12 print:max-w-none print:px-0 print:pt-0">
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Curriculum vitae</p>
        <div className="flex flex-wrap gap-2">
          <a href={site.links.cvPdf} className="btn btn-primary" download>
            <Icon name="download" size={16} /> Download PDF
          </a>
          <PrintButton />
        </div>
      </div>

      <article className="card p-[calc(var(--space-card)*1.4)] print:border-0 print:p-0">
        <header className="border-b border-line pb-6">
          <h1 className="text-step-5 print:text-[26pt]">{cv.name}</h1>
          <p className="mt-2 text-step-1">{cv.headline}</p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm text-muted">
            <span>{cv.location}</span>
            <a href={`mailto:${cv.contact.email}`}>{cv.contact.email}</a>
            <a href={`https://${cv.contact.github}`}>{cv.contact.github}</a>
            <a href={`https://www.${cv.contact.linkedin}`}>{cv.contact.linkedin}</a>
          </p>
        </header>

        <section id="summary" aria-labelledby="cv-summary" className="py-6">
          <h2 id="cv-summary" className="eyebrow">
            Summary
          </h2>
          <p className="mt-2">
            <T>{cv.summary}</T>
          </p>
        </section>

        <section id="experience" aria-labelledby="cv-exp" className="border-t border-line py-6">
          <h2 id="cv-exp" className="eyebrow">
            Experience
          </h2>
          {cv.experience.map((e) => (
            <div key={e.org} className="mt-3">
              <h3 className="font-sans text-step-0 font-semibold tracking-normal">
                {e.role}, {e.org}
              </h3>
              <p className="font-mono text-sm text-muted">
                <T>{`${e.period} · ${e.location}`}</T>
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {e.bullets.map((b) => (
                  <li key={b}>
                    <T>{b}</T>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section id="projects" aria-labelledby="cv-proj" className="border-t border-line py-6">
          <h2 id="cv-proj" className="eyebrow">
            Projects
          </h2>
          <ul className="mt-3 space-y-3">
            {cv.projects.map((p) => (
              <li key={p.name}>
                <h3 className="font-sans text-step-0 font-semibold tracking-normal">{p.name}</h3>
                <p>
                  <T>{p.detail}</T>
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section id="education" aria-labelledby="cv-edu" className="border-t border-line py-6">
          <h2 id="cv-edu" className="eyebrow">
            Education
          </h2>
          {cv.education.map((e) => (
            <div key={e.org} className="mt-3">
              <h3 className="font-sans text-step-0 font-semibold tracking-normal">{e.degree}</h3>
              <p>
                {e.org} · <T>{e.period}</T>
              </p>
              <p className="text-muted">
                <T>{e.detail}</T>
              </p>
            </div>
          ))}
        </section>

        <section id="skills" aria-labelledby="cv-skills" className="border-t border-line pt-6">
          <h2 id="cv-skills" className="eyebrow">
            Skills
          </h2>
          <dl className="mt-3 space-y-1.5">
            {cv.skills.map((s) => (
              <div key={s.group} className="grid gap-x-4 sm:grid-cols-[8rem_1fr]">
                <dt className="font-semibold">{s.group}</dt>
                <dd>
                  <T>{s.items.join(", ")}</T>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </article>
    </div>
  );
}
