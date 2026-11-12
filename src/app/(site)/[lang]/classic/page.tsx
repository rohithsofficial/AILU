import Hero from "@/components/Hero";
import CelebrationJourney from "@/components/CelebrationJourney";
import HomeExperience from "@/components/HomeExperience";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";
import { toLocale, type LangParams } from "@/lib/i18n";

// Normal World home. The AILU World is at /.
export async function generateMetadata({ params }: LangParams) { const locale = toLocale(params.lang); return metadataForPath("/classic", (await getContent(locale)).seo, locale); }

export default function ClassicHome({ params }: LangParams) {
  return <>
    <Hero />
    <CelebrationJourney />
    <HomeExperience locale={toLocale(params.lang)} />
  </>;
}
