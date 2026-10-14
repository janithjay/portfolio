import site from "@/content/site.json";

export type Site = typeof site;
export { site };

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const isPlaceholder = (value: string | undefined | null) => !value || /^\[.*\]$/.test(value.trim());
