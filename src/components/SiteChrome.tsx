"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";
import Intro from "./Intro";
import Navbar from "./Navbar";

// The coming-soon page and the staff admin are standalone screens: no intro overlay, navbar, footer or wrapping <main>.
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/coming-soon" || pathname.startsWith("/admin")) return <>{children}</>;
  return (
    <>
      <Intro />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
