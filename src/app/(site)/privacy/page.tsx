import LegalPage from "@/components/LegalPage";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";

export async function generateMetadata() { return metadataForPath("/privacy", (await getContent()).seo); }

export default async function PrivacyPage() { return <LegalPage {...(await getContent()).privacy} />; }
