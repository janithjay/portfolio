import { ogImage, OG_SIZE } from "@/lib/og";
import { loadWork, workSlugs } from "@/lib/work";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Case study by Janith Jayashan";

export function generateStaticParams() {
  return workSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = await loadWork(slug);
  return ogImage({ kicker: mod?.meta.kicker ?? "Case study", title: mod?.meta.title ?? "Case study", footer: "case study + live demo" });
}
