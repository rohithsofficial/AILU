// Normal World home: a large invitation to the 360° AILU World, right under the top section.
// The picture is drawn in code (a turning ring around the AILU hand), so no photo is implied. Wording: CMS, Home sections.
import Image from "next/image";
import Link from "@/components/LocaleLink";
import World360Icon from "@/components/World360Icon";
import { BRAND } from "@/lib/brand";
import { SITE_CONTENT } from "@/content/site";
import { getContent } from "@/server/cms";
import type { Locale } from "@/lib/i18n";

export default async function WorldTourCard({ locale = "en" }: { locale?: Locale }) {
  const t = (await getContent(locale)).home;
  return <section className="bg-ailu-black px-6 py-8 text-ailu-cream sm:px-10 lg:px-16" aria-labelledby="world-tour-title">
    <Link href={SITE_CONTENT.switch.toWorld.href} className="group mx-auto grid max-w-7xl items-center gap-6 overflow-hidden rounded-sm border border-ailu-yellow/40 bg-gradient-to-br from-ailu-yellow/20 via-ailu-black to-ailu-black p-6 transition-colors hover:border-ailu-yellow sm:grid-cols-[auto_1fr] sm:gap-10 sm:p-8">
      <div aria-hidden className="relative mx-auto h-32 w-32 sm:h-40 sm:w-40">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-ailu-yellow/60 motion-safe:animate-[spin_18s_linear_infinite]" />
        <div className="absolute inset-4 rounded-full border border-white/20 motion-safe:animate-[spin_12s_linear_infinite_reverse]" />
        <span className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-ailu-yellow shadow-[0_0_18px_4px_rgba(245,196,0,.55)]" />
        <Image src={BRAND.hand} alt="" width={96} height={72} className="absolute inset-0 m-auto h-16 w-20 object-contain transition-transform duration-500 group-hover:scale-110 sm:h-20 sm:w-24" />
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-ailu-yellow px-2 py-0.5 font-display text-xs font-bold text-ailu-black">360°</span>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">{t.tourEyebrow}</p>
        <h2 id="world-tour-title" className="mt-3 font-display text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-[1] tracking-[-.05em]">{t.tourTitle}</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ailu-cream/70">{t.tourText}</p>
        <span className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-ailu-yellow px-5 font-semibold text-ailu-black transition-colors group-hover:bg-ailu-cream"><World360Icon className="h-5 w-5" />{t.tourButton} <span aria-hidden>→</span></span>
      </div>
    </Link>
  </section>;
}
