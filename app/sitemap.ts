import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { workSlugs } from "@/lib/work";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/work`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...workSlugs().map((slug) => ({ url: `${base}/work/${slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/now`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/cv`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
