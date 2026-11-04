import type { Metadata } from "next";
import AiluWorld from "@/components/AiluWorld/AiluWorld";
import { metadataForPath } from "@/lib/public-metadata";

const base = metadataForPath("/");
export const metadata: Metadata = { ...base, title: { absolute: "AILU | Enter the 360° world" } };

export default function Home() {
  return <AiluWorld />;
}
