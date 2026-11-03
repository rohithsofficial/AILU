import PageHero from "@/components/PageHero";
import PartnerForm from "@/components/forms/PartnerForm";
export const metadata = { title: "Become an AILU sales partner" };

export default function PartnerPage() {
  return (
    <>
      <PageHero title="Bring opportunities. Grow together.">Introduce people planning an event to AILU. When a client you referred completes a booking with us, you receive a monetary reward.</PageHero>
      <div className="mx-auto max-w-3xl px-4 py-14">
        <p className="mb-6 rounded-lg bg-ailu-yellow/30 p-4 text-sm">The reward depends on the event and the partner terms AILU confirms with you. It applies only to a verified, completed booking. Earnings are not guaranteed.</p>
        <PartnerForm />
      </div>
    </>
  );
}
