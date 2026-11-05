import Hero from "@/components/Hero";
import CelebrationJourney from "@/components/CelebrationJourney";
import HomeExperience from "@/components/HomeExperience";
import { metadataForPath } from "@/lib/public-metadata";

// Normal World home. The AILU World is at /.
export const metadata = metadataForPath("/classic");

export default function ClassicHome() {
  return <>
    <Hero />
    <CelebrationJourney />
    <HomeExperience />
  </>;
}
