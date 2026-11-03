"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BRAND } from "@/lib/brand";
import { canUse3D } from "@/lib/device";

const HandScene = dynamic(() => import("./HandScene"), { ssr: false });
const KEY = "ailu-intro-seen";
const PROFILE_KEY = "ailu-visitor";
const WHO = ["Planning a celebration", "A company or organisation", "Part of a community or college", "A performer or creator", "Just exploring"];
const HAND_FILL = 0.76; // the standalone hand artwork fills about 76% of its image box

type Box = { l: number; t: number; w: number; h: number };
const setLogo = (v: "pending" | "ready") => { document.documentElement.dataset.logo = v; };

// steps: 0 hand alone, 1 welcome, 2 what we do, 3 about you + choices
export default function Intro() {
  const router = useRouter();
  const handRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"pending" | "playing" | "done">("pending");
  const [step, setStep] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [use3D, setUse3D] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [who, setWho] = useState(WHO[0]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [flight, setFlight] = useState<{ from: Box; to: Box } | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(KEY)) { setLogo("ready"); setPhase("done"); return; }
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(rm);
    setUse3D(canUse3D());
    setLogo("pending");
    setPhase("playing");
    if (rm) { setStep(3); return; }
    timers.current = [setTimeout(() => setStep(1), 3000), setTimeout(() => setStep(2), 5200), setTimeout(() => setStep(3), 7600)];
    return () => timers.current.forEach(clearTimeout);
  }, []);

  useEffect(() => { document.body.style.overflow = phase === "done" ? "" : "hidden"; return () => { document.body.style.overflow = ""; }; }, [phase]);

  const finishNow = () => { sessionStorage.setItem(KEY, "1"); setLogo("ready"); setPhase("done"); };

  // Used by both the two entrance buttons and "Skip intro": the hand leaves the centre and lands on the logo.
  function startFlight() {
    if (flight) return;
    timers.current.forEach(clearTimeout);
    const fromEl = handRef.current;
    const toEl = document.querySelector("[data-ailu-hand]");
    if (reduced || !fromEl || !toEl) return finishNow();
    sessionStorage.setItem(KEY, "1");
    const f = fromEl.getBoundingClientRect();
    const t = toEl.getBoundingClientRect();
    const w = t.width / HAND_FILL; // enlarge so the hand artwork itself lands on the logo's hand
    const h = w * 0.75;
    setFlight({ from: { l: f.left, t: f.top, w: f.width, h: f.height }, to: { l: t.left + t.width / 2 - w / 2, t: t.top + t.height / 2 - h / 2, w, h } });
  }

  function choose(intent: "events" | "join") {
    // Kept on this device only for now. Saving to a database needs a consent line first.
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: name.trim(), city: city.trim(), who, intent })); } catch {}
    startFlight();
    router.push(intent === "events" ? "/events" : "/join");
  }

  if (phase === "done") return null;
  const field = "mt-1 w-full rounded-lg border border-white/25 bg-white/10 px-3 py-3 text-ailu-cream placeholder:text-white/40";
  return (
    <div className={`fixed inset-0 z-50 ${flight ? "pointer-events-none" : ""}`} role="dialog" aria-label="Welcome to AILU">
      <motion.div className="absolute inset-0 bg-ailu-black" animate={{ opacity: flight ? 0 : 1 }} transition={{ duration: 1.1 }} />
      {phase === "playing" && (
        <motion.div className="relative flex h-full flex-col items-center overflow-y-auto px-4 py-8 text-ailu-cream" animate={{ opacity: flight ? 0 : 1 }} transition={{ duration: 0.35 }}>
          <button onClick={startFlight} className="absolute right-4 top-4 z-10 rounded-full border border-white/30 px-4 py-2 text-sm">Skip intro</button>
          <div className="my-auto flex w-full max-w-lg flex-col items-center">
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0 : 1.6, ease: "easeOut" }}>
              <div ref={handRef} className={`relative aspect-[4/3] transition-[width] duration-700 ${step >= 3 ? "w-36" : "w-[min(72vw,320px)]"}`}>
                <div className="absolute inset-0 rounded-full bg-ailu-yellow/25 blur-3xl" aria-hidden />
                {use3D && step < 3 ? <HandScene /> : (
                  <motion.div className="absolute inset-0" animate={reduced ? {} : { y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <Image src={BRAND.hand} alt="AILU hand symbol" fill sizes="320px" className="object-contain" priority />
                  </motion.div>
                )}
              </div>
            </motion.div>

            <div className="mt-4 min-h-[5rem] text-center">
              {step === 1 && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold">Hi, welcome to AILU.</motion.p>}
              {step === 2 && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-lg text-ailu-cream/85">We plan celebrations, open doors to opportunities, and stand beside people&apos;s dreams. {BRAND.tagline}</motion.p>}
            </div>

            {step >= 3 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                <h2 className="font-display text-xl font-bold">Tell us a little about you</h2>
                <p className="mt-1 text-sm text-ailu-cream/70">Optional. It helps us show you the right things. It stays on this device for now.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">Your name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" className={field} /></label>
                  <label className="block text-sm">City<input value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" className={field} /></label>
                  <label className="block text-sm sm:col-span-2">I am<select value={who} onChange={(e) => setWho(e.target.value)} className={field}>{WHO.map((w) => <option key={w} className="text-black">{w}</option>)}</select></label>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button onClick={() => choose("events")} className="rounded-full bg-ailu-yellow px-7 py-3 font-semibold text-ailu-black">I am looking for events</button>
                  <button onClick={() => choose("join")} className="rounded-full border border-ailu-yellow px-7 py-3 font-semibold text-ailu-yellow">I want to join AILU</button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* The hand leaves the centre of the screen and settles where the logo's hand is, then the logo wipes in */}
      {flight && (
        <motion.img
          src={BRAND.hand}
          alt=""
          className="fixed z-[60] max-w-none object-contain drop-shadow-[0_10px_30px_rgba(245,196,0,.4)]"
          initial={{ left: flight.from.l, top: flight.from.t, width: flight.from.w, height: flight.from.h }}
          animate={{ left: flight.to.l, top: flight.to.t, width: flight.to.w, height: flight.to.h }}
          transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
          onAnimationComplete={() => { setLogo("ready"); setTimeout(() => setPhase("done"), 1400); }}
        />
      )}
    </div>
  );
}
