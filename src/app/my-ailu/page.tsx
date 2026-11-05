import PageHero from "@/components/PageHero";
import Link from "next/link";
export const metadata = { title: "My AILU", robots: { index: false, follow: false } };
export default function MyAilu() {
  return (
    <><PageHero title="Your AILU story starts soon">Customer accounts are not available yet. Your celebrations and requests remain handled through direct contact for now.</PageHero><div className="mx-auto max-w-4xl px-5 py-14"><p className="max-w-2xl text-sm leading-relaxed text-ailu-cream/65">Until My AILU is ready, you can share an event idea with the team or reach us directly. We’ll review your enquiry and follow up about the next steps.</p><Link href="/events#enquire" className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-ailu-yellow px-5 text-sm font-semibold text-ailu-black">Explore event enquiries ↗</Link></div></>
  );
}
