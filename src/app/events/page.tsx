import EventDiscovery from "@/components/EventDiscovery";
import EnquiryForm from "@/components/EnquiryForm";
import { metadataForPath } from "@/lib/public-metadata";

export const metadata = metadataForPath("/events");

export default function EventsPage() {
  return <>
    <EventDiscovery />
    <section className="relative overflow-hidden bg-ailu-black px-6 py-14 text-ailu-cream sm:px-10 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-ailu-yellow">The next part starts with you</p>
        <h2 id="enquire" className="mt-3 scroll-mt-24 max-w-[14ch] font-display text-3xl font-semibold leading-[.98] tracking-tight sm:text-4xl">Tell us what you’re gathering for.</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ailu-cream/60">Share the occasion, date if known, location and what matters to you. AILU will review your enquiry and discuss availability, scope, terms and a quotation. An enquiry is not a confirmed booking.</p>
        <div className="mt-8"><EnquiryForm /></div>
      </div>
    </section>
  </>;
}
