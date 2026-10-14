import { Hero } from "@/components/home/Hero";
import { ProofStrip } from "@/components/home/ProofStrip";
import { AboutTeaser, Contact, DemosTeaser, FeaturedWork, PlaygroundSection, SkimWork } from "@/components/home/Sections";
import { getProof } from "@/lib/github";
import { allWork } from "@/lib/work";

export const revalidate = 21600;

export default async function Home() {
  const [work, proof] = await Promise.all([allWork(), getProof()]);
  return (
    <>
      <Hero />
      <SkimWork work={work} />
      <div className="deep-only">
        <FeaturedWork work={work} />
      </div>
      <PlaygroundSection />
      <DemosTeaser work={work} />
      <ProofStrip data={proof} />
      <AboutTeaser />
      <Contact />
    </>
  );
}
