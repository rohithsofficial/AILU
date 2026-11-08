// The AILU World at "/": the 360 degree world and the poster shown while it loads.
// The intro and the "Explore Website" switch are added by layout.tsx in this folder.
import type { Metadata } from "next";
import AiluWorld from "@/components/AiluWorld/AiluWorld";
import WorldPoster from "@/components/AiluWorld/WorldPoster";
import { buildWorldMarkup } from "@/components/AiluWorld/worldMarkup";
import { BODY_HTML } from "@/components/AiluWorld/body";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getContent();
  const base = metadataForPath("/", seo);
  return { ...base, title: { absolute: String(base.title) } };
}

export default async function Home() {
  const { world, settings } = await getContent();
  return <><AiluWorld markup={buildWorldMarkup(BODY_HTML, world)} /><WorldPoster tagline={settings.tagline} /></>;
}
