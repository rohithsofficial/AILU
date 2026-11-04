import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { SITE_CONTENT } from "@/content/site";

const columns = [
  { title: "Explore", links: [{ href: "/events", label: "Events" }, { href: "/about", label: "About" }, { href: "/faq", label: "FAQ" }, { href: "/contact", label: "Contact" }] },
  { title: "Join", links: [{ href: "/join/team", label: "Join the team" }, { href: "/join/partner", label: "Become a partner" }, { href: "/dreams", label: "Dream support" }, { href: "/donate", label: "Donation Box — opening soon" }] },
  { title: "Legal", links: [{ href: "/privacy", label: "Privacy" }, { href: "/terms", label: "Terms" }, { href: "/referral-policy", label: "Referral policy" }] },
];

export default function Footer() {
  return <footer className="bg-ailu-black pb-20 text-ailu-cream">
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Link href={SITE_CONTENT.switch.toSite.href} aria-label="AILU home" className="inline-block rounded bg-ailu-black p-1"><Image src={BRAND.logo} alt="AILU" width={210} height={70} sizes="210px" /></Link>
        <p className="mt-4 font-display text-xl font-bold text-ailu-yellow">{BRAND.tagline}</p>
        <p className="mt-2 max-w-sm text-ailu-cream/90">Based in Udupi, Karnataka. Planning celebrations across India.</p>
        <p className="mt-4 text-sm text-ailu-cream/85">Call <a className="underline decoration-ailu-yellow underline-offset-4" href={`tel:${BRAND.phone.replace(/\s/g, "")}`}>{BRAND.phone}</a></p>
        <p className="mt-1 text-sm text-ailu-cream/85"><a className="underline decoration-ailu-yellow underline-offset-4" href={BRAND.whatsapp}>WhatsApp AILU</a> · <a className="underline decoration-ailu-yellow underline-offset-4" href={`mailto:${BRAND.email}`}>{BRAND.email}</a></p>
        {SITE_CONTENT.socialLinks.length > 0 && <ul className="mt-4 flex flex-wrap gap-4">{SITE_CONTENT.socialLinks.map((link) => <li key={link.href}><a className="underline decoration-ailu-yellow underline-offset-4" href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a></li>)}</ul>}
      </div>
      {columns.map((column) => <nav key={column.title} aria-label={column.title}><h2 className="font-display font-bold text-ailu-yellow">{column.title}</h2><ul className="mt-3 space-y-2">{column.links.map((link) => <li key={link.href}><Link className="min-h-11 inline-flex items-center text-sm text-ailu-cream/90 underline-offset-4 hover:text-ailu-yellow hover:underline" href={link.href}>{link.label}</Link></li>)}</ul></nav>)}
    </div>
    <p className="border-t border-white/20 px-4 py-4 text-center text-sm text-ailu-cream/85">© {new Date().getFullYear()} AILU · Based in Udupi, Karnataka</p>
  </footer>;
}
