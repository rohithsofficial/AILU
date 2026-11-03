import PageHero from "@/components/PageHero";
import { SITE_CONTENT } from "@/content/site";
import { metadataForPath } from "@/lib/public-metadata";

export const metadata = metadataForPath("/faq");

export default function FAQPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: SITE_CONTENT.faqs.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };
  return <>
    <PageHero title="Frequently asked questions">Clear answers about event planning, opportunities, partner referrals, and how AILU handles information.</PageHero>
    <div className="mx-auto max-w-4xl px-4 py-14"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="divide-y divide-black/15">{SITE_CONTENT.faqs.map((item) => <details key={item.question} className="group py-5"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold [&::-webkit-details-marker]:hidden">{item.question}<span aria-hidden="true" className="text-2xl text-black group-open:rotate-45">+</span></summary><p className="max-w-3xl pb-2 pr-8 pt-3 leading-relaxed text-black/85">{item.answer}</p></details>)}</div>
    </div>
  </>;
}
