import ContentProvider from "@/components/ContentProvider";
import LanguageRoot from "@/components/LanguageRoot";
import SiteChrome from "@/components/SiteChrome";
import { LOCALES, toLocale } from "@/lib/i18n";
import { clientContent, getContent } from "@/server/cms";

// Normal World: the classic site with navbar, footer, real forms and legal pages, in each language.
// English pages keep their plain address (the middleware serves /events from /en/events). See src/lib/i18n.ts.
export const dynamicParams = false;
export function generateStaticParams() { return LOCALES.map((lang) => ({ lang })); }

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: { lang: string } }) {
  const locale = toLocale(params.lang);
  const content = await getContent(locale);
  return <ContentProvider value={clientContent(content)}>
    <LanguageRoot locale={locale}><SiteChrome locale={locale}>{children}</SiteChrome></LanguageRoot>
  </ContentProvider>;
}
