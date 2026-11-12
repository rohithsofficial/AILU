// Normal World: frequently asked questions, plus FAQ structured data for Google.
import PageHero from "@/components/PageHero";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";
import { toLocale, type LangParams } from "@/lib/i18n";

export async function generateMetadata({ params }: LangParams) { const locale = toLocale(params.lang); return metadataForPath("/faq", (await getContent(locale)).seo, locale); }

export default async function FAQPage({ params }: LangParams) {
  const content = await getContent(toLocale(params.lang));
  const t = content.faqPage;
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: content.faqs.items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };
  return <>
    <PageHero marker={content.ui.pageMarker} title={t.title}>{t.lead}</PageHero>
    <div className="mx-auto max-w-4xl px-4 py-12"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="divide-y divide-white/15 border-y border-white/15">{content.faqs.items.map((item) => <details key={item.question} className="group py-4"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-semibold [&::-webkit-details-marker]:hidden sm:text-lg">{item.question}<span aria-hidden="true" className="text-2xl text-ailu-yellow group-open:rotate-45">+</span></summary><p className="max-w-3xl pb-2 pr-8 pt-3 text-sm leading-relaxed text-ailu-cream/60">{item.answer}</p></details>)}</div>
    </div>
  </>;
}
