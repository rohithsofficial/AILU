// Wraps a Normal World page in its language. English pages render exactly as before.
// Other languages get lang="xx" (for screen readers, fonts and Google) and the page language on <html>.
// The "draft translation" note is shown by DraftLanguageNote.
import HtmlLang from "@/components/HtmlLang";
import type { Locale } from "@/lib/i18n";

export default function LanguageRoot({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  if (locale === "en") return <>{children}</>;
  return <div lang={locale} className="i18n-script">
    {/* Sets <html lang> before the page shows, so the first paint already uses the right language. */}
    <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)}` }} />
    <HtmlLang locale={locale} />
    {children}
  </div>;
}
