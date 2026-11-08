// Normal World: Donation Box, information only. Donations stay switched off until AILU has a legal and payment setup.
import PageHero from "@/components/PageHero";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";
export async function generateMetadata() { return metadataForPath("/donate", (await getContent()).seo); }

export default async function Donate() {
  const content = await getContent();
  const t = content.donate;
  return (
    <>
    <PageHero title={t.title}>{t.lead}</PageHero>
    <div className="mx-auto max-w-3xl px-4 py-12 text-ailu-cream">
      <p className="rounded-sm border border-ailu-yellow/45 bg-ailu-yellow/10 p-4 text-sm"><strong>{t.statusTitle}</strong> {t.statusText}</p>
      <h2 className="mt-8 font-display text-2xl font-semibold">{t.listTitle}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-relaxed text-ailu-cream/65">
        <li>{t.item1}</li>
        <li>{t.item2}</li>
        <li>{t.item3}</li>
        <li>{t.item4}</li>
      </ul>
    </div>
    </>
  );
}
