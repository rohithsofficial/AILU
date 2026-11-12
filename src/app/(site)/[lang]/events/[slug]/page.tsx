// Normal World: one event type (wedding, corporate...) with its services, gallery and the enquiry form.
import Image from "next/image";
import Link from "@/components/LocaleLink";
import { notFound } from "next/navigation";
import EnquiryForm from "@/components/EnquiryForm";
import { getContent } from "@/server/cms";
import { localePath, toLocale } from "@/lib/i18n";
import { EVENT_CATEGORIES } from "@/lib/events";
import { eventMetadata, publicSiteUrl } from "@/lib/public-metadata";

export function generateStaticParams() { return EVENT_CATEGORIES.map((category) => ({ slug: category.slug })); }
export async function generateMetadata({ params }: { params: { slug: string; lang: string } }) {
  const locale = toLocale(params.lang);
  const { celebrations, seo } = await getContent(locale);
  return eventMetadata(params.slug, celebrations.items, seo.defaultShareImage, locale) ?? {};
}

const categoryScenes = [
  { surface: "bg-ailu-black text-ailu-cream", mark: "YOUR PEOPLE, YOUR MOMENT", markTone: "text-ailu-yellow", ctaTone: "text-ailu-yellow border-ailu-yellow", pattern: "radial-gradient(ellipse at 78% 42%, rgba(245,196,0,.22), transparent 34%), radial-gradient(circle at 78% 42%, rgba(245,196,0,.12) 1px, transparent 2px)" },
  { surface: "bg-ailu-black text-ailu-cream", mark: "A PROMISE, HELD TOGETHER", markTone: "text-ailu-yellow", ctaTone: "text-ailu-yellow border-ailu-yellow", pattern: "repeating-linear-gradient(132deg, transparent 0 48px, rgba(255,253,247,.045) 49px 50px, transparent 51px 96px)" },
  { surface: "bg-ailu-black text-ailu-cream", mark: "MADE FOR THE WHOLE TEAM", markTone: "text-ailu-yellow", ctaTone: "text-ailu-yellow border-ailu-yellow", pattern: "repeating-linear-gradient(90deg, transparent 0 14vw, rgba(245,196,0,.07) 14.1vw 14.2vw, transparent 14.3vw 28vw)" },
  { surface: "bg-ailu-black text-ailu-cream", mark: "GIVE THE ROOM A VOICE", markTone: "text-ailu-yellow", ctaTone: "text-ailu-yellow border-ailu-yellow", pattern: "conic-gradient(from 40deg at 78% 48%, transparent 0 24deg, rgba(245,196,0,.13) 25deg 26deg, transparent 27deg 64deg)" },
  { surface: "bg-ailu-black text-ailu-cream", mark: "LET THE ENERGY FIND YOU", markTone: "text-ailu-yellow", ctaTone: "text-ailu-yellow border-ailu-yellow", pattern: "radial-gradient(circle at 72% 48%, rgba(245,196,0,.22) 1px, transparent 2px), radial-gradient(ellipse at 75% 48%, rgba(245,196,0,.15), transparent 38%)" },
  { surface: "bg-ailu-black text-ailu-cream", mark: "EVERY TRADITION HAS A RHYTHM", markTone: "text-ailu-yellow", ctaTone: "text-ailu-yellow border-ailu-yellow", pattern: "repeating-linear-gradient(145deg, transparent 0 68px, rgba(245,196,0,.09) 69px 70px, transparent 71px 136px)" },
  { surface: "bg-ailu-black text-ailu-cream", mark: "A CROWD CAN FEEL LIKE FAMILY", markTone: "text-ailu-yellow", ctaTone: "text-ailu-yellow border-ailu-yellow", pattern: "radial-gradient(ellipse at 80% 46%, rgba(245,196,0,.15), transparent 40%), repeating-linear-gradient(0deg, transparent 0 70px, rgba(255,253,247,.04) 71px 72px, transparent 73px 144px)" },
];
const categoryLayouts = ["lg:items-start lg:text-left", "lg:items-end lg:text-right", "lg:items-center lg:text-left", "lg:items-end lg:text-left", "lg:items-start lg:text-right", "lg:items-center lg:text-left", "lg:items-end lg:text-right"];

