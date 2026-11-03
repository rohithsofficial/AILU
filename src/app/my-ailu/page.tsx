import PageHero from "@/components/PageHero";
import Link from "next/link";
export const metadata = { title: "My AILU", robots: { index: false, follow: false } };
export default function MyAilu() {
  return (
    <><PageHero title="Your AILU story starts soon">Customer accounts are not available yet. Your celebrations and requests remain handled through direct contact for now.</PageHero><div className="mx-auto max-w-4xl px-5 py-20"><p className="max-w-2xl text-lg leading-relaxed text-black/75">Until My AILU is ready, you can share an event idea with the team or reach us directly. We’ll review your enquiry and follow up about the next steps.</p><Link href="/events#enquire" className="mt-7 inline-flex min-h-12 items-center rounded-full bg-ailu-yellow px-6 font-semibold">Explore event enquiries ↗</Link></div></>
  );
}
