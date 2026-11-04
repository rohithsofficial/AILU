import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { SITE_CONTENT } from "@/content/site";
import { metadataForPath } from "@/lib/public-metadata";

export const metadata = metadataForPath("/about");

export default function AboutPage() {
  return <>
    <section className="relative isolate flex min-h-[52svh] overflow-hidden bg-ailu-black text-ailu-cream" aria-labelledby="about-title">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_76%_50%,rgba(245,196,0,.18),transparent_34%),radial-gradient(ellipse_at_0%_100%,rgba(245,196,0,.08),transparent_38%)]" />
      <div aria-hidden className="absolute inset-y-0 right-[16%] w-px bg-ailu-yellow/15" />
      <div className="relative mx-auto flex w-full max-w-[1500px] items-center px-6 py-16 sm:px-12 lg:px-20">
        <div className="relative z-10 max-w-4xl">
          <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs"><span aria-hidden className="h-px w-9 bg-ailu-yellow" /> The feeling behind AILU</p>
          <h1 id="about-title" className="mt-6 max-w-[12ch] font-display text-[clamp(2.8rem,6.5vw,5.5rem)] font-semibold leading-[.94] tracking-[-.06em]">A day is better when we make it together.</h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-ailu-cream/65 sm:text-base">{SITE_CONTENT.about[0]}</p>
          <p className="mt-4 font-display text-sm font-semibold text-ailu-yellow sm:text-base">{BRAND.tagline}</p>
        </div>
        <div aria-hidden className="pointer-events-none absolute -right-[4%] bottom-[4%] hidden h-[min(58vw,660px)] w-[min(58vw,660px)] opacity-30 lg:block">
          <Image src={BRAND.hand} alt="" fill sizes="(min-width: 1024px) 660px, 58vw" className="object-contain drop-shadow-[0_0_70px_rgba(245,196,0,.16)]" priority />
        </div>
      </div>
    </section>

    <section className="bg-ailu-black px-6 py-14 text-ailu-cream sm:px-12 sm:py-16" aria-labelledby="story-heading">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.65fr_1.35fr] lg:gap-16">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.25em] text-ailu-yellow">A little of everything that matters</p>
          <h2 id="story-heading" className="mt-4 max-w-[10ch] font-display text-3xl font-semibold leading-[.98] tracking-[-.05em] sm:text-4xl">More than a day on the calendar.</h2>
        </div>
        <ol className="border-t border-white/15">
          {SITE_CONTENT.about.slice(1).map((text, index) => <li key={text} className="grid gap-3 border-b border-white/15 py-5 sm:grid-cols-[4rem_1fr] sm:gap-6 sm:py-6">
            <span aria-hidden className="font-display text-xl font-semibold text-ailu-cream/35">0{index + 1}<span className="ml-2 text-ailu-yellow">✳</span></span>
            <p className="max-w-3xl text-sm leading-relaxed text-ailu-cream/65 sm:text-base">{text}</p>
          </li>)}
        </ol>
      </div>
    </section>

    <section className="bg-ailu-black px-6 py-14 text-ailu-cream sm:px-12 sm:py-16" aria-labelledby="work-heading">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[.25em] text-ailu-yellow">From a first thought to the day</p>
        <h2 id="work-heading" className="mt-3 max-w-[12ch] font-display text-3xl font-semibold leading-[.98] tracking-[-.05em] sm:text-4xl">How the moment takes shape.</h2>
        <ol className="mt-8 border-t border-white/15">
          {SITE_CONTENT.process.map((step, index) => <li key={step.title} className="grid gap-3 border-b border-white/15 py-5 sm:grid-cols-[4rem_1fr] sm:gap-8 sm:py-6">
            <span className="font-display text-2xl font-semibold text-ailu-yellow/70">0{index + 1}</span>
            <div><h3 className="font-display text-xl font-semibold sm:text-2xl">{step.title}</h3><p className="mt-2 max-w-3xl text-sm leading-relaxed text-ailu-cream/60">{step.body}</p></div>
          </li>)}
        </ol>
      </div>
    </section>

    <section className="bg-ailu-black px-6 py-12 text-ailu-cream sm:px-12 sm:py-16" aria-labelledby="promises-heading">
      <div className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
        <div><p className="text-[10px] font-bold uppercase tracking-[.25em] text-ailu-yellow">What you can count on</p><h2 id="promises-heading" className="mt-3 max-w-[9ch] font-display text-3xl font-semibold leading-[.98] tracking-[-.05em] sm:text-4xl">Care in every part.</h2></div>
        <ul className="space-y-3 border-t border-white/15 pt-5 text-sm leading-relaxed text-ailu-cream/65 sm:text-base">
          <li>Quotations are prepared for the requirements discussed with you; this site does not list unverified prices.</li>
          <li>Dreams stay private. No dream stories are published.</li>
          <li>An enquiry, application, partner registration, or dream request does not guarantee an outcome.</li>
          <li>No payment is collected on this website.</li>
        </ul>
      </div>
      <div className="mx-auto mt-8 flex max-w-6xl flex-wrap gap-4 border-t border-white/15 pt-5">
        <Link href="/events" className="inline-flex min-h-11 items-center rounded-sm bg-ailu-yellow px-5 text-sm font-semibold text-ailu-black transition hover:bg-ailu-cream">Explore celebrations ↗</Link>
        <Link href="/join" className="inline-flex min-h-11 items-center border-b border-ailu-yellow px-2 text-sm font-semibold text-ailu-yellow">Find your way into AILU ↗</Link>
      </div>
    </section>
  </>;
}
