// Normal World: placeholder for future customer accounts. Kept out of Google (noindex).
import { getContent } from "@/server/cms";
import { toLocale, type LangParams } from "@/lib/i18n";
import PageHero from "@/components/PageHero";
import Link from "@/components/LocaleLink";
export const metadata = { title: "My AILU", robots: { index: false, follow: false } };
export default async function MyAilu({ params }: LangParams) {
  const content = await getContent(toLocale(params.lang));
  const t = content.myAilu;
  return (
    <><PageHero marker={content.ui.pageMarker} title={t.title}>{t.lead}</PageHero><div className="mx-auto max-w-4xl px-5 py-14"><p className="max-w-2xl text-sm leading-relaxed text-ailu-cream/65">{t.text}</p><Link href="/events#enquire" className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-ailu-yellow px-5 text-sm font-semibold text-ailu-black">{t.link}</Link></div></>
  );
}
