import Link from "next/link";
import { metadataForPath } from "@/lib/public-metadata";
import { getContent } from "@/server/cms";

export async function generateMetadata() { return metadataForPath("/join", (await getContent()).seo); }

export default async function Join() {
  const content = await getContent();
  const t = content.join;
  return <>
    <section className="relative isolate flex min-h-[52svh] items-end overflow-hidden bg-ailu-black px-6 pb-12 pt-20 text-ailu-cream sm:px-12 sm:pb-16 lg:px-20">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_46%,rgba(245,196,0,.16),transparent_34%)]" />
      <span aria-hidden className="absolute right-[5%] top-[12%] -z-10 font-display text-[clamp(6rem,18vw,16rem)] font-bold leading-none tracking-[-.1em] text-white/[.035]">AILU</span>
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">{t.eyebrow}</p>
        <h1 className="mt-5 max-w-[10ch] font-display text-[clamp(3rem,7vw,5.5rem)] font-semibold leading-[.94] tracking-[-.065em]">{t.title}</h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-ailu-cream/65 sm:text-lg">{t.lead}</p>
      </div>
    </section>

    <div className="bg-ailu-black px-6 text-ailu-cream sm:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl divide-y divide-white/15 border-y border-white/15">
        <section className="grid gap-6 py-8 sm:grid-cols-[.45fr_1fr_auto] sm:items-center sm:gap-10 sm:py-10">
          <p className="font-display text-sm font-semibold uppercase tracking-[.25em] text-ailu-yellow">{t.teamEyebrow}</p>
          <div><h2 className="max-w-[14ch] font-display text-2xl font-semibold leading-[1.02] tracking-[-.04em] sm:text-3xl">{t.teamTitle}</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-ailu-cream/60">{t.teamText}</p></div>
          <Link href="/join/team" className="group inline-flex min-h-12 items-center gap-3 font-semibold text-ailu-yellow sm:justify-self-end">{t.teamLink} <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span></Link>
        </section>
        <section className="grid gap-6 py-8 sm:grid-cols-[.45fr_1fr_auto] sm:items-center sm:gap-10 sm:py-10">
          <p className="font-display text-sm font-semibold uppercase tracking-[.25em] text-ailu-yellow">{t.partnerEyebrow}</p>
          <div><h2 className="max-w-[14ch] font-display text-2xl font-semibold leading-[1.02] tracking-[-.04em] sm:text-3xl">{t.partnerTitle}</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-ailu-cream/60">{t.partnerText}</p></div>
          <Link href="/join/partner" className="group inline-flex min-h-12 items-center gap-3 font-semibold text-ailu-yellow sm:justify-self-end">{t.partnerLink} <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span></Link>
        </section>
      </div>
      <p className="mx-auto max-w-6xl py-7 text-sm text-ailu-cream/50"><Link href="/events" className="underline decoration-ailu-yellow underline-offset-4">{t.eventsLink}</Link></p>
    </div>
  </>;
}
