"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND } from "@/lib/brand";

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate flex min-h-[min(900px,calc(100svh-4.5rem))] overflow-hidden bg-ailu-black text-ailu-cream">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_52%_42%,rgba(245,196,0,.2),transparent_28%),radial-gradient(ellipse_at_50%_100%,rgba(245,196,0,.12),transparent_50%)]" />
      <span aria-hidden className="absolute right-[12%] top-[17%] -z-10 font-display text-5xl text-ailu-yellow/70 sm:right-[19%] sm:top-[12%] sm:text-7xl">✳</span>
      <span aria-hidden className="absolute bottom-[21%] left-[8%] -z-10 text-2xl text-ailu-cream/55 sm:left-[16%] sm:text-4xl">✦</span>

      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col justify-between px-6 pb-9 pt-14 sm:px-12 sm:pb-12 lg:px-20 lg:pt-16">
        <p className="relative z-10 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.32em] text-ailu-yellow sm:text-xs">
          <span className="h-px w-9 bg-ailu-yellow" /> Udupi, Karnataka · Creating Moments. Delivering Smiles.
        </p>

        <div className="relative flex flex-1 items-center justify-center py-4">
          <motion.div aria-hidden className="absolute inset-y-[-8%] right-[-2%] w-[76%] sm:right-[-4%] sm:w-[65%] lg:right-[-25%] lg:w-[60%]" initial={false} animate={reduceMotion ? undefined : { y: [0, -13, 0], rotate: [0, 1.5, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
            <Image src={BRAND.hand} alt="" fill sizes="(min-width: 1024px) 60vw, 76vw" className="object-contain opacity-65 drop-shadow-[0_20px_55px_rgba(245,196,0,.2)]" priority />
          </motion.div>
          <div className="relative z-10 w-full pb-8 pt-10 sm:pb-12 lg:pb-4">
            <h1 className="font-display text-[clamp(3rem,9vw,8.5rem)] font-extrabold leading-[.82] tracking-[-.08em]">
              <span className="block">Come in<span className="text-ailu-yellow">.</span></span>
              <span className="ml-[10vw] mt-4 block text-ailu-cream/90 sm:ml-[18vw]">Feel what</span>
              <span className="ml-[3vw] mt-4 block italic text-ailu-yellow">a day can be.</span>
            </h1>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-ailu-cream/75 sm:ml-[18vw] sm:text-base">A gathering, a tradition, a reason to bring everyone close. Tell us what you’re dreaming up.</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 sm:ml-[18vw]">
              <Link href="/events#enquire" className="group inline-flex min-h-12 items-center gap-3 border-b border-ailu-yellow pb-1 font-semibold text-ailu-yellow transition-colors hover:text-ailu-cream">Bring us your idea <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span></Link>
              <Link href="/join" className="inline-flex min-h-12 items-center text-sm font-medium text-ailu-cream/75 transition-colors hover:text-ailu-yellow">Come create with us</Link>
            </div>
          </div>
        </div>

        <a href="#celebration-world" className="relative z-10 flex min-h-10 items-center gap-3 self-start text-[10px] font-semibold uppercase tracking-[.28em] text-ailu-cream/55 transition-colors hover:text-ailu-yellow">
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full border border-ailu-yellow/45 text-ailu-yellow">↓</span> Let the feeling take you
        </a>
      </div>
    </section>
  );
}
