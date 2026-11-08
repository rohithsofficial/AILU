// robots.txt: lets search engines in, keeps them out of /admin, /api, /coming-soon and /my-ailu,
// and blocks the whole site while COMING_SOON=true.
import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/lib/public-metadata";

export const dynamic = "force-dynamic";
export default function robots(): MetadataRoute.Robots {
  const hidden = process.env.COMING_SOON === "true";
  return { rules: { userAgent: "*", disallow: hidden ? "/" : ["/admin", "/api", "/coming-soon", "/my-ailu"] }, ...(publicSiteUrl() ? { sitemap: new URL("/sitemap.xml", publicSiteUrl()).toString() } : {}) };
}
