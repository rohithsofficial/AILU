import Link from "next/link";
import PageHero from "@/components/PageHero";
import EnquiryForm from "@/components/EnquiryForm";
import { BRAND } from "@/lib/brand";
import { metadataForPath } from "@/lib/public-metadata";

export const metadata = metadataForPath("/contact");

export default function ContactPage() {
  return <>
    <PageHero title="Contact AILU">Tell us what you are planning, or choose the form that fits your reason for reaching out.</PageHero>
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 lg:grid-cols-[.8fr_1.2fr]">
      <aside><h2 className="text-2xl font-bold">Reach us</h2><p className="mt-2 text-black/85">Based in Udupi, Karnataka · Planning celebrations across India.</p><ul className="mt-5 space-y-4"><li><a className="min-h-11 inline-flex items-center font-semibold underline decoration-ailu-yellow decoration-2" href={`tel:${BRAND.phone.replace(/\s/g, "")}`}>{BRAND.phone}</a></li><li><a className="min-h-11 inline-flex items-center font-semibold underline decoration-ailu-yellow decoration-2" href={`${BRAND.whatsapp}?text=${encodeURIComponent("Hi AILU, I would like to ask about planning a celebration.")}`} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a></li><li><a className="min-h-11 inline-flex items-center font-semibold underline decoration-ailu-yellow decoration-2" href={`mailto:${BRAND.email}`}>{BRAND.email}</a></li></ul>
        <h2 className="mt-10 text-2xl font-bold">Which form should I use?</h2><ul className="mt-3 space-y-3"><li><Link className="underline decoration-ailu-yellow decoration-2" href="/events#enquire">Planning an event? Send an event enquiry.</Link></li><li><Link className="underline decoration-ailu-yellow decoration-2" href="/join/team">Want to work with AILU? Apply to join the team.</Link></li><li><Link className="underline decoration-ailu-yellow decoration-2" href="/join/partner">Want to refer clients? Register as a sales partner.</Link></li></ul>
      </aside>
      <section aria-labelledby="contact-form-heading"><h2 id="contact-form-heading" className="text-2xl font-bold">Tell us about your event</h2><p className="mt-2 mb-5 text-black/80">An enquiry is not a confirmed booking. AILU will review your details and discuss availability, scope, terms, and a quotation.</p><EnquiryForm /></section>
    </div>
  </>;
}
