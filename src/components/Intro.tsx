"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";

const HandScene = dynamic(() => import("./HandScene"), { ssr: false });
const KEY = "ailu-intro-seen";
const LETTERS = ["A", "I", "L", "U"];
const LINES = ["HI, WELCOME TO AILU", BRAND.tagline, "Every celebration begins with a feeling."];

function canUse3D() {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    return !!gl && navigator.hardwareConcurrency > 4 && mem > 2;
  } catch { return false; }
}

export default function Intro() {
  const [phase, setPhase] = useState<"pending" | "playing" | "done">("pending");
  const [step, setStep] = useState(0); // 0 hand, 1 letters, 2.. lines, 5 choices
  const [reduced, setReduced] = useState(false);
  const [use3D, setUse3D] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(KEY)) { setPhase("done"); return; }
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(rm);
    setUse3D(!rm && canUse3D());
    setPhase("playing");
    if (rm) { setStep(5); return; }
    const t = [setTimeout(() => setStep(1), 2200), setTimeout(() => setStep(2), 3800), setTimeout(() => setStep(3), 5400), setTimeout(() => setStep(4), 7000), setTimeout(() => setStep(5), 8400)];
    return () => t.forEach(clearTimeout);
  }, []);

  useEffect(() => { document.body.style.overflow = phase === "done" ? "" : "hidden"; return () => { document.body.style.overflow = ""; }; }, [phase]);

  const finish = () => { sessionStorage.setItem(KEY, "1"); setPhase("done"); };

  if (phase === "done") return null;
  return (
    <AnimatePresence>
      <motion.div key="intro" className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ailu-black text-ailu-cream" exit={{ opacity: 0 }} transition={{ duration: 0.5 }} role="dialog" aria-label="AILU welcome">
        {phase === "playing" && (
          <>
            <button onClick={finish} className="absolute right-4 top-4 rounded-full border border-white/30 px-4 py-2 text-sm">Skip intro</button>
            <motion.div className="relative h-56 w-56 sm:h-72 sm:w-72" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0 : 1.6, ease: "easeOut" }}>
              <div className="absolute inset-0 rounded-full bg-ailu-yellow/20 blur-3xl" aria-hidden />
              {use3D ? <HandScene /> : <Image src={BRAND.hand} alt="AILU hand symbol" fill unoptimized className="object-contain" priority />}
            </motion.div>
            <div className="mt-4 flex gap-3 font-display text-6xl font-extrabold text-ailu-yellow sm:text-7xl" aria-label="AILU">
              {LETTERS.map((l, i) => (
                <motion.span key={l} aria-hidden initial={{ opacity: 0, y: 24 }} animate={step >= 1 ? { opacity: 1, y: 0 } : {}} transition={{ delay: reduced ? 0 : i * 0.18, duration: reduced ? 0 : 0.6 }}>{l}</motion.span>
              ))}
            </div>
            <div className="mt-6 h-16 px-6 text-center">
              {LINES.map((line, i) => step === i + 2 && (<motion.p key={line} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={i === 0 ? "font-display text-xl font-bold sm:text-2xl" : "text-lg text-ailu-cream/80"}>{line}</motion.p>))}
            </div>
            <motion.div className="mt-4 flex flex-col gap-3 sm:flex-row" initial={{ opacity: 0 }} animate={step >= 5 ? { opacity: 1 } : {}} style={{ pointerEvents: step >= 5 ? "auto" : "none" }}>
              <button onClick={finish} className="rounded-full bg-ailu-yellow px-7 py-3 font-semibold text-ailu-black">Explore AILU</button>
              <Link href="/my-ailu" onClick={finish} className="rounded-full border border-ailu-yellow px-7 py-3 text-center font-semibold text-ailu-yellow">Enter your AILU world</Link>
            </motion.div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
