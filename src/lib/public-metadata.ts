import type { Metadata } from "next";
import { getCategory } from "@/lib/events";

type SeoPage = { path: string; title: string; description: string; shareImage: string; hideFromGoogle: boolean };
type SeoContent = { defaultShareImage: string; pages: SeoPage[] };
type CelebrationSeo = { slug: string; title: string; blurb: string; seoTitle: string; seoDescription: string; shareImage: string };

const LIVE_SITE_URL = "https://www.worldofailu.com";

// Canonical links must be full addresses, so the live domain is the default.
export function publicSiteUrl() {
  try { return new URL(process.env.NEXT_PUBLIC_SITE_URL || LIVE_SITE_URL); } catch { return new URL(LIVE_SITE_URL); }
}

export const ROOT_DESCRIPTION = "AILU is an event management and celebration company based in Udupi, planning celebrations across India.";

export const PUBLIC_PAGE_CONTENT: Record<string, { title: string; description: string }> = {
  "/": { title: "AILU | Creating Moments. Delivering Smiles.", description: ROOT_DESCRIPTION },
  "/classic": { title: "Normal site", description: "The classic AILU website: events, joining the team, partner registration, private dream support and contact details." },
  "/events": { title: "Events", description: "Explore AILU event planning services for personal, wedding, corporate, cultural, entertainment, and community celebrations." },
  "/about": { title: "About", description: "Learn about AILU, an event management and celebration company based in Udupi, planning celebrations across India." },
  "/contact": { title: "Contact", description: "Contact AILU in Udupi about celebrations, team applications, or the sales partner programme." },
  "/faq": { title: "Frequently asked questions", description: "Answers about AILU event enquiries, planning, team applications, referrals, privacy, and contact." },
  "/join": { title: "Join AILU", description: "Explore team applications and the external sales partner programme at AILU." },
  "/join/team": { title: "Join the team", description: "Apply to work with AILU in event coordination, hosting, performances, and related roles." },
  "/join/partner": { title: "Become a sales partner", description: "Register interest in introducing event clients to AILU. Partner registration does not guarantee earnings." },
  "/dreams": { title: "Private dream support", description: "Learn about AILU's private dream-support intention. The submission form is not open." },
  "/donate": { title: "Donation Box", description: "Donation information from AILU. Donations are not being collected." },
  "/privacy": { title: "Privacy", description: "How AILU collects and uses information from event enquiries, team applications, and partner registrations." },
  "/terms": { title: "Terms", description: "Terms for using the AILU public website, event enquiry form, team application, and partner registration." },
  "/referral-policy": { title: "Referral policy", description: "How AILU partner IDs are recorded and when a referral reward may be considered." },
};

export function metadataForPath(path: keyof typeof PUBLIC_PAGE_CONTENT, seo?: SeoContent): Metadata {
  const item = PUBLIC_PAGE_CONTENT[path];
  const page = seo?.pages.find((entry) => entry.path === path);
  const metadata = publicMetadata(page?.title || item.title, page?.description || item.description, path, page?.shareImage || seo?.defaultShareImage);
  return page?.hideFromGoogle ? { ...metadata, robots: { index: false, follow: false } } : metadata;
}

export function eventMetadata(slug: string, celebrations?: CelebrationSeo[], defaultImage?: string): Metadata | undefined {
  const edited = celebrations?.find((item) => item.slug === slug);
  const category = edited ?? getCategory(slug);
  if (!category) return undefined;
  const description = edited?.seoDescription || `${category.blurb} Based in Udupi, planning celebrations across India.`;
  return publicMetadata(edited?.seoTitle || category.title, description, `/events/${category.slug}`, edited?.shareImage || defaultImage);
}

export function publicMetadata(title: string, description: string, path: string, image?: string): Metadata {
  const images = image ? [image] : undefined;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} | AILU`, description, type: "website", url: path, siteName: "AILU", ...(images ? { images } : {}) },
    twitter: { card: "summary_large_image", title: `${title} | AILU`, description, ...(images ? { images } : {}) },
  };
}
