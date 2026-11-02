import Link from "next/link";
import { EVENT_CATEGORIES } from "@/lib/events";

export default function Home() {
  return (
    <>
      <section className="bg-ailu-black text-ailu-cream">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">Every moment deserves something extraordinary.</h1>
          <p className="mt-6 max-w-xl text-lg text-ailu-cream/80">From unforgettable celebrations to meaningful experiences, AILU brings people together through creativity, entertainment and thoughtful event planning.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/events" className="rounded-full bg-ailu-yellow px-7 py-3 font-semibold text-ailu-black">Explore events</Link>
            <Link href="/my-ailu" className="rounded-full border border-ailu-yellow px-7 py-3 font-semibold text-ailu-yellow">Become part of AILU</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold">Every occasion, its own kind of magic</h2>
        <p className="mt-2 max-w-2xl text-black/70">Every event is scoped individually. Share your idea and we will prepare a tailored quotation.</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EVENT_CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link href={`/events/${c.slug}`} className="block h-full rounded-2xl border border-black/10 bg-white p-6 transition hover:-translate-y-1 hover:border-ailu-yellow hover:shadow-lg">
                <h3 className="text-xl font-semibold">{c.title}</h3>
                <p className="mt-2 text-black/70">{c.blurb}</p>
                <p className="mt-4 text-sm font-semibold">Request a personalised quotation</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-ailu-yellow">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-3xl font-bold">From &ldquo;what if&rdquo; to &ldquo;what a day&rdquo;</h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-3">
            <li><h3 className="font-semibold">Tell us your idea</h3><p>Share your occasion, date, location and what you have in mind.</p></li>
            <li><h3 className="font-semibold">Shape the plan</h3><p>We discuss details, check availability and prepare a quotation.</p></li>
            <li><h3 className="font-semibold">Make it happen</h3><p>Once scope, terms and booking payment are agreed, planning begins.</p></li>
          </ol>
          <p className="mt-6 text-sm">An enquiry is not a confirmed booking.</p>
        </div>
      </section>
    </>
  );
}
