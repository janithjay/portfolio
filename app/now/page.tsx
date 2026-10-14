import type { Metadata } from "next";
import Now, { meta } from "@/content/now.mdx";

export const metadata: Metadata = {
  title: "Now",
  description: "What I'm building, learning and looking for right now.",
  alternates: { canonical: "/now" },
};

const fmt = new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" });

export default function NowPage() {
  const m = meta as { updated: string; location: string };
  return (
    <div className="container-x pt-14">
      <p className="eyebrow">
        Now · updated <time dateTime={m.updated}>{fmt.format(new Date(m.updated))}</time> · {m.location}
      </p>
      <h1 className="mt-3 text-step-5">What I&apos;m doing now</h1>
      <p className="mt-4 max-w-[60ch] text-muted">
        A <a className="link" href="https://nownownow.com/about" target="_blank" rel="noopener">now page</a>: what has my attention this month.
      </p>
      <div className="prose mt-10">
        <Now />
      </div>
    </div>
  );
}
