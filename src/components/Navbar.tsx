"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NavLogo from "./NavLogo";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/join", label: "Join AILU" },
  { href: "/dreams", label: "Dreams" },
  { href: "/donate", label: "Donate" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname === "/coming-soon") return null;
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ailu-black/85 text-ailu-cream backdrop-blur-lg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3" aria-label="Main">
        {/* The intro hand flies to the marked hand area of this logo */}
        <Link href="/" aria-label="AILU home" data-ailu-logo className="block"><NavLogo compact={compact} /></Link>
        <ul className="hidden items-center gap-6 lg:flex">
          {LINKS.map((l) => (<li key={l.href}><Link href={l.href} className="text-sm font-medium text-ailu-cream/85 transition hover:text-ailu-yellow">{l.label}</Link></li>))}
          <li><Link href="/events#enquire" className="rounded-full bg-ailu-yellow px-5 py-2 text-sm font-semibold text-ailu-black transition hover:brightness-110">Book an event</Link></li>
        </ul>
        <button className="rounded-lg border border-white/25 px-3 py-2 text-sm lg:hidden" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}
        </button>
      </nav>
      {open && (
        <ul id="mobile-menu" className="space-y-1 border-t border-white/10 px-4 pb-4 lg:hidden">
          {LINKS.map((l) => (<li key={l.href}><Link href={l.href} onClick={() => setOpen(false)} className="block py-3 text-lg font-medium">{l.label}</Link></li>))}
          <li><Link href="/events#enquire" onClick={() => setOpen(false)} className="mt-2 block rounded-full bg-ailu-yellow py-3 text-center font-semibold text-ailu-black">Book an event</Link></li>
        </ul>
      )}
    </header>
  );
}
