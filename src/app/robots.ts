import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/lib/public-metadata";

export const dynamic = "force-dynamic";
export default function robots(): MetadataRoute.Robots {
  const hidden = process.env.COMING_SOON === "true";
  return { rules: { userAgent: "*", disallow: hidden ? "/" : ["/admin", "/api", "/coming-soon", "/my-ailu"] }, ...(publicSiteUrl() ? { sitemap: new URL("/sitemap.xml", publicSiteUrl()).toString() } : {}) };
}
