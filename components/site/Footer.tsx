import Link from "next/link";
import { site } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";

export function Footer() {
  return (
    <footer className="no-print mt-[var(--space-section)] border-t border-line">
      <div className="container-x grid gap-8 py-10 text-sm text-muted md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="heading text-step-2 text-text">Let&apos;s build something people log into.</p>
          <p className="mt-2 max-w-prose">
            Built with Next.js, TypeScript and a token system you can edit in the{" "}
            <Link href="/#playground" className="link">
              playground
            </Link>
            . No trackers, no cookies.
          </p>
        </div>
        <ul className="flex flex-wrap items-center gap-2">
          <li>
            <a className="btn btn-ghost" href={`mailto:${site.email}`}>
              <Icon name="mail" size={16} /> Email
            </a>
          </li>
          <li>
            <a className="btn btn-ghost" href={site.links.github} rel="me noopener" target="_blank">
              <Icon name="github" size={16} /> GitHub
            </a>
          </li>
          <li>
            <a className="btn btn-ghost" href={site.links.linkedin} rel="me noopener" target="_blank">
              <Icon name="linkedin" size={16} /> LinkedIn
            </a>
          </li>
        </ul>
      </div>
      <div className="container-x flex flex-wrap justify-between gap-2 border-t border-line py-4 font-mono text-xs text-muted">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <span>
          Press <kbd className="kbd">⌘K</kbd> anywhere
        </span>
      </div>
    </footer>
  );
}
