import type { Metadata } from "next";
import { FeaturedWork } from "@/components/home/Sections";
import { allWork } from "@/lib/work";

export const metadata: Metadata = {
  title: "Work",
  description: "Case studies: identity SDK components, an autonomous ESP32-S3 robot, power-trace detection and EV battery prediction.",
  alternates: { canonical: "/work" },
};

export default async function WorkIndex() {
  const work = await allWork();
  return (
    <div className="pt-6">
      <h1 className="sr-only">Work</h1>
      <FeaturedWork work={work} />
    </div>
  );
}
