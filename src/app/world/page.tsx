import type { Metadata } from "next";
import AiluWorld from "@/components/AiluWorld/AiluWorld";

export const metadata: Metadata = {
  title: "AILU | Enter the 360° world",
  description: "Step inside AILU: weddings, birthdays, corporate events, stage nights and community celebrations in Udupi.",
};

export default function WorldPage() {
  return <AiluWorld />;
}
