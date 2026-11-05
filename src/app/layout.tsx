import type { Metadata } from "next";
import ContentProvider from "@/components/ContentProvider";
import { clientContent, getContent } from "@/server/cms";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { publicSiteUrl, ROOT_DESCRIPTION } from "@/lib/public-metadata";

const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-poppins", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { settings, seo } = await getContent();
  const title = `${BRAND.name} | ${settings.tagline}`;
  const images = [seo.defaultShareImage];
  return {
    metadataBase: publicSiteUrl(),
    title: { default: title, template: "%s | AILU" },
    description: ROOT_DESCRIPTION,
    alternates: { canonical: "/" },
    openGraph: { type: "website", siteName: BRAND.name, title, description: ROOT_DESCRIPTION, images },
    twitter: { card: "summary_large_image", title, description: ROOT_DESCRIPTION, images },
    ...(seo.googleVerificationCode ? { verification: { google: seo.googleVerificationCode } } : {}),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getContent();
  const { settings } = content;
  const siteUrl = publicSiteUrl()?.toString();
  const organization = {
    "@context": "https://schema.org", "@type": "Organization", name: BRAND.name,
    ...(siteUrl ? { url: siteUrl, logo: new URL(BRAND.logo, siteUrl).toString() } : {}),
    sameAs: settings.socialLinks.map((link) => link.href), areaServed: "India",
    contactPoint: [{ "@type": "ContactPoint", telephone: settings.phone, email: settings.email, contactType: "customer service", areaServed: "IN" }],
  };
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        <noscript><style>{"#ailu-intro{display:none!important}body{overflow:auto!important}div.ailu>*{visibility:visible!important}"}</style></noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }} />
        <ContentProvider value={clientContent(content)}>{children}</ContentProvider>
      </body>
    </html>
  );
}
