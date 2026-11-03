import EventDiscovery from "@/components/EventDiscovery";
import EnquiryForm from "@/components/EnquiryForm";
import { metadataForPath } from "@/lib/public-metadata";

export const metadata = metadataForPath("/events");

export default function EventsPage() {
  return <>
    <EventDiscovery />
    <section className="relative overflow-hidden bg-ailu-cream px-4 py-16 text-ailu-black sm:px-8 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[.25em] text-black/50">The next part starts with you</p>
        <h2 id="enquire" className="mt-3 scroll-mt-24 max-w-[14ch] font-display text-4xl font-extrabold leading-[.9] tracking-tight sm:text-6xl">Tell us what you’re gathering for.</h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-black/70">Share the occasion, date if known, location and what matters to you. AILU will review your enquiry and discuss availability, scope, terms and a quotation. An enquiry is not a confirmed booking.</p>
        <div className="mt-8"><EnquiryForm /></div>
      </div>
    </section>
  </>;
}
