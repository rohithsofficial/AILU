"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BRAND } from "@/lib/brand";
import { SITE_CONTENT } from "@/content/site";
import { useContent } from "@/components/ContentProvider";
const KEY = "ailu-intro-seen";
const { toWorld, toSite } = SITE_CONTENT.switch;

const setLogo = (v: "pending" | "ready") => { document.documentElement.dataset.logo = v; };

// steps: 0 hand alone, 1 welcome, 2 the AILU feeling, 3 choose a path
export default function Intro() {
  const { intro: t, settings } = useContent();
  const router = useRouter();
  const skipRef = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<"pending" | "playing" | "done">("pending");
  const [step, setStep] = useState(0);
  const [reduced, setReduced] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(KEY)) { setLogo("ready"); setPhase("done"); return; }
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(rm);
    setLogo("pending");
    setPhase("playing");
    if (rm) { setStep(3); return; }
    // Each line stays long enough to read. Visitors can skip at any time.
    timers.current = [setTimeout(() => setStep(1), 900), setTimeout(() => setStep(2), 3400), setTimeout(() => setStep(3), 7400)];
    // If the visitor leaves mid-intro, never leave the navbar logo and WhatsApp button hidden.
    return () => { timers.current.forEach(clearTimeout); setLogo("ready"); };
  }, []);

  useEffect(() => { document.body.style.overflow = phase === "done" ? "" : "hidden"; return () => { document.body.style.overflow = ""; }; }, [phase]);
  useEffect(() => {
    if (phase === "playing") skipRef.current?.focus();
    if (phase === "done") document.getElementById("main-content")?.focus();
  }, [phase]);

  const finishNow = () => { sessionStorage.setItem(KEY, "1"); setLogo("ready"); setPhase("done"); };

  // "Skip intro" and "Enter AILU World" fade the intro away to show the world behind it.
  function enterWorld() {
    timers.current.forEach(clearTimeout);
    if (reduced) return finishNow();
    setLeaving(true);
  }

  function goToNormalSite() {
    timers.current.forEach(clearTimeout);
    finishNow();
    router.push(toSite.href);
  }

  if (phase !== "playing") return null;
  return (
    <motion.div id="ailu-intro" className={`fixed inset-0 z-50 ${leaving ? "pointer-events-none" : ""}`} animate={{ opacity: leaving ? 0 : 1 }} transition={{ duration: 0.4 }} onAnimationComplete={() => { if (leaving) finishNow(); }} role="dialog" aria-modal="true" aria-label="Welcome to AILU">
      <div className="absolute inset-0 bg-ailu-black" />
      <div className="relative flex h-full flex-col items-center overflow-y-auto px-4 py-8 text-ailu-cream">
          <button ref={skipRef} onClick={enterWorld} className="absolute right-4 top-4 z-10 min-h-11 rounded-full border border-white/50 px-4 py-2 text-sm">{t.skipButton}</button>
          <div className="my-auto flex w-full max-w-lg flex-col items-center">
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0 : 1.6, ease: "easeOut" }}>
              <div className={`relative aspect-[4/3] transition-[width] duration-700 ${step >= 3 ? "w-36" : "w-[min(72vw,320px)]"}`}>
                <div className="absolute inset-0 rounded-full bg-ailu-yellow/25 blur-3xl" aria-hidden />
                <motion.div className="absolute inset-0" animate={reduced ? {} : { y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                  <Image src={BRAND.hand} alt="AILU hand symbol" fill sizes="320px" className="object-contain" priority />
                </motion.div>
              </div>
            </motion.div>

            <div className="mt-4 min-h-[5rem] text-center">
              {step === 1 && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold">{t.welcome}</motion.p>}
              {step === 2 && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-2xl font-semibold leading-snug text-ailu-cream/90 sm:text-3xl">{t.feeling}<br /><span className="mt-3 inline-block text-base font-normal text-ailu-yellow sm:text-lg">{settings.tagline}</span></motion.p>}
            </div>

            {step >= 3 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">{t.question}</h2>
                <p className="mt-2 text-center text-sm text-ailu-cream/65">{t.questionText}</p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <button onClick={enterWorld} className="min-h-14 rounded-full bg-ailu-yellow px-7 font-semibold text-ailu-black transition hover:-translate-y-1">{toWorld.label}</button>
                  <button onClick={goToNormalSite} className="min-h-14 rounded-full border border-ailu-yellow px-7 font-semibold text-ailu-yellow transition hover:bg-ailu-yellow/10">{toSite.label}</button>
                </div>
              </motion.div>
            )}
          </div>
      </div>
    </motion.div>
  );
}
