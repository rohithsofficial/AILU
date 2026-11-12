// Normal World: referral policy for sales partners (draft). Wording from the CMS.
import LegalPage from "@/components/LegalPage";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";
import { toLocale, type LangParams } from "@/lib/i18n";

export async function generateMetadata({ params }: LangParams) { const locale = toLocale(params.lang); return metadataForPath("/referral-policy", (await getContent(locale)).seo, locale); }

export default async function ReferralPolicyPage({ params }: LangParams) {
  const locale = toLocale(params.lang);
  const content = await getContent(locale);
  return <LegalPage {...content.referralPolicy} ui={content.ui} translated={locale !== "en"} />;
}
