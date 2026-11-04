import Footer from "./Footer";
import Navbar from "./Navbar";
import FloatingWhatsApp from "./FloatingWhatsApp";

// Chrome of the Normal World: every real page (src/app/(site)) gets the navbar, footer and WhatsApp button.
// The AILU World (src/app/(world)), the staff admin and the coming-soon page have their own screens.
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <main id="main-content" tabIndex={-1} className="bg-ailu-black text-ailu-cream">{children}</main>
      <FloatingWhatsApp />
      <Footer />
    </>
  );
}
