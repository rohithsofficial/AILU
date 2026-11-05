import EventDiscovery from "@/components/EventDiscovery";
import EnquiryForm from "@/components/EnquiryForm";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";

export async function generateMetadata() { return metadataForPath("/events", (await getContent()).seo); }

export default async function EventsPage() {
  const content = await getContent();
  const t = content.eventsPage;
  return <>
    <EventDiscovery />
    <section className="relative overflow-hidden bg-ailu-black px-6 py-14 text-ailu-cream sm:px-10 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-ailu-yellow">{t.enquiryEyebrow}</p>
        <h2 id="enquire" className="mt-3 scroll-mt-24 max-w-[14ch] font-display text-3xl font-semibold leading-[.98] tracking-tight sm:text-4xl">{t.enquiryTitle}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ailu-cream/60">{t.enquiryText}</p>
        <div className="mt-8"><EnquiryForm /></div>
      </div>
    </section>
  </>;
}
