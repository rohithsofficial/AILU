import PageHero from "@/components/PageHero";
import type { ReactNode } from "react";

export type LegalSection = { title: string; paragraphs: ReactNode[] };
export default function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  return <>
    <PageHero title={title}>{intro}</PageHero>
    <article className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-sm font-medium text-black/75">Last updated: 3 November 2026</p>
      {sections.map((section) => <section key={section.title} className="mt-8"><h2 className="text-2xl font-bold">{section.title}</h2>{section.paragraphs.map((paragraph, index) => <p key={index} className="mt-3 leading-relaxed text-black/85">{paragraph}</p>)}</section>)}
    </article>
  </>;
}
