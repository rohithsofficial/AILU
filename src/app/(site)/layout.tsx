import SiteChrome from "@/components/SiteChrome";

// Normal World: the classic site with navbar, footer, real forms and legal pages.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
