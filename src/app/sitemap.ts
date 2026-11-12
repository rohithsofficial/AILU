// sitemap.xml for Google. Empty while COMING_SOON=true. Pages hidden in the CMS SEO screen are left out.
// Other languages are listed only after a native speaker has checked them (LANGUAGES in src/lib/i18n.ts).
import type { MetadataRoute } from "next";
import { EVENT_CATEGORIES } from "@/lib/events";
import { getContent } from "@/server/cms";
import { PUBLIC_PAGE_CONTENT, publicSiteUrl } from "@/lib/public-metadata";
import { indexedLocales, languageAlternates, localePath } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const PUBLIC_STATIC_ROUTES = Object.keys(PUBLIC_PAGE_CONTENT);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.COMING_SOON === "true") return [];
  const base = publicSiteUrl();
  if (!base) return [];
  const { seo } = await getContent();
  const hidden = new Set(seo.pages.filter((page) => page.hideFromGoogle).map((page) => page.path));
  const paths = [...PUBLIC_STATIC_ROUTES.filter((path) => !hidden.has(path)), ...EVENT_CATEGORIES.map((category) => `/events/${category.slug}`)];
  const locales = indexedLocales();
  const full = (path: string) => new URL(path, base).toString();
  return paths.flatMap((path) => {
    // The AILU World ("/") has no language versions.
    const versions = path === "/" ? ["en" as const] : locales;
    const alternates = versions.length > 1 ? { alternates: { languages: Object.fromEntries(Object.entries(languageAlternates(path)).map(([lang, href]) => [lang, full(href)])) } } : {};
    return versions.map((locale) => ({ url: full(localePath(locale, path)), changeFrequency: "monthly" as const, priority: path === "/" ? 1 : 0.6, ...alternates }));
  });
}
