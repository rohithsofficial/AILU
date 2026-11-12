// Normal World: website terms (draft). Wording from the CMS.
import LegalPage from "@/components/LegalPage";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";
import { toLocale, type LangParams } from "@/lib/i18n";

export async function generateMetadata({ params }: LangParams) { const locale = toLocale(params.lang); return metadataForPath("/terms", (await getContent(locale)).seo, locale); }

export default async function TermsPage({ params }: LangParams) {
  const locale = toLocale(params.lang);
  const content = await getContent(locale);
  return <LegalPage {...content.terms} ui={content.ui} translated={locale !== "en"} />;
}
