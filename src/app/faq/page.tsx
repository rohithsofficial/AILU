import PageHero from "@/components/PageHero";
import { SITE_CONTENT } from "@/content/site";
import { metadataForPath } from "@/lib/public-metadata";

export const metadata = metadataForPath("/faq");

export default function FAQPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: SITE_CONTENT.faqs.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };
  return <>
    <PageHero title="Frequently asked questions">Clear answers about event planning, opportunities, partner referrals, and how AILU handles information.</PageHero>
    <div className="mx-auto max-w-4xl px-4 py-12"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="divide-y divide-white/15 border-y border-white/15">{SITE_CONTENT.faqs.map((item) => <details key={item.question} className="group py-4"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-semibold [&::-webkit-details-marker]:hidden sm:text-lg">{item.question}<span aria-hidden="true" className="text-2xl text-ailu-yellow group-open:rotate-45">+</span></summary><p className="max-w-3xl pb-2 pr-8 pt-3 text-sm leading-relaxed text-ailu-cream/60">{item.answer}</p></details>)}</div>
    </div>
  </>;
}
