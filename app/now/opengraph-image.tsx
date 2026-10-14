import { ogImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "What I'm building, learning and looking for right now.";

export default async function Image() {
  return ogImage({ kicker: "Now", title: "What I'm building, learning and looking for right now." });
}
