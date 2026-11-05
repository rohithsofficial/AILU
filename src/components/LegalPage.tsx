import PageHero from "@/components/PageHero";
export type LegalContent = { title: string; intro: string; lastUpdated: string; sections: { title: string; paragraphs: string[] }[] };

// Web links typed in a paragraph become real links.
const withLinks = (text: string) => text.split(/(https?:\/\/[^\s]+[^\s.,])/).map((part, index) => index % 2 ? <a key={part} href={part} className="underline decoration-ailu-yellow decoration-2">{part}</a> : part);

export default function LegalPage({ title, intro, lastUpdated, sections }: LegalContent) {
  return <>
    <PageHero title={title}>{intro}</PageHero>
    <article className="mx-auto max-w-4xl px-4 py-12 text-ailu-cream">
      <p className="text-sm font-medium text-ailu-cream/50">Last updated: {lastUpdated}</p>
      {sections.map((section) => <section key={section.title} className="mt-7 border-t border-white/15 pt-5"><h2 className="font-display text-xl font-semibold">{section.title}</h2>{section.paragraphs.map((paragraph, index) => <p key={index} className="mt-3 text-sm leading-relaxed text-ailu-cream/65">{withLinks(paragraph)}</p>)}</section>)}
    </article>
  </>;
}
