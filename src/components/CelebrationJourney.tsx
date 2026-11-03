"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { EVENT_CATEGORIES } from "@/lib/events";

const chapters = [
  { kind: "event", slug: "personal-celebrations", cue: "A room full of your people", line: "The ones who make it yours." },
  { kind: "event", slug: "wedding-celebrations", cue: "A promise, held together", line: "One day. So many beginnings." },
  { kind: "event", slug: "cultural-regional-celebrations", cue: "Every tradition has a rhythm", line: "Keep the rituals. Turn up the feeling." },
  { kind: "join", cue: "There’s a place in this story for you", line: "Bring your talent. Or bring people together." },
  { kind: "event", slug: "community-cultural-events", cue: "When everyone comes together", line: "Make a whole crowd feel close." },
].map((chapter) => ({ ...chapter, category: chapter.slug ? EVENT_CATEGORIES.find((category) => category.slug === chapter.slug) : undefined }));

const scenes = [
  { surface: "bg-ailu-black text-ailu-cream", pattern: "conic-gradient(from 30deg at 78% 42%, transparent 0 18deg, rgba(245,196,0,.12) 19deg 20deg, transparent 21deg 38deg, rgba(245,196,0,.08) 39deg 40deg, transparent 41deg 60deg)" },
  { surface: "bg-ailu-cream text-ailu-black", pattern: "repeating-linear-gradient(132deg, transparent 0 42px, rgba(17,17,17,.045) 43px 44px, transparent 45px 88px)" },
  { surface: "bg-ailu-black text-ailu-cream", pattern: "radial-gradient(circle, rgba(245,196,0,.18) 1px, transparent 2px)" },
  { surface: "bg-ailu-yellow text-ailu-black", pattern: "repeating-linear-gradient(90deg, transparent 0 12vw, rgba(17,17,17,.055) 12.1vw 12.2vw, transparent 12.3vw 24vw)" },
  { surface: "bg-ailu-cream text-ailu-black", pattern: "radial-gradient(ellipse at 8% 88%, rgba(245,196,0,.23), transparent 43%), repeating-linear-gradient(160deg, transparent 0 64px, rgba(17,17,17,.035) 65px 66px, transparent 67px 130px)" },
];

const entrances = [
  { from: { x: -90, y: 18, rotate: -5 }, exit: { x: 100, y: -25, rotate: 3 } },
  { from: { x: 40, y: 90, rotate: 4 }, exit: { x: -30, y: -100, rotate: -4 } },
  { from: { x: 0, y: 100, scale: .86 }, exit: { x: 0, y: -80, scale: 1.1 } },
  { from: { x: 100, y: 0, rotate: 7 }, exit: { x: -100, y: 20, rotate: -7 } },
  { from: { x: -80, y: -50, scale: 1.08 }, exit: { x: 70, y: 60, scale: .9 } },
];

export default function CelebrationJourney() {
  const journey = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: journey, offset: ["start start", "end end"] });
  const drift = useTransform(scrollYProgress, [0, .2, .4, .6, .8, 1], [0, 72, -64, 90, -80, 0]);
  const scene = scenes[active];
  const chapter = chapters[active];
  const entrance = entrances[active];

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = Math.min(chapters.length - 1, Math.floor(progress * chapters.length));
    setActive((current) => {
      const hysteresis = 0.02;
      if (next > current && progress >= (current + 1) / chapters.length + hysteresis) return next;
      if (next < current && progress <= current / chapters.length - hysteresis) return next;
      return current;
    });
  });

  return (
    <section id="celebration-world" ref={journey} className="relative h-[360svh]" aria-label="Explore celebrations and ways to join AILU">
      <div className={`sticky top-16 flex h-[calc(100svh-4rem)] min-h-[min(560px,calc(100svh-4rem))] overflow-hidden transition-colors duration-700 ${scene.surface}`}>
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-80" style={{ backgroundImage: scene.pattern, backgroundSize: active === 2 ? "28px 28px" : undefined }} />
        <motion.div aria-hidden className="pointer-events-none absolute inset-y-0 right-[12%] w-px bg-current/10" style={{ x: reduceMotion ? 0 : drift }} />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] items-center px-7 pb-14 pt-8 sm:px-12 lg:px-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className={`w-full ${active === 1 ? "ml-auto max-w-4xl text-right" : active === 2 ? "mx-auto max-w-5xl text-center" : active === 3 ? "mx-auto max-w-4xl text-center" : "max-w-5xl text-left"}`}
              initial={reduceMotion ? { opacity: 0 } : { ...entrance.from, opacity: 0 }}
              animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { ...entrance.exit, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : .46, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[.3em] opacity-65 sm:text-xs">{chapter.cue}</p>
              {chapter.category ? <>
                <h2 className="mt-5 font-display text-[clamp(3.2rem,10.7vw,10rem)] font-extrabold leading-[.86] tracking-[-.085em]">{chapter.category.title}</h2>
                <p className="mt-6 max-w-xl text-base leading-relaxed opacity-75 sm:text-xl">{chapter.line} {chapter.category.blurb}</p>
                <Link href={`/events/${chapter.category.slug}`} className="group mt-7 inline-flex min-h-11 items-center gap-3 border-b border-current/60 pb-1 text-sm font-semibold">Step into this celebration <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span></Link>
              </> : <>
                <h2 className="mt-5 font-display text-[clamp(3.2rem,10.7vw,10rem)] font-extrabold leading-[.86] tracking-[-.085em]">Not just a guest.<br /><span className="text-ailu-black/65">Part of the making.</span></h2>
                <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed opacity-75 sm:text-xl">{chapter.line} Join the team or become an external sales partner. Different paths, one shared love of bringing people together.</p>
                <Link href="/join" className="group mt-7 inline-flex min-h-11 items-center gap-3 border-b border-current/60 pb-1 text-sm font-semibold">Find your way in <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span></Link>
              </>}
            </motion.div>
          </AnimatePresence>
        </div>
        <div aria-hidden className={`absolute bottom-7 left-7 z-20 text-[9px] font-semibold uppercase tracking-[.3em] opacity-50 sm:left-12 lg:left-24 ${active === 3 ? "text-ailu-black" : ""}`}>Keep wandering <span className="ml-2">↓</span></div>
        <Link href="/events#enquire" className={`absolute bottom-6 right-7 z-20 inline-flex min-h-11 items-center gap-2 border-b border-current/50 text-xs font-semibold sm:right-12 lg:right-24 ${active === 3 ? "text-ailu-black" : ""}`}>Start an enquiry <span aria-hidden>↗</span></Link>
      </div>
    </section>
  );
}
