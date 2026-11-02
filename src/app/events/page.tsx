import Link from "next/link";
import { EVENT_CATEGORIES } from "@/lib/events";
import EnquiryForm from "@/components/EnquiryForm";

export const metadata = { title: "Events | AILU" };

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-4xl font-extrabold">Events</h1>
      <p className="mt-2 max-w-2xl text-black/70">Choose an occasion to see how AILU can help. Pricing depends on your requirements, so we prepare a personalised quotation for every event.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EVENT_CATEGORIES.map((c) => (
          <li key={c.slug} className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="text-xl font-semibold">{c.title}</h2>
            <p className="mt-2 text-black/70">{c.blurb}</p>
            <Link href={`/events/${c.slug}`} className="mt-4 inline-block font-semibold underline decoration-ailu-yellow decoration-2">See details</Link>
          </li>
        ))}
      </ul>
      <h2 id="enquire" className="mt-16 text-3xl font-bold">Tell us about your event</h2>
      <div className="mt-6"><EnquiryForm /></div>
    </div>
  );
}
