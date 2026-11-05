"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BRAND } from "@/lib/brand";
import { SITE_CONTENT } from "@/content/site";
import { useContent } from "@/components/ContentProvider";
import { ENTER_WORLD_EVENT, INTRO_SEEN_KEY as KEY, INTRO_STEPS_MS } from "@/lib/worldStart";
const { toSite } = SITE_CONTENT.switch;

const setLogo = (v: "pending" | "ready") => { document.documentElement.dataset.logo = v; };

// steps: 0 hand alone, 1 welcome, 2 the AILU feeling, 3 choose a path.
// Every animation here is plain CSS on opacity and transform, and nothing changes size, so it stays smooth on phones.
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
    timers.current = INTRO_STEPS_MS.map((ms, index) => setTimeout(() => setStep(index + 1), ms));
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
    const done = () => { finishNow(); window.dispatchEvent(new Event(ENTER_WORLD_EVENT)); };
    if (reduced) return done();
    setLeaving(true);
    timers.current = [setTimeout(done, 320)];
  }

  function goToWebsite() {
    timers.current.forEach(clearTimeout);
    finishNow();
    router.push(toSite.href);
  }

  if (phase !== "playing") return null;
  return (
    <div id="ailu-intro" className={`fixed inset-0 z-50 bg-ailu-black transition-opacity duration-300 ${leaving ? "pointer-events-none opacity-0" : ""}`} role="dialog" aria-modal="true" aria-label="Welcome to AILU">
      <div className="relative flex h-full flex-col items-center overflow-y-auto px-4 py-8 text-ailu-cream">
        <button ref={skipRef} onClick={enterWorld} className="absolute right-4 top-4 z-10 min-h-11 rounded-full border border-white/50 px-4 py-2 text-sm">{t.skipButton}</button>
        <div className="my-auto flex w-full max-w-lg flex-col items-center">
          <div className="relative aspect-[4/3] w-[min(56vw,240px)] bg-[radial-gradient(closest-side,rgba(245,196,0,.22),transparent)]">
            <div className="intro-float absolute inset-0"><Image src={BRAND.hand} alt="AILU hand symbol" fill sizes="240px" className="object-contain" priority /></div>
          </div>

          <div className="mt-5 min-h-[15rem] w-full text-center">
            {step === 1 && <p key="welcome" className="intro-rise font-display text-3xl font-bold">{t.welcome}</p>}
            {step === 2 && <p key="feeling" className="intro-rise font-display text-2xl font-semibold leading-snug text-ailu-cream/90 sm:text-3xl">{t.feeling}<br /><span className="mt-3 inline-block text-base font-normal text-ailu-yellow sm:text-lg">{settings.tagline}</span></p>}
            {step >= 3 && <div key="choose" className="intro-rise">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">{t.question}</h2>
              <p className="mt-2 text-sm text-ailu-cream/65">{t.questionText}</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button onClick={enterWorld} className="min-h-14 rounded-full bg-ailu-yellow px-7 font-semibold text-ailu-black transition hover:-translate-y-1">{t.worldButton}</button>
                <button onClick={goToWebsite} className="min-h-14 rounded-full border border-ailu-yellow px-7 font-semibold text-ailu-yellow transition hover:bg-ailu-yellow/10">{t.websiteButton}</button>
              </div>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}
