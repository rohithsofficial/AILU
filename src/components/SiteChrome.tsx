"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";
import Intro from "./Intro";
import Navbar from "./Navbar";

// The coming-soon page is a standalone screen: no intro overlay, navbar, footer or wrapping <main>.
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  if (usePathname() === "/coming-soon") return <>{children}</>;
  return (
    <>
      <Intro />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
