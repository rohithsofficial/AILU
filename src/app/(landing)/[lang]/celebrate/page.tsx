import type { Metadata } from "next";
import Image from "next/image";
import { cookies, headers } from "next/headers";
import EnquiryForm from "@/components/EnquiryForm";
import { landingText } from "@/content/landingText";
import { BRAND } from "@/lib/brand";
import { localePath, toLocale, type LangParams } from "@/lib/i18n";
import { LANDING_TEST, isVariant, type Variant } from "@/lib/experiments";
import { getContent } from "@/server/cms";

// The landing page for adverts, Instagram and WhatsApp links. See docs/LANDING_PAGE.md and docs/AB_TESTING.md.
// It is kept out of Google (noindex), so it never competes with the main pages, and so both versions are fair.
export function generateMetadata({ params }: LangParams): Metadata {
  const locale = toLocale(params.lang);
  const { page } = landingText(locale);
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: localePath(locale, LANDING_TEST.path) },
    robots: { index: false, follow: true },
  };
}

// The middleware chooses the version; on a first visit the cookie is not back yet, so it sends a header too.
function currentVariant(): Variant {
  const fromHeader = headers().get(LANDING_TEST.header);
  if (isVariant(fromHeader)) return fromHeader;
  const fromCookie = cookies().get(LANDING_TEST.cookie)?.value;
  return isVariant(fromCookie) ? fromCookie : "a";
}

export default async function CelebratePage({ params }: LangParams) {
  const locale = toLocale(params.lang);
  const variant = currentVariant();
  const { page: LANDING, variants, faqs: allFaqs, process } = landingText(locale);
  const hero = variants[variant];
  const { settings, celebrations } = await getContent(locale);
  const whatsapp = `${settings.whatsapp}?text=${encodeURIComponent(settings.whatsappMessage)}`;
  const faqs = allFaqs.slice(1, 1 + LANDING.faqCount);

  return (
    <div data-landing-variant={variant}>
      {/* Hero: the only part that changes between version A and B */}
      <section className="relative overflow-hidden px-4 pb-14 pt-10 sm:pt-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(245,196,0,.18),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-[1.2fr_.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-ailu-yellow">{hero.eyebrow}</p>
            <h1 className="mt-3 font-display text-[clamp(2.1rem,9vw,4.2rem)] font-bold leading-[1.05]">
              {hero.title} <em className="block not-italic text-ailu-yellow">{hero.em}</em>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-ailu-cream/80">{hero.body}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#enquire" className="inline-flex min-h-12 items-center rounded-full bg-ailu-yellow px-7 font-bold text-ailu-black hover:bg-ailu-cream">{hero.cta} <span aria-hidden className="ml-2">→</span></a>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-full border border-ailu-cream/30 px-6 font-semibold hover:border-ailu-yellow hover:text-ailu-yellow">{LANDING.whatsappLabel}</a>
            </div>
            <ul className="mt-8 grid grid-cols-2 gap-2 text-sm sm:flex sm:flex-wrap" aria-label={LANDING.goodToKnow}>
              {LANDING.trust.map((item) => (
                <li key={item} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-2"><span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-ailu-yellow" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="hidden justify-center md:flex" aria-hidden>
            <Image src={BRAND.hand} alt="" width={1000} height={750} className="w-full max-w-sm drop-shadow-[0_0_60px_rgba(245,196,0,.35)]" priority />
          </div>
        </div>
      </section>

      {/* Occasions */}
      <section className="px-4 py-9 sm:py-12" aria-labelledby="occasions-title">
        <div className="mx-auto max-w-6xl">
          <h2 id="occasions-title" className="font-display text-2xl font-bold sm:text-3xl">{LANDING.occasionsTitle}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {celebrations.items.map((item) => (
              <li key={item.slug}>
                <a href="#enquire" className="block h-full rounded-2xl border border-white/10 bg-white/[.04] p-5 transition-colors hover:border-ailu-yellow/60">
                  <span className="font-display text-lg font-semibold">{item.title}</span>
                  <span className="mt-1 block text-sm text-ailu-cream/65">{item.tagline}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-9 sm:py-12" aria-labelledby="steps-title">
        <div className="mx-auto max-w-6xl">
          <h2 id="steps-title" className="font-display text-2xl font-bold sm:text-3xl">{LANDING.stepsTitle}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {process.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-white/10 p-5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-ailu-yellow font-display font-bold text-ailu-black">{i + 1}</span>
                <h3 className="mt-3 font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-ailu-cream/70">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why AILU */}
      <section className="px-4 py-9 sm:py-12" aria-labelledby="why-title">
        <div className="mx-auto max-w-6xl">
          <h2 id="why-title" className="font-display text-2xl font-bold sm:text-3xl">{LANDING.whyTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {LANDING.why.map((item) => (
              <div key={item.title} className="rounded-2xl border border-ailu-yellow/25 bg-ailu-yellow/[.05] p-5">
                <h3 className="font-display text-lg font-semibold text-ailu-yellow">{item.title}</h3>
                <p className="mt-1 text-sm text-ailu-cream/75">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The goal of the page: the enquiry form */}
      <section id="enquire" className="scroll-mt-20 px-4 py-9 sm:py-12" aria-labelledby="form-title">
        <div className="mx-auto max-w-3xl">
          <h2 id="form-title" className="font-display text-2xl font-bold sm:text-3xl">{LANDING.formTitle}</h2>
          <p className="mb-6 mt-1 text-ailu-cream/70">{LANDING.formBody}</p>
          <EnquiryForm landing={variant} submitLabel={hero.cta} />
        </div>
      </section>

      {/* Short FAQ */}
      <section className="px-4 py-9 sm:py-12" aria-labelledby="faq-title">
        <div className="mx-auto max-w-3xl">
          <h2 id="faq-title" className="font-display text-2xl font-bold sm:text-3xl">{LANDING.faqTitle}</h2>
          <div className="mt-5 divide-y divide-white/10 rounded-2xl border border-white/10">
            {faqs.map((faq) => (
              <details key={faq.question} className="group p-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">{faq.question}<span aria-hidden className="text-ailu-yellow transition-transform group-open:rotate-45">+</span></summary>
                <p className="mt-2 text-sm text-ailu-cream/70">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 text-center sm:py-14">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{LANDING.finalTitle}</h2>
        <p className="mt-2 text-ailu-cream/70">{LANDING.finalBody}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href="#enquire" className="inline-flex min-h-12 items-center rounded-full bg-ailu-yellow px-7 font-bold text-ailu-black hover:bg-ailu-cream">{hero.cta}</a>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-full border border-ailu-cream/30 px-6 font-semibold hover:border-ailu-yellow hover:text-ailu-yellow">{LANDING.whatsappLabel}</a>
        </div>
      </section>

      {/* Phones: the two main actions stay under the thumb */}
      <nav aria-label="Enquire" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t border-white/10 bg-ailu-black/95 p-3 backdrop-blur md:hidden" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
        <a href="#enquire" className="inline-flex min-h-12 items-center justify-center rounded-full bg-ailu-yellow font-bold text-ailu-black">{LANDING.enquireShort}</a>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full border border-ailu-cream/30 font-semibold">{LANDING.whatsappLabel}</a>
      </nav>
    </div>
  );
}
