import Link from "next/link";
import { SITE_CONTENT } from "@/content/site";
import { getContent } from "@/server/cms";

// Switch from the AILU World to the Normal World. It sits just below the world header (72px bar),
// above the world's side sheet (z-index 10) and below its header and menu (z-index 20).
export default async function WorldSwitch() {
  const { toSite } = SITE_CONTENT.switch;
  const { intro } = await getContent();
  return (
    <nav aria-label="Go to the website" className="fixed right-3 z-[15] flex items-start gap-2 font-body" style={{ top: "calc(72px + env(safe-area-inset-top, 0px) + 10px)" }}>
      <details className="group relative">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-full border border-ailu-cream/30 bg-ailu-black/80 px-4 text-sm font-semibold text-ailu-cream backdrop-blur transition-colors hover:border-ailu-yellow hover:text-ailu-yellow [&::-webkit-details-marker]:hidden">
          {intro.quickLinksButton} <span aria-hidden className="ml-1.5 text-ailu-yellow transition-transform group-open:rotate-180">⌄</span>
        </summary>
        <ul className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/15 bg-ailu-black/95 p-2 shadow-xl backdrop-blur">
          {SITE_CONTENT.worldLinks.map((link) => (
            <li key={link.href}><Link href={link.href} className="flex min-h-11 items-center rounded-xl px-3 text-sm text-ailu-cream/90 hover:bg-white/10 hover:text-ailu-yellow">{link.label}</Link></li>
          ))}
        </ul>
      </details>
      <Link href={toSite.href} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-ailu-yellow px-4 text-sm font-bold text-ailu-black shadow-lg transition-colors hover:bg-ailu-cream">
        {intro.websiteButton} <span aria-hidden>↗</span>
      </Link>
    </nav>
  );
}
