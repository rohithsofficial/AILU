// Normal World: Donation Box, information only. Donations stay switched off until AILU has a legal and payment setup.
import PageHero from "@/components/PageHero";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";
import { toLocale, type LangParams } from "@/lib/i18n";
export async function generateMetadata({ params }: LangParams) { const locale = toLocale(params.lang); return metadataForPath("/donate", (await getContent(locale)).seo, locale); }

export default async function Donate({ params }: LangParams) {
  const content = await getContent(toLocale(params.lang));
  const t = content.donate;
  return (
    <>
    <PageHero marker={content.ui.pageMarker} title={t.title}>{t.lead}</PageHero>
    <div className="mx-auto max-w-3xl px-4 py-8 text-ailu-cream sm:py-12">
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