export default async function EventDetail({ params }: { params: { slug: string; lang: string } }) {
  const locale = toLocale(params.lang);
  const content = await getContent(locale);
  const t = content.eventDetail;
  const { steps: planning, checklist } = t;
  const categories = content.celebrations.items;
  const category = categories.find((item) => item.slug === params.slug);
  if (!category) notFound();
  const categoryIndex = categories.findIndex((item) => item.slug === category.slug);
  const scene = categoryScenes[categoryIndex] ?? categoryScenes[0];
  const gallery = category.gallery.filter((item) => item.src);
  const base = publicSiteUrl();
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: content.ui.nav.home, item: base?.toString() },
    { "@type": "ListItem", position: 2, name: content.ui.nav.events, item: base ? new URL(localePath(locale, "/events"), base).toString() : undefined },
    { "@type": "ListItem", position: 3, name: category.title, item: base ? new URL(localePath(locale, `/events/${category.slug}`), base).toString() : undefined },
  ].map((item) => Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined))) };
  const related = categories.filter((item) => item.slug !== category.slug).slice(0, 3);
  return <>
    <section className={`relative isolate flex min-h-[58svh] overflow-hidden ${scene.surface}`} aria-labelledby="category-title">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-90" style={{ backgroundImage: scene.pattern }} />
      <span aria-hidden className="pointer-events-none absolute -right-[.08em] top-[8%] select-none font-display text-[clamp(8rem,26vw,22rem)] font-bold leading-none tracking-[-.12em] opacity-[.045]">✳</span>
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col justify-between px-6 pb-8 pt-7 sm:px-12 sm:pb-12 sm:pt-10 lg:px-20">
        <div className="flex items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[.22em] opacity-65 sm:text-xs">
          <Link href="/events" className="inline-flex min-h-11 items-center gap-2 underline decoration-ailu-yellow underline-offset-4 hover:opacity-100">{t.breadcrumb} <span aria-hidden>↗</span></Link>
          <span>{t.styleLabel} {String(categoryIndex + 1).padStart(2, "0")} / {String(EVENT_CATEGORIES.length).padStart(2, "0")}</span>
        </div>
        <div className={`relative z-10 flex flex-1 flex-col justify-center py-12 ${categoryLayouts[categoryIndex] ?? "lg:items-start lg:text-left"}`}>
          <p className={`text-[10px] font-bold uppercase tracking-[.28em] sm:text-xs ${scene.markTone}`}>{category.tagline.toUpperCase()}</p>
          <h1 id="category-title" className="mt-5 max-w-[11ch] font-display text-[clamp(2.8rem,6.5vw,5.25rem)] font-semibold leading-[.92] tracking-[-.06em]">{category.title}</h1>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed opacity-75 sm:text-lg">{category.blurb}</p>
          <p className="mt-4 text-xs font-medium opacity-55">{t.note}</p>
          <Link href="#enquire" className={`mt-7 inline-flex min-h-12 w-fit items-center gap-3 border-b pb-1 font-semibold ${scene.ctaTone}`}>{t.button} <span aria-hidden>↗</span></Link>
        </div>
        <p className="relative z-10 text-[9px] font-semibold uppercase tracking-[.3em] opacity-45">{t.footerLine}</p>
      </div>
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
    <div className="bg-ailu-black text-ailu-cream">
    <div className="mx-auto max-w-5xl px-4 py-12">
      <section aria-labelledby="services-heading"><p className="text-[10px] font-bold uppercase tracking-[.25em] text-ailu-yellow">{t.servicesEyebrow}</p><h2 id="services-heading" className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{t.servicesTitle}</h2><ul className="mt-5 flex flex-wrap gap-x-8 border-y border-white/15">{category.services.map((service) => <li key={service} className="min-h-14 border-b border-white/10 py-4 text-sm sm:text-base">{service}</li>)}</ul></section>
      <section className="mt-14" aria-labelledby="planning-heading"><p className="text-[10px] font-bold uppercase tracking-[.25em] text-ailu-yellow">{t.stepsEyebrow}</p><h2 id="planning-heading" className="mt-2 max-w-[14ch] font-display text-3xl font-semibold leading-[.98] sm:text-4xl">{t.stepsTitle}</h2><div className="mt-6 grid gap-x-10 border-t border-white/15 sm:grid-cols-2">{planning.map(({ title, body }) => <div key={title} className="border-b border-white/15 py-5"><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 max-w-xl text-sm leading-relaxed text-ailu-cream/60">{body}</p></div>)}</div></section>
      <section className="mt-10 border-y border-ailu-yellow/40 py-6" aria-labelledby="tell-heading"><h2 id="tell-heading" className="font-display text-xl font-semibold">{t.checklistTitle}</h2><ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ailu-cream/60">{checklist.map((item) => <li key={item}>{item}</li>)}</ul></section>
      {gallery.length > 0 && <section className="mt-10" aria-labelledby="gallery-heading"><h2 id="gallery-heading" className="text-xl font-semibold">{t.galleryTitle}</h2><ul className="mt-5 grid gap-4 sm:grid-cols-2">{gallery.map((item) => <li key={item.src}><figure><Image src={item.src} alt={item.alt} width={1600} height={1000} sizes="(min-width: 640px) 50vw, 100vw" className="h-auto w-full rounded-lg object-cover" />{item.caption && <figcaption className="mt-2 text-sm text-ailu-cream/65">{item.caption}</figcaption>}</figure></li>)}</ul></section>}
      <section className="mt-10" aria-labelledby="related-heading"><h2 id="related-heading" className="text-xl font-semibold">{t.relatedTitle}</h2><ul className="mt-3 flex flex-wrap gap-x-7 gap-y-2">{related.map((item) => <li key={item.slug}><Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ailu-cream/75 underline decoration-ailu-yellow decoration-2 underline-offset-4 hover:text-ailu-yellow" href={`/events/${item.slug}`}>{item.title}<span aria-hidden>↗</span></Link></li>)}</ul></section>
    </div>
    <div className="mx-auto max-w-5xl px-4 pb-14">
      <section className="mt-8" aria-labelledby="enquire"><h2 id="enquire" className="scroll-mt-24 text-2xl font-semibold">{t.askLabel} {category.title.toLowerCase()}</h2><p className="mt-2 max-w-3xl text-sm text-ailu-cream/60">{t.closingText}</p><div className="mt-5"><EnquiryForm defaultCategory={category.slug} /></div></section>
    </div>
    </div>
  </>;
}
