// sitemap.xml for Google. Empty while COMING_SOON=true. Pages hidden in the CMS SEO screen are left out.
import type { MetadataRoute } from "next";
import { EVENT_CATEGORIES } from "@/lib/events";
import { getContent } from "@/server/cms";
import { PUBLIC_PAGE_CONTENT, publicSiteUrl } from "@/lib/public-metadata";

export const dynamic = "force-dynamic";
export const PUBLIC_STATIC_ROUTES = Object.keys(PUBLIC_PAGE_CONTENT);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.COMING_SOON === "true") return [];
  const base = publicSiteUrl();
  if (!base) return [];
  const { seo } = await getContent();
  const hidden = new Set(seo.pages.filter((page) => page.hideFromGoogle).map((page) => page.path));
  const paths = [...PUBLIC_STATIC_ROUTES.filter((path) => !hidden.has(path)), ...EVENT_CATEGORIES.map((category) => `/events/${category.slug}`)];
  return paths.map((path) => ({ url: new URL(path, base).toString(), changeFrequency: "monthly", priority: path === "/" ? 1 : 0.6 }));
}
