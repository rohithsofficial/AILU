import Hero from "@/components/Hero";
import CelebrationJourney from "@/components/CelebrationJourney";
import HomeExperience from "@/components/HomeExperience";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";

// Normal World home. The AILU World is at /.
export async function generateMetadata() { return metadataForPath("/classic", (await getContent()).seo); }

export default function ClassicHome() {
  return <>
    <Hero />
    <CelebrationJourney />
    <HomeExperience />
  </>;
}
