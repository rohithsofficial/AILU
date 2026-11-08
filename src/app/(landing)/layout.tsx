import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { SITE_CONTENT } from "@/content/site";
import { LANDING } from "@/content/landing";
import { getContent } from "@/server/cms";

// Landing pages: one goal (an enquiry), so no full menu or footer to wander off into.
// The switch to the AILU World stays visible, as on every Normal World page.
export default async function LandingLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getContent();
  const tel = `tel:${settings.phone.replace(/\s/g, "")}`;
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ailu-black/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
          <Link href="/classic" aria-label="AILU website home" className="shrink-0">
            <Image src={BRAND.logo} alt="AILU" width={1400} height={468} className="h-7 w-auto sm:h-9" priority />
          </Link>
          <nav aria-label="Quick actions" className="flex items-center gap-2">
            <Link href={SITE_CONTENT.switch.toWorld.href} className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-ailu-cream/25 px-3 text-xs font-semibold text-ailu-cream hover:border-ailu-yellow hover:text-ailu-yellow sm:px-4 sm:text-sm">
              {SITE_CONTENT.switch.toWorld.label}
            </Link>
            <a href={tel} className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full bg-ailu-yellow px-3 text-xs font-bold sm:px-4 sm:text-sm text-ailu-black hover:bg-ailu-cream">
              {LANDING.callLabel} <span className="ml-1 hidden sm:inline">{settings.phone}</span>
            </a>
          </nav>
        </div>
      </header>
      <main id="main-content" className="bg-ailu-black pb-24 text-ailu-cream md:pb-0">{children}</main>
      <footer className="border-t border-white/10 bg-ailu-black px-4 pb-28 pt-8 text-sm text-ailu-cream/60 md:pb-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {BRAND.name}. {BRAND.tagline}</p>
          <p className="flex flex-wrap gap-4">
            <Link href="/classic" className="hover:text-ailu-yellow">Website</Link>
            <Link href="/privacy" className="hover:text-ailu-yellow">Privacy</Link>
            <Link href="/terms" className="hover:text-ailu-yellow">Terms</Link>
          </p>
        </div>
      </footer>
    </>
  );
}
