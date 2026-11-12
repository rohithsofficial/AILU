// Normal World: team application form. Applying does not guarantee work.
import PageHero from "@/components/PageHero";
import ApplicationForm from "@/components/forms/ApplicationForm";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";
import { toLocale, type LangParams } from "@/lib/i18n";
export async function generateMetadata({ params }: LangParams) { const locale = toLocale(params.lang); return metadataForPath("/join/team", (await getContent(locale)).seo, locale); }

export default async function TeamPage({ params }: LangParams) {
  const content = await getContent(toLocale(params.lang));
  const t = content.join;
  return (
    <>
      <PageHero marker={content.ui.pageMarker} title={t.teamPageTitle}>{t.teamPageLead}</PageHero>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-14">
        <p className="mb-6 rounded-lg bg-ailu-yellow/30 p-4 text-sm">{t.teamPageNote}</p>
        <ApplicationForm />
      </div>
    </>
  );
}
