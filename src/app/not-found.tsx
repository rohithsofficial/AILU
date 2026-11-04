import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return <SiteChrome><PageHero title="We could not find that page">The address may have changed, or the page may not be available.</PageHero><div className="mx-auto max-w-4xl px-4 py-14"><Link href="/" className="inline-flex min-h-11 items-center rounded-full bg-ailu-yellow px-6 font-semibold">Back to AILU home</Link><Link href="/events" className="ml-3 inline-flex min-h-11 items-center underline decoration-ailu-yellow decoration-2">Explore events</Link></div></SiteChrome>;
}
