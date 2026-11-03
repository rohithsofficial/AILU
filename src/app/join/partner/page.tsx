import PageHero from "@/components/PageHero";
import PartnerForm from "@/components/forms/PartnerForm";
import { metadataForPath } from "@/lib/public-metadata";
export const metadata = metadataForPath("/join/partner");

export default function PartnerPage() {
  return (
    <>
      <PageHero title="Bring opportunities. Grow together.">Introduce people planning an event to AILU. A reward may be considered after a verified, completed, and paid booking, under terms AILU confirms in writing.</PageHero>
      <div className="mx-auto max-w-3xl px-4 py-14">
        <p className="mb-6 rounded-lg bg-ailu-yellow/50 p-4 text-sm text-black">Registration does not guarantee approval or earnings. A reward is not guaranteed and is considered only for a verified, completed, fully paid booking under terms AILU confirms with you in writing.</p>
        <PartnerForm />
      </div>
    </>
  );
}
