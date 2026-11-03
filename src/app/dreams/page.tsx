import { BRAND } from "@/lib/brand";
import PageHero from "@/components/PageHero";
import DreamForm from "@/components/forms/DreamForm";
import { metadataForPath } from "@/lib/public-metadata";
export const metadata = metadataForPath("/dreams");
export const dynamic = "force-dynamic";

export default function Dreams() {
  const formOpen = process.env.DREAMS_FORM_OPEN === "true";
  return (
    <>
    <PageHero title="Dreams, handled privately">AILU hopes to support people facing barriers to a dream when it is able to do so. Any support is private and not guaranteed.</PageHero>
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h2 className="text-2xl font-bold">Our promise</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6">
        <li>Your story is never published or shared publicly. There are no public stories on this site.</li>
        <li>We help with dignity and respect.</li>
        <li>We will not publish your dream or story. Only AILU’s authorized owner and managers can review submissions privately.</li>
        <li>Do not send Aadhaar, PAN, bank or card details, medical records, your home address, or identity documents.</li>
      </ul>
      <p className="mt-6 text-sm text-black/65">Sharing a dream does not guarantee fulfilment. AILU decides whether it can help based on suitability, safety and available resources. If the dreamer is under 18, a parent or guardian must submit and consent. The child’s contact details are not requested.</p>
      {formOpen ? <section className="mt-10" aria-labelledby="dream-form-title">
        <h2 id="dream-form-title" className="font-display text-2xl font-bold">Share privately with AILU</h2>
        <p className="mt-2 text-sm text-black/70">This form is not for emergencies or urgent medical or financial crises. If anyone is in immediate danger in India, call <a className="font-semibold underline" href="tel:112">112</a>.</p>
        <p className="mt-3 rounded-xl border border-amber-700/30 bg-amber-50 p-4 text-sm text-black"><strong>Please keep your details safe.</strong> Do not enter Aadhaar, PAN, bank or card details, medical records, your home address, or identity documents. AILU will not ask for them here.</p>
        <DreamForm />
      </section> : <p className="mt-6 rounded-lg bg-ailu-yellow/50 p-4 text-black"><strong>The dream submission form is not open.</strong> Please do not email sensitive personal details. For general questions, call <a className="font-semibold underline" href={`tel:${BRAND.phone.replace(/\s/g, "")}`}>{BRAND.phone}</a> or write to <a className="font-semibold underline" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>.</p>}
    </div>
    </>
  );
}
