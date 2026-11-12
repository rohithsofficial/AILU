import PageHero from "@/components/PageHero";
export type LegalContent = { title: string; intro: string; lastUpdated: string; sections: { title: string; paragraphs: string[] }[] };

// Web links typed in a paragraph become real links.
const withLinks = (text: string) => text.split(/(https?:\/\/[^\s]+[^\s.,])/).map((part, index) => index % 2 ? <a key={part} href={part} className="break-all underline decoration-ailu-yellow decoration-2">{part}</a> : part);

// `ui` carries the small words in the page language; `translated` adds the "English version applies" note.
export default function LegalPage({ title, intro, lastUpdated, sections, ui, translated = false }: LegalContent & { ui?: { pageMarker: string; lastUpdated: string; language: { legalNote: string } }; translated?: boolean }) {
  return <>
    <PageHero title={title} marker={ui?.pageMarker}>{intro}</PageHero>
    <article className="mx-auto max-w-4xl px-4 py-12 text-ailu-cream">
      {translated && ui ? <p className="mb-5 rounded-sm border border-ailu-yellow/45 bg-ailu-yellow/10 p-4 text-sm">{ui.language.legalNote}</p> : null}
      <p className="text-sm font-medium text-ailu-cream/50">{ui?.lastUpdated ?? "Last updated:"} {lastUpdated}</p>
      {sections.map((section) => <section key={section.title} className="mt-7 border-t border-white/15 pt-5"><h2 className="font-display text-xl font-semibold">{section.title}</h2>{section.paragraphs.map((paragraph, index) => <p key={index} className="mt-3 text-sm leading-relaxed text-ailu-cream/65">{withLinks(paragraph)}</p>)}</section>)}
    </article>
  </>;
}
