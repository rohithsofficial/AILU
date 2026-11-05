"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND } from "@/lib/brand";
import { useContent } from "@/components/ContentProvider";

// Optional, digits only with country code (91XXXXXXXXXX). Falls back to the number in lib/brand.ts.
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export default function ComingSoon() {
  const reduce = useReducedMotion();
  const { comingSoon: copy, settings } = useContent();
  const WHATSAPP_LINK = WHATSAPP ? `https://wa.me/${WHATSAPP}` : settings.whatsapp;

  // One orchestrated moment: hand appears, then logo takes its place,
  // then the words arrive. Everything else stays still.
  const t = (delay: number, duration = 0.9) =>
    reduce ? { duration: 0 } : { delay, duration, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <main
      className={`font-body relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[#111111] px-6 text-center text-[#FFFDF7]`}
    >
      {/* Warm glow behind the mark */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[34%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(245,196,0,0.28), rgba(245,196,0,0.06) 60%, transparent 100%)",
        }}
      />

      {/* Mark: hand first, then the full logo in the same spot */}
      <div className="relative z-10 h-40 w-64 sm:h-52 sm:w-80">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 1.08] }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 2.4, times: [0, 0.3, 0.75, 1], ease: "easeInOut" }
          }
        >
          <Image
            src="/brand/ailu-hand.png"
            alt=""
            fill
            priority
            className="object-contain"
            sizes="320px"
          />
        </motion.div>

        <motion.div
          className="absolute inset-0"
          initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={t(2.0, 1.1)}
        >
          <Image
            src="/brand/ailu-logo.png"
            alt="AILU"
            fill
            priority
            className="object-contain"
            sizes="320px"
          />
        </motion.div>
      </div>

      <motion.h1
        className={`font-display relative z-10 mt-10 max-w-[18ch] text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl`}
        initial={{ opacity: 0, y: reduce ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(2.9)}
      >
        {copy.title}
      </motion.h1>

      <motion.p
        className="relative z-10 mt-5 max-w-[46ch] text-pretty text-base leading-relaxed text-[#FFFDF7]/75 sm:text-lg"
        initial={{ opacity: 0, y: reduce ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(3.1)}
      >
        {copy.text}
      </motion.p>

      <motion.div
        className="relative z-10 mt-9 flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={t(3.3, 0.8)}
      >
        {(
          <a
            href={`${WHATSAPP_LINK}?text=${encodeURIComponent(
              "Hi AILU, I'd like to plan an event."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-display rounded-full bg-[#F5C400] px-8 py-3.5 text-base font-semibold text-[#111111] transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C400]`}
          >
            {copy.button}
          </a>
        )}

        <p className={`font-display text-sm font-medium text-[#F5C400]`}>
          {copy.tagline}
        </p>
      </motion.div>
    </main>
  );
}