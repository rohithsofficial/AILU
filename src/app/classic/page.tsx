import type { Metadata } from "next";
import Hero from "@/components/Hero";
import CelebrationJourney from "@/components/CelebrationJourney";
import HomeExperience from "@/components/HomeExperience";

export const metadata: Metadata = {
  title: "Classic AILU homepage",
  robots: { index: false, follow: false },
};

export default function ClassicHome() {
  return <>
    <Hero />
    <CelebrationJourney />
    <HomeExperience />
  </>;
}
