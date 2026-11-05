"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { BRAND } from "@/lib/brand";
import NavLogo from "./NavLogo";

const DESTINATIONS = [
  { label: "Discover", href: "/", cue: "The world of AILU", title: "Wander into the feeling.", copy: "A celebration can begin with a single idea. Find the moment that feels like yours.", scene: "discover", position: "discover" },
  { label: "Celebrations", href: "/events", cue: "Make a day mean more", title: "Gather around what matters.", copy: "Explore celebrations, traditions and the ways AILU can help bring people together.", scene: "celebrations", position: "celebrations" },
  { label: "Become part of AILU", href: "/join", cue: "Bring your spark", title: "There’s room for your kind of magic.", copy: "Join the team or help people find the celebration they have been dreaming of.", scene: "join", position: "join" },
  { label: "About AILU", href: "/about", cue: "What brings us together", title: "Creating moments. Delivering smiles.", copy: "Meet the people and purpose behind a world built around celebration, opportunity and care.", scene: "about", position: "about" },
] as const;

const sceneMotion = {
  discover: { initial: { scale: 0.92, rotate: -2, opacity: 0 }, animate: { scale: 1, rotate: 0, opacity: 1 } },
  celebrations: { initial: { x: 48, y: 22, opacity: 0 }, animate: { x: 0, y: 0, opacity: 1 } },
  join: { initial: { x: -38, y: -18, rotate: 1.5, opacity: 0 }, animate: { x: 0, y: 0, rotate: 0, opacity: 1 } },
  about: { initial: { y: 30, scale: 1.04, opacity: 0 }, animate: { y: 0, scale: 1, opacity: 1 } },
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [compact, setCompact] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    const focusable = () => panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [];
    requestAnimationFrame(() => focusable()[0]?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  if (pathname === "/coming-soon") return null;
  const destination = DESTINATIONS[active];
  const variants = sceneMotion[destination.scene];

  function handleDestinationKey(event: ReactKeyboardEvent<HTMLAnchorElement>, index: number) {
    if (event.key === "Enter" || event.key === " ") setActive(index);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ailu-black text-ailu-cream">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3" aria-label="Main">
          <Link href="/" aria-label="AILU home" data-ailu-logo className="block"><NavLogo compact={compact} /></Link>
          <div className="hidden items-center gap-6 text-sm text-ailu-cream/65 lg:flex">
            {[{ href: "/events", label: "Events" }, { href: "/join", label: "Join" }, { href: "/dreams", label: "Dream support" }, { href: "/about", label: "About" }].map((item) => <Link key={item.href} href={item.href} className="min-h-10 inline-flex items-center transition-colors hover:text-ailu-yellow">{item.label}</Link>)}
          </div>
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={open}
            aria-controls="celebration-portal"
            aria-label={open ? "Close the AILU celebration world" : "Explore the AILU celebration world"}
            onClick={() => setOpen((value) => !value)}
            className="group inline-flex min-h-12 items-center gap-2 rounded-full border border-ailu-yellow/50 px-3 py-1.5 text-sm font-semibold text-ailu-cream transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ailu-yellow sm:gap-3 sm:px-5"
          >
            <span className="relative block h-8 w-10 overflow-hidden">
              <Image src={BRAND.hand} alt="" fill sizes="40px" className="object-contain transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
            </span>
            <span>{open ? "Return" : "Explore AILU"}</span>
            <span aria-hidden className="text-ailu-yellow">{open ? "×" : "↗"}</span>
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="celebration-portal"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Explore the AILU celebration world"
            data-scene={destination.scene}
            className="fixed inset-0 z-[70] overflow-y-auto bg-ailu-black text-ailu-cream"
            initial={reduceMotion ? { opacity: 0 } : { clipPath: "circle(0% at calc(100% - 90px) 32px)", opacity: 0.85 }}
            animate={{ clipPath: "circle(150% at calc(100% - 90px) 32px)", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { clipPath: "circle(0% at calc(100% - 90px) 32px)", opacity: 0.9 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.62, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              key={`${destination.scene}-atmosphere`}
              aria-hidden
              className="pointer-events-none fixed inset-0 transition-colors duration-700"
              style={{ background: destination.scene === "celebrations"
                ? "radial-gradient(ellipse at 74% 48%, rgba(245,196,0,.20), transparent 28%), conic-gradient(from 25deg at 72% 48%, transparent 0 36deg, rgba(245,196,0,.08) 37deg 38deg, transparent 39deg 80deg)"
                : destination.scene === "join"
                  ? "radial-gradient(ellipse at 69% 54%, rgba(245,196,0,.16), transparent 32%), repeating-linear-gradient(132deg, transparent 0 11vw, rgba(255,253,247,.035) 11.1vw 11.2vw, transparent 11.3vw 22vw)"
                  : destination.scene === "about"
                    ? "radial-gradient(circle at 72% 45%, rgba(245,196,0,.16) 0 1px, transparent 2px), radial-gradient(ellipse at 74% 48%, rgba(245,196,0,.14), transparent 38%)"
                    : "radial-gradient(ellipse at 68% 52%, rgba(245,196,0,.20), transparent 35%), radial-gradient(ellipse at 8% 90%, rgba(245,196,0,.08), transparent 40%)" }}
            />
            <div className="relative mx-auto flex min-h-full max-w-[1600px] flex-col px-6 pb-8 pt-6 sm:px-10 sm:pb-10 lg:px-16 lg:pt-8">
              <div className="flex items-center justify-between">
                <Link href="/" aria-label="AILU home" onClick={() => setOpen(false)} className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-ailu-yellow"><NavLogo compact={false} /></Link>
                <button type="button" onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center gap-3 rounded-full border border-white/30 px-4 text-sm font-semibold transition hover:border-ailu-yellow hover:text-ailu-yellow focus-visible:outline focus-visible:outline-2 focus-visible:outline-ailu-yellow" aria-label="Close and return to the page">
                  <span aria-hidden className="relative block h-7 w-9"><Image src={BRAND.hand} alt="" fill sizes="36px" className="object-contain" /></span> Back to this moment
                </button>
              </div>

              <div className="relative my-auto grid flex-1 items-center gap-6 py-10 lg:grid-cols-[.95fr_1.05fr] lg:gap-10 lg:py-12">
                <div className="relative z-10 max-w-2xl">
                  <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs"><span aria-hidden className="h-px w-8 bg-ailu-yellow" /> AILU · {destination.cue}</p>
                  <AnimatePresence mode="wait">
                    <motion.div key={destination.scene} initial={variants.initial} animate={variants.animate} exit={{ opacity: 0, y: reduceMotion ? 0 : -14 }} transition={{ duration: reduceMotion ? 0.12 : 0.48, ease: [0.22, 1, 0.36, 1] }}>
                      <h1 className="mt-5 max-w-[12ch] font-display text-[clamp(2.75rem,7.4vw,7rem)] font-extrabold leading-[.88] tracking-[-.075em]">{destination.title}</h1>
                      <p className="mt-5 max-w-xl text-sm leading-relaxed text-ailu-cream/70 sm:text-lg">{destination.copy}</p>
                    </motion.div>
                  </AnimatePresence>
                  <p className="mt-8 text-[10px] font-semibold uppercase tracking-[.25em] text-ailu-cream/40">Choose a direction to keep wandering</p>
                </div>

                <nav aria-label="Explore AILU destinations" className="relative z-10 lg:min-h-[440px]">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-10 sm:gap-y-10 lg:block lg:h-[440px]">
                    {DESTINATIONS.map((item, index) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={item.href !== "/" && pathname.startsWith(item.href) ? "page" : undefined}
                        onMouseEnter={() => setActive(index)}
                        onFocus={() => setActive(index)}
                        onKeyDown={(event) => handleDestinationKey(event, index)}
                        onClick={() => setOpen(false)}
                        className={`group relative inline-flex max-w-full flex-col border-b pb-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ailu-yellow focus-visible:outline-offset-4 lg:absolute lg:max-w-[75%] ${item.position === "discover" ? "lg:left-[4%] lg:top-[8%]" : item.position === "celebrations" ? "lg:left-[42%] lg:top-[31%]" : item.position === "join" ? "lg:left-[8%] lg:top-[59%]" : "lg:left-[48%] lg:top-[73%]"} ${active === index ? "border-ailu-yellow text-ailu-yellow" : "border-white/20 text-ailu-cream/75 hover:border-ailu-yellow/70 hover:text-ailu-cream"}`}
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-[.2em] opacity-50">0{index + 1}</span>
                        <span className="mt-1 font-display text-[clamp(1.2rem,2.5vw,2.2rem)] font-bold leading-[.95] tracking-[-.045em]">{item.label}<span aria-hidden className={`ml-2 inline-block text-sm transition-transform ${active === index ? "translate-x-1" : "group-hover:translate-x-1"}`}>↗</span></span>
                        <span className="mt-2 text-xs text-ailu-cream/45">{item.cue}</span>
                      </Link>
                    ))}
                  </div>
                  <div aria-hidden className="pointer-events-none absolute -right-2 top-1/2 hidden h-52 w-52 -translate-y-1/2 sm:block lg:right-[5%] lg:h-72 lg:w-72">
                    <motion.div className="absolute inset-0" animate={reduceMotion ? undefined : { y: [0, -10, 0], rotate: [0, 2, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
                      <Image src={BRAND.hand} alt="" fill sizes="(min-width: 1024px) 288px, 208px" className="object-contain opacity-[.12]" />
                    </motion.div>
                  </div>
                </nav>
              </div>

              <div className="relative z-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/15 pt-4 text-xs text-ailu-cream/60 sm:gap-x-8 sm:pt-5">
                <span className="mr-1 font-semibold uppercase tracking-[.18em] text-ailu-cream/40">Also in our world</span>
                <Link href="/dreams" onClick={() => setOpen(false)} className="min-h-9 inline-flex items-center hover:text-ailu-yellow focus-visible:outline focus-visible:outline-2 focus-visible:outline-ailu-yellow">Dream support ↗</Link>
                <Link href="/contact" onClick={() => setOpen(false)} className="min-h-9 inline-flex items-center hover:text-ailu-yellow focus-visible:outline focus-visible:outline-2 focus-visible:outline-ailu-yellow">Contact ↗</Link>
                <Link href="/events#enquire" onClick={() => setOpen(false)} className="min-h-9 inline-flex items-center hover:text-ailu-yellow focus-visible:outline focus-visible:outline-2 focus-visible:outline-ailu-yellow">Plan a celebration ↗</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
