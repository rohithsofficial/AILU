import type { Metadata } from "next";
import AiluWorld from "@/components/AiluWorld/AiluWorld";
import { metadataForPath } from "@/lib/public-metadata";
import { SITE_CONTENT } from "@/content/site";

const base = metadataForPath("/");
export const metadata: Metadata = { ...base, title: { absolute: SITE_CONTENT.worldTitle } };

export default function Home() {
  return <AiluWorld />;
}
