import Link from "next/link";
import { metadataForPath } from "@/lib/public-metadata";

export const metadata = metadataForPath("/join");

export default function Join() {
  return <>
    <section className="relative isolate flex min-h-[66svh] items-end overflow-hidden bg-ailu-yellow px-6 pb-12 pt-20 text-ailu-black sm:px-12 sm:pb-16 lg:px-20">
      <span aria-hidden className="absolute right-[5%] top-[12%] -z-10 font-display text-[clamp(8rem,24vw,24rem)] font-extrabold leading-none tracking-[-.1em] text-ailu-black/10">AILU</span>
      <div className="mx-auto w-full max-w-[1500px]">
        <p className="text-[10px] font-bold uppercase tracking-[.3em] opacity-60 sm:text-xs">Not just for the guests</p>
        <h1 className="mt-5 max-w-[10ch] font-display text-[clamp(4rem,12vw,11rem)] font-extrabold leading-[.84] tracking-[-.09em]">There’s room for you.</h1>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-ailu-black/75 sm:text-xl">The celebrations happen together. Find the way you want to be part of them.</p>
      </div>
    </section>

    <div className="bg-ailu-black px-6 text-ailu-cream sm:px-12 lg:px-20">
      <div className="mx-auto max-w-[1500px] divide-y divide-white/20 border-y border-white/20">
        <section className="grid gap-6 py-10 sm:grid-cols-[.45fr_1fr_auto] sm:items-center sm:gap-10 sm:py-14">
          <p className="font-display text-sm font-semibold uppercase tracking-[.25em] text-ailu-yellow">Work with the team</p>
          <div><h2 className="max-w-[14ch] font-display text-4xl font-bold leading-[.9] tracking-[-.06em] sm:text-6xl">Bring your talent into the room.</h2><p className="mt-4 max-w-2xl text-sm leading-relaxed text-ailu-cream/65 sm:text-base">Coordination, hosting, dance, music, photography, decoration, logistics and more. Share what you can do and what you want to learn. Applying does not guarantee employment or an assignment.</p></div>
          <Link href="/join/team" className="group inline-flex min-h-12 items-center gap-3 font-semibold text-ailu-yellow sm:justify-self-end">Tell us about you <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span></Link>
        </section>
        <section className="grid gap-6 py-10 sm:grid-cols-[.45fr_1fr_auto] sm:items-center sm:gap-10 sm:py-14">
          <p className="font-display text-sm font-semibold uppercase tracking-[.25em] text-ailu-yellow">Partner with AILU</p>
          <div><h2 className="max-w-[14ch] font-display text-4xl font-bold leading-[.9] tracking-[-.06em] sm:text-6xl">Know someone planning a day?</h2><p className="mt-4 max-w-2xl text-sm leading-relaxed text-ailu-cream/65 sm:text-base">Introduce them to AILU as an external sales partner. A reward is considered only for a verified, completed and paid booking under terms AILU confirms. Registration does not guarantee earnings.</p></div>
          <Link href="/join/partner" className="group inline-flex min-h-12 items-center gap-3 font-semibold text-ailu-yellow sm:justify-self-end">Explore partnering <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span></Link>
        </section>
      </div>
      <p className="mx-auto max-w-[1500px] py-8 text-sm text-ailu-cream/55"><Link href="/events" className="underline decoration-ailu-yellow underline-offset-4">Looking for a celebration instead?</Link></p>
    </div>
  </>;
}
