// Normal World footer: contact details, links and legal pages.
import Image from "next/image";
import Link from "./LocaleLink";
import LanguageSwitcher from "./LanguageSwitcher";
import { BRAND } from "@/lib/brand";
import { getContent } from "@/server/cms";
import { SITE_CONTENT } from "@/content/site";
import type { Locale } from "@/lib/i18n";

export default async function Footer({ locale = "en" }: { locale?: Locale }) {
  const content = await getContent(locale);
  const { footer: t, settings, ui } = content;
  return <footer className="bg-ailu-black pb-20 text-ailu-cream">
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Link href={SITE_CONTENT.switch.toSite.href} aria-label={ui.nav.home} className="inline-block rounded bg-ailu-black p-1"><Image src={BRAND.logo} alt="AILU" width={210} height={70} sizes="210px" /></Link>
        <p className="mt-4 font-display text-xl font-bold text-ailu-yellow">{settings.tagline}</p>
        <p className="mt-2 max-w-sm text-ailu-cream/90">{t.tagline}</p>
        <p className="mt-4 text-sm text-ailu-cream/85">{t.callLabel} <a className="underline decoration-ailu-yellow underline-offset-4" href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a></p>
        <p className="mt-1 text-sm text-ailu-cream/85"><a className="underline decoration-ailu-yellow underline-offset-4" href={settings.whatsapp}>{t.whatsappLabel}</a> · <a className="underline decoration-ailu-yellow underline-offset-4" href={`mailto:${settings.email}`}>{settings.email}</a></p>
        {settings.socialLinks.length > 0 && <ul className="mt-4 flex flex-wrap gap-4">{settings.socialLinks.map((link) => <li key={link.href}><a className="underline decoration-ailu-yellow underline-offset-4" href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a></li>)}</ul>}
      </div>
      {t.columns.map((column) => <nav key={column.title} aria-label={column.title}><h2 className="font-display font-bold text-ailu-yellow">{column.title}</h2><ul className="mt-3 space-y-2">{column.links.map((link) => <li key={link.href}><Link className="min-h-11 inline-flex items-center text-sm text-ailu-cream/90 underline-offset-4 hover:text-ailu-yellow hover:underline" href={link.href}>{link.label}</Link></li>)}</ul></nav>)}
    </div>
    <LanguageSwitcher variant="list" className="mx-auto max-w-6xl px-4 pb-4" />
    <p className="border-t border-white/20 px-4 py-4 text-center text-sm text-ailu-cream/85">© {new Date().getFullYear()} {t.copyright}</p>
  </footer>;
}
