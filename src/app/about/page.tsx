import Link from "next/link";
import PageHero from "@/components/PageHero";
import { SITE_CONTENT } from "@/content/site";
import { metadataForPath } from "@/lib/public-metadata";

export const metadata = metadataForPath("/about");

export default function AboutPage() {
  return <>
    <PageHero title="About AILU">Creating celebrations with care, while opening doors to opportunities and supporting dreams privately.</PageHero>
    <div className="mx-auto max-w-5xl px-4 py-14">
      <section aria-labelledby="who-heading"><h2 id="who-heading" className="text-3xl font-bold">Who we are</h2>{SITE_CONTENT.about.map((text) => <p key={text} className="mt-4 max-w-3xl text-lg leading-relaxed text-black/85">{text}</p>)}</section>
      <section className="mt-14" aria-labelledby="work-heading"><h2 id="work-heading" className="text-3xl font-bold">How we work</h2><ol className="mt-6 grid gap-5 md:grid-cols-3">{SITE_CONTENT.process.map((step, index) => <li key={step.title} className="rounded-2xl bg-ailu-black p-6 text-ailu-cream"><span className="font-display text-4xl font-bold text-ailu-yellow">0{index + 1}</span><h3 className="mt-3 text-xl font-bold">{step.title}</h3><p className="mt-2 text-ailu-cream/90">{step.body}</p></li>)}</ol></section>
      <section className="mt-14 rounded-3xl bg-ailu-yellow p-7 sm:p-10" aria-labelledby="promises-heading"><h2 id="promises-heading" className="text-3xl font-bold">Our promises</h2><ul className="mt-5 list-disc space-y-3 pl-6"><li>Quotations are prepared for the event requirements discussed with you; this site does not list unverified prices.</li><li>We treat personal information with care and keep dreams private. No dream stories are published.</li><li>An enquiry, application, partner registration, or dream support request does not guarantee a particular outcome.</li><li>No payment is collected on this website.</li></ul></section>
      {SITE_CONTENT.people.length > 0 && <section className="mt-14" aria-labelledby="people-heading"><h2 id="people-heading" className="text-3xl font-bold">People at AILU</h2><ul className="mt-5 grid gap-5 sm:grid-cols-2">{SITE_CONTENT.people.map((person) => <li key={person.name} className="rounded-2xl border border-black/15 p-5"><h3 className="text-xl font-bold">{person.name}</h3><p>{person.role}</p></li>)}</ul></section>}
      <section className="mt-14 flex flex-wrap gap-3"><Link href="/events" className="inline-flex min-h-11 items-center rounded-full bg-ailu-yellow px-6 font-semibold">Explore events</Link><Link href="/join" className="inline-flex min-h-11 items-center rounded-full border border-black/25 px-6 font-semibold">Join AILU</Link></section>
    </div>
  </>;
}
