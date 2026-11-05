import PageHero from "@/components/PageHero";
import PartnerForm from "@/components/forms/PartnerForm";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";
export async function generateMetadata() { return metadataForPath("/join/partner", (await getContent()).seo); }

export default async function PartnerPage() {
  const content = await getContent();
  const t = content.join;
  return (
    <>
      <PageHero title={t.partnerPageTitle}>{t.partnerPageLead}</PageHero>
      <div className="mx-auto max-w-3xl px-4 py-14">
        <p className="mb-6 rounded-lg bg-ailu-yellow/50 p-4 text-sm text-black">{t.partnerPageNote}</p>
        <PartnerForm />
      </div>
    </>
  );
}
