import { ogImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Software engineer: identity SDKs, Go, ML and embedded.";

export default async function Image() {
  return ogImage({ kicker: "CV", title: "Software engineer: identity SDKs, Go, ML and embedded." });
}
