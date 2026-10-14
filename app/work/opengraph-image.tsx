import { ogImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Case studies, each with something to poke at.";

export default async function Image() {
  return ogImage({ kicker: "Work", title: "Case studies, each with something to poke at." });
}
