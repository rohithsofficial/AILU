import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-poppins", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "AILU | Creating Moments. Delivering Smiles.",
  description: "Founder-led event planning, hosting and entertainment in Udupi, with selected bookings across South India.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
