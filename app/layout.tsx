import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Overlays } from "@/components/palette/Overlays";
import type { PaletteItem } from "@/components/palette/types";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { ThemeScript } from "@/components/site/ThemeScript";
import { site, siteUrl } from "@/lib/site";
import { allWork } from "@/lib/work";
import "./globals.css";

const inter = localFont({
  src: "./fonts/inter-var.woff2",
  variable: "--font-inter",
  weight: "100 900",
  // optional: on a slow first visit, keep the metric-matched fallback instead of swapping late (no LCP re-paint)
  display: "optional",
});

const instrument = localFont({
  src: [
    { path: "./fonts/instrument-serif.woff2", weight: "400", style: "normal" },
    { path: "./fonts/instrument-serif-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/jetbrains-mono.woff2",
  variable: "--font-jetbrains",
  weight: "400",
  display: "optional",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.name}: identity SDKs, Go, ML & robotics`,
    template: `%s · ${site.name}`,
  },
  description: site.positioning,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.links.github }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en",
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#070b14" },
  ],
  colorScheme: "light dark",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const work = await allWork();
  const items: PaletteItem[] = [
    { id: "home", label: "Home", href: "/", group: "Pages" },
    { id: "work", label: "All work", href: "/work", group: "Pages" },
    { id: "about", label: "About", href: "/about", group: "Pages", keywords: ["story", "faq"] },
    { id: "now", label: "Now", href: "/now", group: "Pages", keywords: ["current", "learning"] },
    { id: "cv", label: "CV", href: "/cv", group: "Pages", keywords: ["resume"] },
    ...work.map((w) => ({
      id: `work-${w.slug}`,
      label: w.title,
      href: `/work/${w.slug}`,
      group: "Work" as const,
      hint: w.kicker,
      keywords: w.stack,
    })),
    { id: "s-playground", label: "Identity component playground", href: "/#playground", group: "Sections", keywords: ["theme", "tokens", "demo"] },
    { id: "s-proof", label: "Recent GitHub activity", href: "/#proof", group: "Sections", keywords: ["prs", "commits"] },
    { id: "s-contact", label: "Contact", href: "/#contact", group: "Sections", keywords: ["email", "hire"] },
    { id: "l-github", label: "GitHub", href: site.links.github, group: "Links" },
    { id: "l-linkedin", label: "LinkedIn", href: site.links.linkedin, group: "Links" },
  ];

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    alternateName: site.handle,
    url: siteUrl(),
    email: `mailto:${site.email}`,
    jobTitle: "Software Engineer",
    description: site.positioning,
    worksFor: { "@type": "Organization", name: "WSO2" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "General Sir John Kotelawala Defence University" },
    address: { "@type": "PostalAddress", addressCountry: "LK" },
    knowsAbout: ["Identity and access management", "TypeScript", "React", "Next.js", "Vue", "Nuxt", "Go", "Machine learning", "Embedded systems"],
    sameAs: [site.links.github, site.links.linkedin],
  };

  return (
    <html
      lang="en"
      data-mode="deep"
      suppressHydrationWarning
      className={`${inter.variable} ${instrument.variable} ${mono.variable}`}
    >
      <head>
        <ThemeScript />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only z-[60] rounded-[var(--radius)] bg-accent px-4 py-2 text-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        <Overlays items={items} />
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
