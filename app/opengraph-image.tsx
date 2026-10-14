import { ogImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "I build the identity layer developers drop into their apps.";

export default async function Image() {
  return ogImage({ kicker: "Portfolio", title: "I build the identity layer developers drop into their apps." });
}
