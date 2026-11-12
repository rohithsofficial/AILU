// Normal World home: everything under the story: ticker, at a glance, services, people, culture, inspiration,
// about, how it works, opportunities and FAQ. Wording comes from the CMS (Home section).
import Image from "next/image";
import Link from "@/components/LocaleLink";
import { getContent } from "@/server/cms";
import { BRAND } from "@/lib/brand";
import type { Locale } from "@/lib/i18n";

const ideaArt = ["from-ailu-yellow/35 via-ailu-yellow/10 to-ailu-cream/5", "from-white/15 via-ailu-black to-ailu-yellow/25", "from-ailu-yellow/30 via-ailu-black to-white/10"];

export default async function HomeExperience({ locale = "en" }: { locale?: Locale }) {
  const content = await getContent(locale);
  const t = content.home;
  const EVENT_CATEGORIES = content.celebrations.items;
  const featuredFaqs = content.faqs.items.slice(0, 5);
  const disciplines = t.traditions;
  return (
    <>
      <div className="overflow-hidden bg-ailu-yellow py-3 text-ailu-black" aria-label={`${t.bannerText1}. ${t.bannerText2}. ${t.bannerText3}.`}>
        <div className="marquee-track flex w-max items-center gap-7 whitespace-nowrap text-[10px] font-bold uppercase tracking-[.2em] sm:gap-9 sm:text-xs">
          {[0, 1, 2, 3].map((item) => <span key={item} aria-hidden="true" className="inline-flex items-center gap-7 sm:gap-9">{t.bannerText1} <span className="text-sm">✳</span> {t.bannerText2} <span className="text-sm">✳</span> {t.bannerText3} <span className="text-sm">✳</span></span>)}
        </div>
        <span className="sr-only">{t.bannerText1}. {t.bannerText2}. {t.bannerText3}.</span>
      </div>
      <section className="bg-ailu-black px-6 text-ailu-cream sm:px-10 lg:px-16" aria-label="AILU at a glance">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 border-b border-white/15 py-2 sm:grid-cols-4">
          {t.atAGlance.map(({ label, value }, index) => <li key={label} className={`border-t border-white/15 py-4 pr-4 ${index % 2 ? "pl-4" : ""} ${index < 2 ? "max-sm:border-t-0" : ""} sm:border-t-0 sm:py-5 ${index > 0 ? "sm:border-l sm:border-white/15 sm:pl-5" : ""}`}><span className="block text-xs font-semibold text-ailu-cream">{label}</span><span className="mt-1 block text-xs leading-relaxed text-ailu-cream/50">{value}</span></li>)}
        </ul>
      </section>
      <section id="services" className="scroll-mt-20 bg-ailu-black px-6 py-9 text-ailu-cream sm:px-10 sm:py-14 lg:py-16 lg:px-16" aria-labelledby="services-title">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">{t.servicesEyebrow}</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_.8fr] lg:items-end">
            <h2 id="services-title" className="max-w-[13ch] font-display text-[clamp(2.3rem,4.5vw,3.6rem)] font-semibold leading-[.98] tracking-[-.055em]">{t.servicesTitleLine1}<br /><span className="text-ailu-yellow">{t.servicesTitleLine2}</span></h2>
            <p className="max-w-xl leading-relaxed text-ailu-cream/65">{t.servicesText}</p>
          </div>
          <ul className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {EVENT_CATEGORIES.map((category, index) => <li key={category.slug} className="group border-t border-white/15 py-5 transition-colors hover:border-ailu-yellow">
              <div className="flex items-baseline justify-between gap-4"><span className="text-xs font-semibold text-ailu-cream/40">0{index + 1}</span><Link href={`/events/${category.slug}`} className="min-h-11 flex-1 font-display text-lg font-semibold tracking-tight after:ml-2 after:text-ailu-yellow after:content-['↗'] group-hover:text-ailu-yellow">{category.title}</Link></div>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ailu-cream/60">{category.blurb}</p>
            </li>)}
          </ul>
          <p className="mt-5 max-w-3xl text-xs leading-relaxed text-ailu-cream/45">{t.servicesNote}</p>
        </div>
      </section>

      <section id="people" className="scroll-mt-20 bg-ailu-black px-6 py-9 text-ailu-cream sm:px-10 sm:py-14 lg:py-16 lg:px-16" aria-labelledby="people-title">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">{t.peopleEyebrow}</p><h2 id="people-title" className="mt-4 max-w-[11ch] font-display text-[clamp(2.3rem,4.5vw,3.6rem)] font-semibold leading-[.96] tracking-[-.055em]">{t.peopleTitle}</h2></div>
            <p className="max-w-xl leading-relaxed text-ailu-cream/65">{t.peopleText}</p>
          </div>
          {/* Number and name on one line, so the list reads quickly and has no empty boxes. */}
          <ul className="mt-8 grid gap-px overflow-hidden rounded-sm border border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
            {t.peopleList.map((item, index) => <li key={item} className="flex items-center gap-3 bg-ailu-black px-4 py-3.5 sm:px-5 sm:py-4"><span aria-hidden className="w-6 shrink-0 font-display text-sm font-bold text-ailu-yellow">{String(index + 1).padStart(2, "0")}</span><span className="font-display text-base font-semibold leading-snug">{item}</span></li>)}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-ailu-cream/45">{t.peopleNote}</p>
        </div>
      </section>

      <section id="culture" className="scroll-mt-20 bg-ailu-black px-6 py-9 text-ailu-cream sm:px-10 sm:py-14 lg:py-16 lg:px-16" aria-labelledby="culture-title">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <div className="bg-ailu-yellow p-6 text-ailu-black sm:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[.3em] text-black/60 sm:text-xs">{t.cultureEyebrow}</p>
              <h2 id="culture-title" className="mt-4 max-w-[11ch] font-display text-[clamp(2.2rem,4.5vw,3.5rem)] font-semibold leading-[.96] tracking-[-.055em]">{t.cultureTitle}</h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-black/75">{t.cultureText}</p>
              <div className="mt-7 flex items-center gap-4 border-t border-black/20 pt-4"><Image src={BRAND.hand} alt="AILU golden hand symbol" width={74} height={56} className="h-12 w-[4.5rem] object-contain" /><span className="text-[10px] font-semibold uppercase tracking-[.18em]">{t.cultureCaption}</span></div>
            </div>
          </div>
          <ul className="border-t border-white/15">
            {disciplines.map((item) => <li key={item.title} className="grid gap-2 border-b border-white/15 py-5 sm:grid-cols-[.8fr_1.2fr] sm:gap-8 sm:py-6"><h3 className="font-display text-lg font-semibold sm:text-xl">{item.title}</h3><p className="max-w-lg text-sm leading-relaxed text-ailu-cream/60">{item.detail}</p><span className="sr-only">{t.cultureNote}</span></li>)}
          </ul>
        </div>
      </section>

      <section id="inspiration" className="scroll-mt-20 bg-ailu-black px-6 py-9 text-ailu-cream sm:px-10 sm:py-14 lg:py-16 lg:px-16" aria-labelledby="inspiration-title">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">{t.ideasEyebrow}</p><h2 id="inspiration-title" className="mt-4 font-display text-[clamp(2.3rem,4.5vw,3.6rem)] font-semibold leading-[.96] tracking-[-.055em]">{t.ideasTitleLine1}<br /><span className="text-ailu-yellow">{t.ideasTitleLine2}</span></h2><p className="mt-5 max-w-2xl text-sm leading-relaxed text-ailu-cream/60">{t.ideasText}</p></div>
          {/* A card shows its photo once one is chosen in the CMS. Until then it is a compact card, not an empty picture box. */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {t.ideas.map((item, ideaIndex) => <article key={item.title} className={`group relative min-w-0 overflow-hidden rounded-sm border border-white/15 bg-gradient-to-br ${ideaArt[ideaIndex % ideaArt.length]}`}>
              {item.image ? <div className="relative aspect-[4/3] overflow-hidden"><Image src={item.image} alt={item.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" /><span className="absolute bottom-3 left-4 rounded-sm bg-ailu-black/70 px-2 py-1 text-[9px] font-bold uppercase tracking-[.22em] text-white">{t.ideasCardNote}</span></div>
                : <Image src={BRAND.hand} alt="" width={120} height={90} aria-hidden className="pointer-events-none absolute -right-4 -top-3 h-24 w-32 rotate-12 object-contain opacity-[.12] transition-transform duration-700 group-hover:rotate-6" />}
              <div className="relative p-5">
                <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.2em] text-ailu-yellow"><span aria-hidden className="font-display text-2xl tracking-[-.06em] text-ailu-cream/80">{String(ideaIndex + 1).padStart(2, "0")}</span>{item.tag}</p>
                <h3 className="mt-3 font-display text-lg font-semibold tracking-tight sm:text-xl">{item.title}</h3><p className="mt-2 max-w-sm text-sm leading-relaxed text-ailu-cream/65">{item.copy}</p>
              </div>
            </article>)}
          </div>
          {t.ideas.some((item) => item.image) ? <p className="mt-5 text-xs text-ailu-cream/40">{t.ideasNote}</p> : null}
        </div>
      </section>

      <section id="about" className="scroll-mt-20 bg-ailu-black px-6 py-9 text-ailu-cream sm:px-10 sm:py-14 lg:py-16 lg:px-16" aria-labelledby="about-title">
        <div className="mx-auto grid max-w-7xl gap-8 border-y border-white/15 py-6 sm:py-10 lg:grid-cols-2 lg:gap-16">
          <div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">{t.storyEyebrow}</p><h2 id="about-title" className="mt-4 max-w-[10ch] font-display text-[clamp(2.3rem,4.5vw,3.6rem)] font-semibold leading-[.96] tracking-[-.055em]">{t.storyTitle}</h2></div>
          <div className="space-y-4 self-end leading-relaxed text-ailu-cream/70"><p>{t.storyText1}</p><p>{t.storyText2}</p><Link href="/about" className="inline-flex min-h-11 items-center gap-2 border-b border-ailu-yellow font-semibold text-ailu-yellow">{t.storyLink} <span aria-hidden>↗</span></Link></div>
        </div>
      </section>

      <section id="how" className="scroll-mt-20 bg-ailu-black px-6 py-9 text-ailu-cream sm:px-10 sm:py-14 lg:py-16 lg:px-16" aria-labelledby="how-title">
        <div className="mx-auto max-w-7xl"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">{t.stepsEyebrow}</p><h2 id="how-title" className="mt-4 max-w-[12ch] font-display text-[clamp(2.3rem,4.5vw,3.6rem)] font-semibold leading-[.96] tracking-[-.055em]">{t.stepsTitle}</h2>
          <ol className="mt-10 grid gap-7 border-t border-white/15 pt-6 md:grid-cols-3 md:gap-10">{t.steps.map((step, index) => <li key={step.title} className="flex flex-col items-start"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-ailu-yellow">Step 0{index + 1}</span><h3 className="mt-4 font-display text-xl font-semibold tracking-tight">{step.title}</h3><p className="mt-3 max-w-sm text-sm leading-relaxed text-ailu-cream/60">{step.body}</p></li>)}</ol>
          <Link href="/events#enquire" className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-sm bg-ailu-yellow px-5 font-semibold text-ailu-black transition hover:bg-ailu-cream">{t.stepsButton} <span aria-hidden>↗</span></Link>
        </div>
      </section>

      <section id="opportunities" className="scroll-mt-20 bg-ailu-black px-6 py-9 text-ailu-cream sm:px-10 sm:py-14 lg:py-16 lg:px-16" aria-labelledby="opportunities-title">
        <div className="mx-auto max-w-7xl"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">{t.moreEyebrow}</p><h2 id="opportunities-title" className="mt-4 max-w-[12ch] font-display text-[clamp(2.3rem,4.5vw,3.6rem)] font-semibold leading-[.96] tracking-[-.055em]">{t.moreTitle}</h2>
          <div className="mt-8 grid gap-px border border-white/15 bg-white/15 md:grid-cols-3">
            <article className="flex flex-col bg-ailu-black p-5 sm:p-7"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-ailu-yellow">{t.teamEyebrow}</span><h3 className="mt-4 font-display text-xl font-semibold leading-tight">{t.teamTitle}</h3><p className="mt-3 flex-1 text-sm leading-relaxed text-ailu-cream/60">{t.teamText}</p><Link href="/join/team" className="mt-5 inline-flex min-h-11 items-center gap-2 border-b border-ailu-yellow/60 font-semibold text-ailu-yellow">{t.teamLink} <span aria-hidden>↗</span></Link></article>
            <article className="flex flex-col bg-ailu-black p-5 sm:p-7"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-ailu-yellow">{t.partnerEyebrow}</span><h3 className="mt-4 font-display text-xl font-semibold leading-tight">{t.partnerTitle}</h3><p className="mt-3 flex-1 text-sm leading-relaxed text-ailu-cream/60">{t.partnerText}</p><Link href="/join/partner" className="mt-5 inline-flex min-h-11 items-center gap-2 border-b border-ailu-yellow/60 font-semibold text-ailu-yellow">{t.partnerLink} <span aria-hidden>↗</span></Link></article>
            <article className="flex flex-col bg-ailu-black p-5 sm:p-7"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-ailu-yellow">{t.dreamEyebrow}</span><h3 className="mt-4 font-display text-xl font-semibold leading-tight">{t.dreamTitle}</h3><p className="mt-3 flex-1 text-sm leading-relaxed text-ailu-cream/60">{t.dreamText}</p><Link href="/dreams" className="mt-5 inline-flex min-h-11 items-center gap-2 border-b border-ailu-yellow/60 font-semibold text-ailu-yellow">{t.dreamLink} <span aria-hidden>↗</span></Link></article>
          </div>
          <p className="mt-6 max-w-3xl text-xs leading-relaxed text-black/55">{t.donateNote} <Link href="/donate" className="font-semibold underline underline-offset-2">{t.donateLink}</Link>.</p>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 bg-ailu-black px-6 py-9 text-ailu-cream sm:px-10 sm:py-14 lg:py-16 lg:px-16" aria-labelledby="faq-title">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.75fr_1.25fr]">
          <div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">{t.faqEyebrow}</p><h2 id="faq-title" className="mt-4 max-w-[9ch] font-display text-[clamp(2.8rem,6vw,5rem)] font-extrabold leading-[.88] tracking-[-.075em]">{t.faqTitle}</h2><Link href="/faq" className="mt-7 inline-flex min-h-11 items-center gap-2 border-b border-ailu-yellow font-semibold text-ailu-yellow">{t.faqLink} <span aria-hidden>↗</span></Link></div>
          <div className="divide-y divide-white/15 border-y border-white/15">{featuredFaqs.map((item) => <details key={item.question} className="group py-4"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-5 font-display text-base font-semibold sm:text-lg [&::-webkit-details-marker]:hidden">{item.question}<span aria-hidden className="shrink-0 text-2xl font-normal text-ailu-yellow transition-transform group-open:rotate-45">+</span></summary><p className="max-w-2xl pb-3 pr-8 text-sm leading-relaxed text-ailu-cream/65">{item.answer}</p></details>)}</div>
        </div>
      </section>

      <section id="enquire" className="scroll-mt-20 bg-ailu-black px-6 py-9 text-ailu-cream sm:px-10 sm:py-14 lg:py-16 lg:px-16" aria-labelledby="enquire-title">
        <div className="mx-auto grid max-w-7xl gap-8 border-t border-white/15 pt-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">{t.enquiryEyebrow}</p><h2 id="enquire-title" className="mt-4 max-w-[12ch] font-display text-[clamp(2.3rem,4.5vw,3.6rem)] font-semibold leading-[.96] tracking-[-.055em]">{t.enquiryTitle}</h2><p className="mt-5 max-w-xl text-sm leading-relaxed text-ailu-cream/60">{t.enquiryText}</p></div><div className="flex flex-wrap gap-3"><Link href="/events#enquire" className="inline-flex min-h-12 items-center gap-3 rounded-sm bg-ailu-yellow px-5 font-semibold text-ailu-black">{t.enquiryButton} <span aria-hidden>↗</span></Link><a href={`${content.settings.whatsapp}?text=${encodeURIComponent("Hi AILU, I would like to ask about planning a celebration.")}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center border border-white/20 px-5 text-sm font-semibold text-ailu-cream/80">{t.whatsappButton}</a></div></div>
      </section>
    </>
  );
}
