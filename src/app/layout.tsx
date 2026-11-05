import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { BRAND } from "@/lib/brand";
import { publicSiteUrl, ROOT_DESCRIPTION } from "@/lib/public-metadata";
import { SITE_CONTENT } from "@/content/site";

const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-poppins", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: publicSiteUrl(),
  title: { default: `${BRAND.name} | ${BRAND.tagline}`, template: "%s | AILU" },
  description: ROOT_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: BRAND.name, title: `${BRAND.name} | ${BRAND.tagline}`, description: ROOT_DESCRIPTION, images: ["/opengraph-image.png"] },
  twitter: { card: "summary_large_image", title: `${BRAND.name} | ${BRAND.tagline}`, description: ROOT_DESCRIPTION, images: ["/opengraph-image.png"] },
};

const siteUrl = publicSiteUrl()?.toString();
const organization = {
  "@context": "https://schema.org", "@type": "Organization", name: BRAND.name,
  ...(siteUrl ? { url: siteUrl, logo: new URL(BRAND.logo, siteUrl).toString() } : {}),
  sameAs: SITE_CONTENT.socialLinks.map((link) => link.href), areaServed: "India",
  contactPoint: [{ "@type": "ContactPoint", telephone: BRAND.phone, email: BRAND.email, contactType: "customer service", areaServed: "IN" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        <noscript><style>{"#ailu-intro{display:none!important}body{overflow:auto!important}"}</style></noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }} />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
