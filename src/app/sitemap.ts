import type { MetadataRoute } from "next";
import { EVENT_CATEGORIES } from "@/lib/events";
import { PUBLIC_PAGE_CONTENT, publicSiteUrl } from "@/lib/public-metadata";

export const dynamic = "force-dynamic";
export const PUBLIC_STATIC_ROUTES = Object.keys(PUBLIC_PAGE_CONTENT);

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.COMING_SOON === "true") return [];
  const base = publicSiteUrl();
  if (!base) return [];
  const paths = [...PUBLIC_STATIC_ROUTES, ...EVENT_CATEGORIES.map((category) => `/events/${category.slug}`)];
  return paths.map((path) => ({ url: new URL(path, base).toString(), changeFrequency: "monthly", priority: path === "/" ? 1 : 0.6 }));
}
