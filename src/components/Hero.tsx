"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";
import { canUse3D } from "@/lib/device";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });
const rise = (d: number) => ({ initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] as const } });

export default function Hero() {
  const [use3D, setUse3D] = useState(false);
  useEffect(() => setUse3D(canUse3D()), []);
  return (
    <section className="relative isolate overflow-hidden bg-ailu-black text-ailu-cream">
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: "radial-gradient(55% 65% at 78% 45%, rgba(245,196,0,.30), transparent 70%), radial-gradient(40% 40% at 5% 95%, rgba(245,196,0,.12), transparent 70%)" }} />
      <div className="mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-6xl items-center gap-2 px-4 py-10 md:grid-cols-2">
        <div>
          <motion.p {...rise(0.1)} className="text-sm font-semibold uppercase tracking-[0.25em] text-ailu-yellow">Events · Opportunities · Dreams</motion.p>
          <motion.h1 {...rise(0.25)} className="mt-4 text-5xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">
            Every moment deserves something <span className="text-ailu-yellow">extraordinary.</span>
          </motion.h1>
          <motion.p {...rise(0.45)} className="mt-6 max-w-xl text-lg text-ailu-cream/75">From unforgettable celebrations to meaningful experiences, AILU brings people together through creativity, entertainment and thoughtful event planning.</motion.p>
          <motion.div {...rise(0.6)} className="mt-9 flex flex-wrap gap-3">
            <Link href="/events" className="rounded-full bg-ailu-yellow px-8 py-4 font-semibold text-ailu-black shadow-[0_0_40px_rgba(245,196,0,.35)] transition hover:scale-105">Explore events</Link>
            <Link href="/join" className="rounded-full border border-ailu-yellow/70 px-8 py-4 font-semibold text-ailu-yellow transition hover:bg-ailu-yellow/10">Join AILU</Link>
          </motion.div>
        </div>
        <div className="relative h-[300px] sm:h-[400px] md:h-[560px]" aria-hidden>
          {use3D ? <HeroScene /> : (
            <motion.div className="absolute inset-6" animate={{ y: [0, -14, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
              <Image src={BRAND.hand} alt="" fill sizes="(min-width: 768px) 560px, 90vw" className="object-contain drop-shadow-[0_20px_60px_rgba(245,196,0,.35)]" priority />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
