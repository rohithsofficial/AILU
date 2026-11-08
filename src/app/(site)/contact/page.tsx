// Normal World: Contact page (phone, WhatsApp, email). Wording from the CMS.
import Link from "next/link";
import EnquiryForm from "@/components/EnquiryForm";
import { BRAND } from "@/lib/brand";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";

export async function generateMetadata() { return metadataForPath("/contact", (await getContent()).seo); }


export default async function ContactPage() {
  const content = await getContent();
  const t = content.contact;
  const { settings } = content;
  const whatsappHref = `${settings.whatsapp}?text=${encodeURIComponent(settings.whatsappMessage)}`;
  return <>
    <section className="bg-ailu-black px-6 py-12 text-ailu-cream sm:px-12 sm:py-16" aria-labelledby="contact-title">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">{t.eyebrow}</p>
          <h1 id="contact-title" className="mt-4 max-w-[12ch] font-display text-[clamp(3.2rem,8vw,7rem)] font-extrabold leading-[.86] tracking-[-.08em]">{t.title}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ailu-cream/70 sm:text-lg">{t.lead}</p>
        </div>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-ailu-yellow px-6 font-semibold text-ailu-black transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ailu-yellow">{t.whatsappLabel} <span aria-hidden>↗</span></a>
      </div>
    </section>

    <section className="bg-ailu-black px-6 py-10 text-ailu-cream sm:px-12 sm:py-12" aria-label="Ways to contact AILU">
      <div className="mx-auto grid max-w-6xl gap-4 border-y border-white/15 py-5 sm:grid-cols-2 lg:grid-cols-3">
        <a className="group flex min-h-16 flex-col justify-center border-b border-white/10 py-3 sm:border-0" href={`tel:${settings.phone.replace(/\s/g, "")}`}><span className="text-[10px] font-bold uppercase tracking-[.2em] text-ailu-cream/45">{t.callLabel}</span><span className="mt-1 text-lg font-semibold underline decoration-ailu-yellow decoration-2 underline-offset-4 group-hover:text-ailu-yellow">{settings.phone}</span></a>
        <a className="group flex min-h-16 flex-col justify-center border-b border-white/10 py-3 sm:border-0" href={`mailto:${settings.email}`}><span className="text-[10px] font-bold uppercase tracking-[.2em] text-ailu-cream/45">{t.emailLabel}</span><span className="mt-1 break-all text-lg font-semibold underline decoration-ailu-yellow decoration-2 underline-offset-4 group-hover:text-ailu-yellow">{settings.email}</span></a>
        <p className="flex min-h-16 flex-col justify-center py-3"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-black/45">{t.locationLabel}</span><span className="mt-1 text-lg font-semibold">{t.location}</span></p>
      </div>
    </section>

    <section className="bg-ailu-black px-6 pb-14 text-ailu-cream sm:px-12 sm:pb-16" aria-labelledby="contact-form-heading">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-16">
        <aside>
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-ailu-yellow">{t.pathsEyebrow}</p>
          <h2 className="mt-3 max-w-[12ch] font-display text-3xl font-bold leading-[.95] sm:text-4xl">{t.pathsTitle}</h2>
          <ul className="mt-6 border-t border-white/15">
            <li className="border-b border-white/15 py-4"><Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline decoration-ailu-yellow decoration-2 underline-offset-4" href="/join/team">{t.teamLink} <span aria-hidden>↗</span></Link></li>
            <li className="border-b border-white/15 py-4"><Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline decoration-ailu-yellow decoration-2 underline-offset-4" href="/join/partner">{t.partnerLink} <span aria-hidden>↗</span></Link></li>
            <li className="border-b border-white/15 py-4"><Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline decoration-ailu-yellow decoration-2 underline-offset-4" href="/dreams">{t.dreamLink} <span aria-hidden>↗</span></Link></li>
          </ul>
        </aside>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-ailu-yellow">{t.formEyebrow}</p>
          <h2 id="contact-form-heading" className="mt-3 max-w-[14ch] font-display text-3xl font-bold leading-[.95] sm:text-4xl">{t.formTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ailu-cream/60">{t.formText}</p>
          <div className="mt-6"><EnquiryForm /></div>
        </div>
      </div>
    </section>
  </>;
}
