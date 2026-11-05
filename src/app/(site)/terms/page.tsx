import LegalPage from "@/components/LegalPage";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";

export async function generateMetadata() { return metadataForPath("/terms", (await getContent()).seo); }

export default async function TermsPage() { return <LegalPage {...(await getContent()).terms} />; }
