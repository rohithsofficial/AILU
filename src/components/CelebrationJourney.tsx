"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EVENT_CATEGORIES } from "@/lib/events";
import { canUse3D } from "@/lib/device";

const CelebrationWorldScene = dynamic(() => import("@/components/CelebrationWorldScene"), { ssr: false });

const chapters = [
  { kind: "event", slug: "personal-celebrations", label: "Personal", cue: "A room full of your people", line: "The ones who make it yours." },
  { kind: "event", slug: "wedding-celebrations", label: "Wedding", cue: "A promise, held together", line: "One day. So many beginnings." },
  { kind: "event", slug: "cultural-regional-celebrations", label: "Culture", cue: "Every tradition has a rhythm", line: "Keep the rituals. Turn up the feeling." },
  { kind: "join", label: "Join AILU", cue: "There’s a place in this story for you", line: "Bring your talent. Or bring people together." },
  { kind: "event", slug: "community-cultural-events", label: "Community", cue: "When everyone comes together", line: "Make a whole crowd feel close." },
].map((chapter) => ({ ...chapter, category: chapter.slug ? EVENT_CATEGORIES.find((category) => category.slug === chapter.slug) : undefined }));

const scenes = [
  { surface: "bg-ailu-black text-ailu-cream", pattern: "conic-gradient(from 30deg at 78% 42%, transparent 0 18deg, rgba(245,196,0,.12) 19deg 20deg, transparent 21deg 38deg, rgba(245,196,0,.08) 39deg 40deg, transparent 41deg 60deg)" },
  { surface: "bg-ailu-black text-ailu-cream", pattern: "repeating-linear-gradient(132deg, transparent 0 42px, rgba(255,253,247,.045) 43px 44px, transparent 45px 88px)" },
  { surface: "bg-ailu-black text-ailu-cream", pattern: "radial-gradient(circle, rgba(245,196,0,.18) 1px, transparent 2px)" },
  { surface: "bg-ailu-black text-ailu-cream", pattern: "repeating-linear-gradient(90deg, transparent 0 12vw, rgba(245,196,0,.055) 12.1vw 12.2vw, transparent 12.3vw 24vw)" },
  { surface: "bg-ailu-black text-ailu-cream", pattern: "radial-gradient(ellipse at 8% 88%, rgba(245,196,0,.16), transparent 43%), repeating-linear-gradient(160deg, transparent 0 64px, rgba(255,253,247,.035) 65px 66px, transparent 67px 130px)" },
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
  const [showWorld, setShowWorld] = useState(false);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: journey, offset: ["start start", "end end"] });
  const drift = useTransform(scrollYProgress, [0, .2, .4, .6, .8, 1], [0, 72, -64, 90, -80, 0]);
  const scene = scenes[active];
  const chapter = chapters[active];
  const entrance = entrances[active];

  useEffect(() => {
    // Phones skip the 3D scene: it ran behind the text and made it hard to read.
    setShowWorld(window.matchMedia("(min-width: 1024px)").matches && canUse3D());
  }, []);

  function goToChapter(index: number) {
    const element = journey.current;
    if (!element) return;
    const scrollDistance = Math.max(0, element.offsetHeight - window.innerHeight);
    const target = element.offsetTop + scrollDistance * (index / (chapters.length - 1));
    window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
  }

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
        {showWorld && <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-0 w-full opacity-55 sm:w-[82%] sm:opacity-70">
          <CelebrationWorldScene chapter={active} />
          <div className="absolute inset-y-0 left-0 w-[65%] bg-gradient-to-r from-ailu-black via-ailu-black/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ailu-black to-transparent" />
        </div>}
        <motion.div aria-hidden className="pointer-events-none absolute inset-y-0 right-[12%] w-px bg-current/10" style={{ x: reduceMotion ? 0 : drift }} />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] items-center px-7 pb-14 pt-8 sm:px-12 lg:px-24">
          <nav aria-label="Places in the AILU story" className="absolute right-6 top-6 z-20 flex items-center gap-1.5 sm:right-10 sm:top-8 sm:gap-2">
            {chapters.map((item, index) => <button key={item.label} type="button" aria-label={`Go to ${item.label} chapter`} aria-pressed={active === index} onClick={() => goToChapter(index)} className="group inline-flex min-h-10 min-w-8 items-center justify-center rounded-full px-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ailu-yellow sm:min-w-10">
              <span className={`h-1.5 rounded-full transition-all ${active === index ? "w-6 bg-ailu-yellow" : "w-1.5 bg-ailu-cream/35 group-hover:bg-ailu-cream/70"}`} />
              <span className="sr-only">{item.label}</span>
            </button>)}
          </nav>
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
                <h2 className="mt-5 font-display text-[clamp(2.8rem,7vw,6.5rem)] font-semibold leading-[.9] tracking-[-.07em]">{chapter.category.title}</h2>
                <p className="mt-6 max-w-xl text-base leading-relaxed opacity-75 sm:text-xl">{chapter.line} {chapter.category.blurb}</p>
                <Link href={`/events/${chapter.category.slug}`} className="group mt-7 inline-flex min-h-11 items-center gap-3 border-b border-current/60 pb-1 text-sm font-semibold">Step into this celebration <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span></Link>
              </> : <>
                <h2 className="mt-5 font-display text-[clamp(2.8rem,7vw,6.5rem)] font-semibold leading-[.9] tracking-[-.07em]">Not just a guest.<br /><span className="text-ailu-yellow">Part of the making.</span></h2>
                <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed opacity-75 sm:text-xl">{chapter.line} Join the team or become an external sales partner. Different paths, one shared love of bringing people together.</p>
                <Link href="/join" className="group mt-7 inline-flex min-h-11 items-center gap-3 border-b border-current/60 pb-1 text-sm font-semibold">Find your way in <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span></Link>
              </>}
            </motion.div>
          </AnimatePresence>
        </div>
        <div aria-hidden className="absolute bottom-7 left-7 z-20 text-[9px] font-semibold uppercase tracking-[.3em] text-ailu-cream/50 sm:left-12 lg:left-24">Keep wandering <span className="ml-2 text-ailu-yellow">↓</span></div>
        <Link href="/events#enquire" className="absolute bottom-6 right-7 z-20 inline-flex min-h-11 items-center gap-2 border-b border-white/30 text-xs font-semibold sm:right-12 lg:right-24">Start an enquiry <span aria-hidden className="text-ailu-yellow">↗</span></Link>
      </div>
    </section>
  );
}
