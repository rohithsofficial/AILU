"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BRAND } from "@/lib/brand";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/#contact", label: "Contact" },
  { href: "/my-ailu", label: "My AILU" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-ailu-cream/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3" aria-label="Main">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-extrabold">
          <Image src={BRAND.logo} alt="" width={32} height={32} unoptimized />
          AILU
        </Link>
        <ul className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (<li key={l.href}><Link href={l.href} className="text-sm font-medium hover:underline">{l.label}</Link></li>))}
          <li><Link href="/events" className="rounded-full bg-ailu-yellow px-5 py-2 text-sm font-semibold text-ailu-black">Book an event</Link></li>
        </ul>
        <button className="rounded-lg border border-black/20 px-3 py-2 text-sm md:hidden" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}
        </button>
      </nav>
      {open && (
        <ul id="mobile-menu" className="space-y-1 border-t border-black/10 px-4 pb-4 md:hidden">
          {LINKS.map((l) => (<li key={l.href}><Link href={l.href} onClick={() => setOpen(false)} className="block py-3 text-lg font-medium">{l.label}</Link></li>))}
          <li><Link href="/events" onClick={() => setOpen(false)} className="mt-2 block rounded-full bg-ailu-yellow py-3 text-center font-semibold">Book an event</Link></li>
        </ul>
      )}
    </header>
  );
}
