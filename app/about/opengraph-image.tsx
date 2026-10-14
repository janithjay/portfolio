import { ogImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "I build the layer other developers build on.";

export default async function Image() {
  return ogImage({ kicker: "About", title: "I build the layer other developers build on." });
}
