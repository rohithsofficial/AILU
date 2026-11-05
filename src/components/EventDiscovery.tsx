"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { EVENT_CATEGORIES } from "@/lib/events";

const entrances = [
  { x: -50, y: 0, rotate: -2 },
  { x: 50, y: 0, rotate: 2 },
  { x: 0, y: 50, rotate: 0 },
  { x: -30, y: 35, rotate: -3 },
  { x: 35, y: -30, rotate: 3 },
  { x: 0, y: -45, rotate: 0 },
  { x: 45, y: 35, rotate: 2 },
];

export default function EventDiscovery() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const category = EVENT_CATEGORIES[active];
  const entrance = entrances[active];

  return (
    <section aria-labelledby="discovery-title" className="relative overflow-hidden bg-ailu-black px-6 pb-20 pt-16 text-ailu-cream sm:px-12 sm:pb-28 sm:pt-24">
      <span aria-hidden className="pointer-events-none absolute right-[8%] top-[16%] font-display text-7xl text-ailu-yellow/15 sm:text-9xl">✳</span>
      <div className="relative mx-auto max-w-[1400px]">
        <p className="text-[10px] font-semibold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">Follow what moves you</p>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div>
            <h1 id="discovery-title" className="max-w-[12ch] font-display text-[clamp(2.8rem,6.5vw,5rem)] font-semibold leading-[.92] tracking-[-.06em]">There’s a reason to gather.</h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-ailu-cream/65 sm:text-base">Choose a celebration to see what AILU can help shape, then take that idea to the team.</p>
            <p className="mt-3 max-w-xl text-xs leading-relaxed text-ailu-cream/45 sm:text-sm">This page currently explores celebration types. A public calendar of dated events and event registration are not connected yet.</p>
          </div>
          <div aria-live="polite" className="relative hidden min-h-[270px] border-l border-ailu-yellow/45 pl-6 sm:min-h-[300px] sm:pl-9 lg:block lg:border-l-0 lg:border-t lg:pl-0 lg:pt-6">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={reduceMotion ? { opacity: 0 } : { ...entrance, opacity: 0 }} animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: reduceMotion ? 0 : .45, ease: [0.22, 1, .36, 1] }}>
                <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-ailu-yellow/70">{category.services.slice(0, 2).join(" · ")}</p>
                <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[.98] tracking-[-.05em]">{category.title}</h2>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-ailu-cream/65 sm:text-base">{category.blurb}</p>
                <Link href={`/events/${category.slug}`} className="group mt-5 inline-flex min-h-11 items-center gap-3 border-b border-ailu-yellow/60 pb-1 text-sm font-semibold text-ailu-yellow">Explore this celebration <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span></Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-14 border-y border-white/20 py-6 sm:mt-20 sm:py-8">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-ailu-yellow">Choose a celebration <span className="mt-1 block font-medium normal-case tracking-normal text-ailu-cream/65 sm:ml-2 sm:mt-0 sm:inline">Tap one to open it</span></p>
          <ul className="flex flex-wrap gap-2.5 sm:gap-3">
            {EVENT_CATEGORIES.map((item, index) => <li key={item.slug}>
              <Link href={`/events/${item.slug}`} onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} className={`inline-flex min-h-12 items-center rounded-full border px-4 py-2.5 text-left text-sm font-semibold transition-colors sm:px-5 sm:text-base ${active === index ? "border-white/25 bg-white/5 text-ailu-cream/85 lg:border-ailu-yellow lg:bg-ailu-yellow lg:text-ailu-black" : "border-white/25 bg-white/5 text-ailu-cream/85 hover:border-ailu-yellow/70 hover:bg-white/10 hover:text-ailu-cream"}`}>{item.title}</Link>
            </li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
