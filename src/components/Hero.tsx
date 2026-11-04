"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";
import { canUse3D } from "@/lib/device";

const HeroScene = dynamic(() => import("@/components/HeroScene"), { ssr: false });

export default function Hero() {
  const [useScene, setUseScene] = useState(false);

  useEffect(() => {
    setUseScene(canUse3D());
  }, []);

  return (
    <section className="relative isolate flex min-h-[min(760px,calc(100svh-4.5rem))] overflow-hidden bg-ailu-black text-ailu-cream">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_72%_48%,rgba(245,196,0,.15),transparent_32%),radial-gradient(ellipse_at_50%_110%,rgba(245,196,0,.08),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-[12%] hidden w-px bg-white/[.06] lg:block" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col justify-between px-6 pb-8 pt-10 sm:px-10 sm:pb-10 sm:pt-12 lg:px-16">
        <p className="relative z-10 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.25em] text-ailu-yellow sm:text-xs">
          <span className="h-px w-8 bg-ailu-yellow" /> AILU · Udupi, Karnataka
        </p>

        <div className="relative grid flex-1 items-center py-14 lg:grid-cols-[1.1fr_.9fr] lg:py-10">
          <div aria-hidden className="pointer-events-none absolute inset-y-[-4%] right-[-12%] w-[76%] opacity-70 sm:right-[-5%] sm:w-[65%] lg:inset-y-[-10%] lg:right-[-4%] lg:w-[58%]">
            {useScene ? <HeroScene /> : <Image src={BRAND.hand} alt="" fill sizes="(min-width: 1024px) 58vw, 76vw" className="object-contain drop-shadow-[0_20px_55px_rgba(245,196,0,.18)]" priority />}
          </div>
          <div className="relative z-10 max-w-3xl py-6 lg:py-12">
            <h1 className="max-w-[11ch] font-display text-[clamp(3.25rem,7vw,6.5rem)] font-semibold leading-[.94] tracking-[-.065em]">
              Creating moments.<br /><span className="font-medium text-ailu-yellow">Delivering smiles.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ailu-cream/70 sm:text-lg">A gathering, a tradition, a reason to bring everyone close. Tell us what you’re imagining.</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2">
              <Link href="/events#enquire" className="group inline-flex min-h-12 items-center gap-3 border-b border-ailu-yellow pb-1 font-semibold text-ailu-yellow transition-colors hover:text-ailu-cream">Plan a celebration <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span></Link>
              <Link href="/join" className="inline-flex min-h-12 items-center text-sm font-medium text-ailu-cream/65 transition-colors hover:text-ailu-yellow">Join the AILU world</Link>
              <Link href="/" className="inline-flex min-h-12 items-center gap-2 rounded-sm border border-ailu-cream/25 px-4 text-sm font-semibold text-ailu-cream transition-colors hover:border-ailu-yellow hover:text-ailu-yellow"><span aria-hidden>◉</span> Enter the 360° AILU world</Link>
            </div>
          </div>
        </div>

        <a href="#celebration-world" className="relative z-10 flex min-h-10 items-center gap-3 self-start text-[10px] font-semibold uppercase tracking-[.24em] text-ailu-cream/50 transition-colors hover:text-ailu-yellow">
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full border border-white/20 text-ailu-yellow">↓</span> Step inside a celebration
        </a>
      </div>
    </section>
  );
}
