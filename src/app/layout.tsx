// Root layout for every page: brand fonts, default SEO, organisation structured data, and the CMS content for client components.
import type { Metadata } from "next";
import ContentProvider from "@/components/ContentProvider";
import { clientContent, getContent } from "@/server/cms";
import { Inter, Noto_Sans_Devanagari, Noto_Sans_Kannada, Noto_Sans_Malayalam, Noto_Sans_Tamil, Noto_Sans_Telugu, Poppins } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { publicSiteUrl, ROOT_DESCRIPTION } from "@/lib/public-metadata";

const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-poppins", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// Poppins and Inter have no Indian scripts. These are used only on translated pages (globals.css, .i18n-script).
// preload is off, so a browser downloads one only when a page actually shows that script.
const indic = { display: "swap", preload: false } as const;
const kannada = Noto_Sans_Kannada({ subsets: ["kannada"], variable: "--font-noto-kn", ...indic });
const devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-noto-hi", ...indic });
const malayalam = Noto_Sans_Malayalam({ subsets: ["malayalam"], variable: "--font-noto-ml", ...indic });
const tamil = Noto_Sans_Tamil({ subsets: ["tamil"], variable: "--font-noto-ta", ...indic });
const telugu = Noto_Sans_Telugu({ subsets: ["telugu"], variable: "--font-noto-te", ...indic });
const fontVariables = [poppins, inter, kannada, devanagari, malayalam, tamil, telugu].map((font) => font.variable).join(" ");

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
    <html lang="en" className={fontVariables}>
      <body>
        <noscript><style>{"#ailu-intro{display:none!important}body{overflow:auto!important}div.ailu{display:block!important}div.ailu>*{visibility:visible!important}.world-poster{display:none!important}"}</style></noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }} />
        <ContentProvider value={clientContent(content)}>{children}</ContentProvider>
      </body>
    </html>
  );
}
