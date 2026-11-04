import PageHero from "@/components/PageHero";
import type { ReactNode } from "react";

export type LegalSection = { title: string; paragraphs: ReactNode[] };
export default function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  return <>
    <PageHero title={title}>{intro}</PageHero>
    <article className="mx-auto max-w-4xl px-4 py-12 text-ailu-cream">
      <p className="text-sm font-medium text-ailu-cream/50">Last updated: 3 November 2026</p>
      {sections.map((section) => <section key={section.title} className="mt-7 border-t border-white/15 pt-5"><h2 className="font-display text-xl font-semibold">{section.title}</h2>{section.paragraphs.map((paragraph, index) => <p key={index} className="mt-3 text-sm leading-relaxed text-ailu-cream/65">{paragraph}</p>)}</section>)}
    </article>
  </>;
}
