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
      <section aria-labelledby="services-heading"><h2 id="services-heading" className="text-2xl font-bold">Services to discuss</h2><ul className="mt-3 grid gap-3 sm:grid-cols-2">{category.services.map((service) => <li key={service} className="rounded-xl border border-black/15 bg-white p-4">{service}</li>)}</ul></section>
      <section className="mt-12" aria-labelledby="planning-heading"><h2 id="planning-heading" className="text-2xl font-bold">How planning works</h2><ol className="mt-5 grid gap-4 sm:grid-cols-2">{planning.map(([title, body], index) => <li key={title} className="rounded-2xl bg-ailu-black p-5 text-ailu-cream"><span className="font-display text-3xl font-bold text-ailu-yellow">0{index + 1}</span><h3 className="mt-2 text-xl font-bold">{title}</h3><p className="mt-2 text-ailu-cream/90">{body}</p></li>)}</ol></section>
      <section className="mt-12 rounded-2xl bg-ailu-yellow p-6" aria-labelledby="tell-heading"><h2 id="tell-heading" className="text-2xl font-bold">What to tell us</h2><ul className="mt-3 grid gap-2 sm:grid-cols-2">{checklist.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true">✓</span>{item}</li>)}</ul></section>
      {gallery.length > 0 && <section className="mt-12" aria-labelledby="gallery-heading"><h2 id="gallery-heading" className="text-2xl font-bold">Celebrations</h2><ul className="mt-5 grid gap-4 sm:grid-cols-2">{gallery.map((item) => <li key={item.src}><figure><Image src={item.src} alt={item.alt} width={1600} height={1000} sizes="(min-width: 640px) 50vw, 100vw" className="h-auto w-full rounded-2xl object-cover" />{item.caption && <figcaption className="mt-2 text-sm text-black/80">{item.caption}</figcaption>}</figure></li>)}</ul></section>}
      <section className="mt-12" aria-labelledby="related-heading"><h2 id="related-heading" className="text-2xl font-bold">Related event ideas</h2><ul className="mt-4 flex flex-wrap gap-3">{related.map((item) => <li key={item.slug}><Link className="inline-flex min-h-11 items-center rounded-full border border-black/25 px-5 font-semibold underline decoration-ailu-yellow decoration-2" href={`/events/${item.slug}`}>{item.title}</Link></li>)}</ul></section>
      <section className="mt-14" aria-labelledby="enquire"><h2 id="enquire" className="scroll-mt-24 text-3xl font-bold">Ask about {category.title.toLowerCase()}</h2><p className="mt-2 max-w-3xl text-black/80">Send an enquiry to start a conversation. Availability, scope, terms, and payment must be agreed before an event is confirmed.</p><div className="mt-5"><EnquiryForm defaultCategory={category.slug} /></div></section>
    </div>
  </>;
}
