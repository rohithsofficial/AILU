import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import EnquiryForm from "@/components/EnquiryForm";
import PageHero from "@/components/PageHero";
import { SITE_CONTENT } from "@/content/site";
import { EVENT_CATEGORIES, getCategory } from "@/lib/events";
import { eventMetadata, publicSiteUrl } from "@/lib/public-metadata";

export function generateStaticParams() { return EVENT_CATEGORIES.map((category) => ({ slug: category.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) {
  return eventMetadata(params.slug) ?? {};
}

const planning = [
  ["Share the occasion", "Tell us what you are planning and what matters most to you."],
  ["Add the details", "Share the date if known, location, guest estimate, customs, and services you need."],
  ["Discuss the plan", "AILU reviews the request, checks availability, and discusses scope, terms, and a tailored quotation."],
  ["Confirm together", "An enquiry is not a booking. Planning begins after availability, scope, terms, and required payment are agreed."],
];
const checklist = ["Date or date range", "Event location", "Guest estimate", "Budget range if known", "Traditions or customs you follow", "Services you need"];

export default function EventDetail({ params }: { params: { slug: string } }) {
  const category = getCategory(params.slug);
  if (!category) notFound();
  const gallery = SITE_CONTENT.galleries[category.slug] ?? [];
  const base = publicSiteUrl();
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: base?.toString() },
    { "@type": "ListItem", position: 2, name: "Events", item: base ? new URL("/events", base).toString() : undefined },
    { "@type": "ListItem", position: 3, name: category.title, item: base ? new URL(`/events/${category.slug}`, base).toString() : undefined },
  ].map((item) => Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined))) };
  const related = EVENT_CATEGORIES.filter((item) => item.slug !== category.slug).slice(0, 3);
  return <>
    <PageHero title={category.title}>{category.blurb}</PageHero>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
    <div className="mx-auto max-w-5xl px-4 py-12">
      <section aria-labelledby="services-heading"><p className="text-xs font-bold uppercase tracking-[.25em] text-black/45">Details in the mix</p><h2 id="services-heading" className="mt-2 font-display text-3xl font-bold sm:text-4xl">Things we can explore together</h2><ul className="mt-5 flex flex-wrap gap-x-8 border-y border-black/20">{category.services.map((service) => <li key={service} className="min-h-14 border-b border-black/10 py-4 text-base sm:text-lg">{service}</li>)}</ul></section>
      <section className="mt-16" aria-labelledby="planning-heading"><p className="text-xs font-bold uppercase tracking-[.25em] text-black/45">Start with the feeling</p><h2 id="planning-heading" className="mt-2 max-w-[14ch] font-display text-4xl font-bold leading-[.9] sm:text-6xl">How the day takes shape.</h2><div className="mt-7 grid gap-x-10 border-t border-black/20 sm:grid-cols-2">{planning.map(([title, body]) => <div key={title} className="border-b border-black/20 py-6"><h3 className="text-xl font-bold">{title}</h3><p className="mt-2 max-w-xl leading-relaxed text-black/70">{body}</p></div>)}</div></section>
      <section className="mt-14 border-y-2 border-ailu-yellow py-7" aria-labelledby="tell-heading"><h2 id="tell-heading" className="font-display text-2xl font-bold">If you know, bring these details</h2><ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm sm:text-base">{checklist.map((item) => <li key={item}>{item}</li>)}</ul></section>
      {gallery.length > 0 && <section className="mt-12" aria-labelledby="gallery-heading"><h2 id="gallery-heading" className="text-2xl font-bold">Celebrations</h2><ul className="mt-5 grid gap-4 sm:grid-cols-2">{gallery.map((item) => <li key={item.src}><figure><Image src={item.src} alt={item.alt} width={1600} height={1000} sizes="(min-width: 640px) 50vw, 100vw" className="h-auto w-full rounded-2xl object-cover" />{item.caption && <figcaption className="mt-2 text-sm text-black/80">{item.caption}</figcaption>}</figure></li>)}</ul></section>}
      <section className="mt-12" aria-labelledby="related-heading"><h2 id="related-heading" className="text-2xl font-bold">Let another idea find you</h2><ul className="mt-4 flex flex-wrap gap-x-7 gap-y-2">{related.map((item) => <li key={item.slug}><Link className="inline-flex min-h-11 items-center gap-2 font-semibold underline decoration-ailu-yellow decoration-2 underline-offset-4" href={`/events/${item.slug}`}>{item.title}<span aria-hidden>↗</span></Link></li>)}</ul></section>
    </div>
    <div className="mx-auto max-w-5xl px-4">
      <section className="mt-14" aria-labelledby="enquire"><h2 id="enquire" className="scroll-mt-24 text-3xl font-bold">Ask about {category.title.toLowerCase()}</h2><p className="mt-2 max-w-3xl text-black/80">Send an enquiry to start a conversation. Availability, scope, terms, and payment must be agreed before an event is confirmed.</p><div className="mt-5"><EnquiryForm defaultCategory={category.slug} /></div></section>
    </div>
  </>;
}
