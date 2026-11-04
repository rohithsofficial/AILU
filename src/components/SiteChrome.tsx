"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";
import Intro from "./Intro";
import Navbar from "./Navbar";
import FloatingWhatsApp from "./FloatingWhatsApp";

// The coming-soon page and the staff admin are standalone screens: no intro overlay, navbar, footer or wrapping <main>.
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/coming-soon" || pathname.startsWith("/admin")) return <>{children}</>;
  if (pathname === "/") return <>{children}</>;
  return (
    <>
      <Intro />
      <Navbar />
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <main id="main-content" tabIndex={-1} className="bg-ailu-black text-ailu-cream">{children}</main>
      <FloatingWhatsApp />
      <Footer />
    </>
  );
}
