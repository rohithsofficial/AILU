import PageHero from "@/components/PageHero";
import ApplicationForm from "@/components/forms/ApplicationForm";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";
export async function generateMetadata() { return metadataForPath("/join/team", (await getContent()).seo); }

export default async function TeamPage() {
  const content = await getContent();
  const t = content.join;
  return (
    <>
      <PageHero title={t.teamPageTitle}>{t.teamPageLead}</PageHero>
      <div className="mx-auto max-w-3xl px-4 py-14">
        <p className="mb-6 rounded-lg bg-ailu-yellow/30 p-4 text-sm">{t.teamPageNote}</p>
        <ApplicationForm />
      </div>
    </>
  );
}
