// Normal World: referral policy for sales partners (draft). Wording from the CMS.
import LegalPage from "@/components/LegalPage";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";

export async function generateMetadata() { return metadataForPath("/referral-policy", (await getContent()).seo); }

export default async function ReferralPolicyPage() { return <LegalPage {...(await getContent()).referralPolicy} />; }
