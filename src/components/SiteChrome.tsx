import Footer from "./Footer";
import Navbar from "./Navbar";
import FloatingWhatsApp from "./FloatingWhatsApp";
import DraftLanguageNote from "./DraftLanguageNote";
import Link from "./LocaleLink";
import { getContent } from "@/server/cms";
import type { Locale } from "@/lib/i18n";

// Chrome of the Normal World: every real page (src/app/(site)) gets the navbar, footer and WhatsApp button.
// The AILU World (src/app/(world)), the staff admin and the coming-soon page have their own screens.
export default async function SiteChrome({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const { banner, ui } = await getContent(locale);
  return (
    <>
      {banner.enabled && banner.text ? <p className="bg-ailu-yellow px-4 py-2 text-center text-sm font-semibold text-ailu-black">{banner.text}{banner.href && banner.linkLabel ? <> <Link href={banner.href} className="underline underline-offset-2">{banner.linkLabel}</Link></> : null}</p> : null}
      <Navbar />
      <DraftLanguageNote />
      <a href="#main-content" className="skip-link">{ui.nav.skip}</a>
      <main id="main-content" tabIndex={-1} className="bg-ailu-black text-ailu-cream">{children}</main>
      <FloatingWhatsApp />
      <Footer locale={locale} />
    </>
  );
}
