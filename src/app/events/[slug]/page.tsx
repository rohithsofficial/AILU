import { notFound } from "next/navigation";
import { EVENT_CATEGORIES, getCategory } from "@/lib/events";
import EnquiryForm from "@/components/EnquiryForm";
import PageHero from "@/components/PageHero";

export function generateStaticParams() { return EVENT_CATEGORIES.map((c) => ({ slug: c.slug })); }

export default function EventDetail({ params }: { params: { slug: string } }) {
  const c = getCategory(params.slug);
  if (!c) notFound();
  return (
    <>
    <PageHero title={c.title}>{c.blurb}</PageHero>
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h2 className="mt-10 text-2xl font-bold">Services we can arrange</h2>
      <ul className="mt-3 list-disc space-y-1 pl-6">{c.services.map((s) => <li key={s}>{s}</li>)}</ul>
      <p className="mt-6 rounded-xl bg-ailu-yellow/30 p-4">Request a personalised quotation. Scope, availability and pricing are agreed with you before anything is confirmed.</p>
      <h2 id="enquire" className="mt-12 scroll-mt-24 text-2xl font-bold">Plan this event</h2>
      <div className="mt-4"><EnquiryForm defaultCategory={c.slug} /></div>
    </div>
    </>
  );
}
