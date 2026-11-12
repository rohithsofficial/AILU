import Image from "next/image";
import Link from "@/components/LocaleLink";
import ContentProvider from "@/components/ContentProvider";
import LanguageRoot from "@/components/LanguageRoot";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DraftLanguageNote from "@/components/DraftLanguageNote";
import { BRAND } from "@/lib/brand";
import { SITE_CONTENT } from "@/content/site";
import { landingText } from "@/content/landingText";
import { LOCALES, toLocale } from "@/lib/i18n";
import { clientContent, getContent } from "@/server/cms";

// Landing pages: one goal (an enquiry), so no full menu or footer to wander off into.
// The switch to the AILU World stays visible, as on every Normal World page.
// Each language has its own address (/kn/celebrate); English stays at /celebrate. See src/lib/i18n.ts.
export const dynamicParams = false;
export function generateStaticParams() { return LOCALES.map((lang) => ({ lang })); }

export default async function LandingLayout({ children, params }: { children: React.ReactNode; params: { lang: string } }) {
  const locale = toLocale(params.lang);
  const content = await getContent(locale);
  const { settings } = content;
  const LANDING = landingText(locale).page;
  const worldLabel = locale === "en" ? SITE_CONTENT.switch.toWorld.label : content.intro.worldButton;
  const tel = `tel:${settings.phone.replace(/\s/g, "")}`;
  return (
    <ContentProvider value={clientContent(content)}><LanguageRoot locale={locale}>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ailu-black/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
          <Link href="/classic" aria-label={LANDING.homeLabel} className="shrink-0">
            <Image src={BRAND.logo} alt="AILU" width={1400} height={468} className="h-7 w-auto sm:h-9" priority />
          </Link>
          <nav aria-label={LANDING.quickActions} className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher />
            <Link href={SITE_CONTENT.switch.toWorld.href} className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-ailu-cream/25 px-3 text-xs font-semibold text-ailu-cream hover:border-ailu-yellow hover:text-ailu-yellow sm:px-4 sm:text-sm">
              {worldLabel}
            </Link>
            <a href={tel} className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full bg-ailu-yellow px-3 text-xs font-bold sm:px-4 sm:text-sm text-ailu-black hover:bg-ailu-cream">
              {LANDING.callLabel} <span className="ml-1 hidden sm:inline">{settings.phone}</span>
            </a>
          </nav>
        </div>
      </header>
      <DraftLanguageNote />
      <main id="main-content" className="bg-ailu-black pb-24 text-ailu-cream md:pb-0">{children}</main>
      <footer className="border-t border-white/10 bg-ailu-black px-4 pb-28 pt-8 text-sm text-ailu-cream/60 md:pb-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {BRAND.name}. {BRAND.tagline}</p>
          <p className="flex flex-wrap gap-4">
            <Link href="/classic" className="hover:text-ailu-yellow">{LANDING.websiteLink}</Link>
            <Link href="/privacy" className="hover:text-ailu-yellow">{LANDING.privacyLink}</Link>
            <Link href="/terms" className="hover:text-ailu-yellow">{LANDING.termsLink}</Link>
          </p>
        </div>
      </footer>
    </LanguageRoot></ContentProvider>
  );
}
