// Normal World: private dream support. The form shows only when DREAMS_FORM_OPEN=true; dreams are never published.
import { BRAND } from "@/lib/brand";
import PageHero from "@/components/PageHero";
import DreamForm from "@/components/forms/DreamForm";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";
export async function generateMetadata() { return metadataForPath("/dreams", (await getContent()).seo); }
export const dynamic = "force-dynamic";

export default async function Dreams() {
  const content = await getContent();
  const t = content.dreams;
  const formOpen = process.env.DREAMS_FORM_OPEN === "true";
  return (
    <>
    <PageHero title={t.title}>{t.lead}</PageHero>
    <div className="mx-auto max-w-3xl px-4 py-12 text-ailu-cream">
      <h2 className="font-display text-2xl font-semibold">{t.promiseEyebrow}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-relaxed text-ailu-cream/65">
        <li>{t.promiseText}</li>
        <li>{t.dignityText}</li>
        <li>{t.privacyText}</li>
        <li>{t.safetyText}</li>
      </ul>
      <p className="mt-6 text-sm leading-relaxed text-ailu-cream/60">{t.fulfilmentText}</p>
      {formOpen ? <section className="mt-10" aria-labelledby="dream-form-title">
        <h2 id="dream-form-title" className="font-display text-2xl font-bold">{t.formTitle}</h2>
        <p className="mt-2 text-sm text-ailu-cream/65">{t.emergencyText} <a className="font-semibold underline" href="tel:112">112</a>.</p>
        <p className="mt-3 rounded-xl border border-amber-700/30 bg-amber-50 p-4 text-sm text-black"><strong>{t.safeTitle}</strong> {t.safeText}</p>
        <DreamForm />
      </section> : <p className="mt-6 rounded-sm border border-ailu-yellow/45 bg-ailu-yellow/10 p-4 text-sm text-ailu-cream"><strong>{t.closedTitle}</strong> {t.closedText} <a className="font-semibold underline" href={`tel:${content.settings.phone.replace(/\s/g, "")}`}>{content.settings.phone}</a> {t.closedOr} <a className="font-semibold underline" href={`mailto:${content.settings.email}`}>{content.settings.email}</a>.</p>}
    </div>
    </>
  );
}
