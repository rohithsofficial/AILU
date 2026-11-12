// Normal World: privacy notice (draft, to be reviewed by a lawyer). Wording from the CMS.
import LegalPage from "@/components/LegalPage";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";
import { toLocale, type LangParams } from "@/lib/i18n";

export async function generateMetadata({ params }: LangParams) { const locale = toLocale(params.lang); return metadataForPath("/privacy", (await getContent(locale)).seo, locale); }

export default async function PrivacyPage({ params }: LangParams) {
  const locale = toLocale(params.lang);
  const content = await getContent(locale);
  return <LegalPage {...content.privacy} ui={content.ui} translated={locale !== "en"} />;
}
