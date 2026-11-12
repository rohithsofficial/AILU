// CMS: choose which language's wording to edit. English is the main wording; other languages lay their text over it.
import Link from "next/link";
import { LANGUAGES, LOCALES, type Locale } from "@/lib/i18n";

export default function CmsLanguagePicker({ locale, basePath }: { locale: Locale; basePath: string }) {
  return <nav aria-label="Language to edit" className="mt-4 flex flex-wrap items-center gap-2 text-sm">
    <span className="text-ailu-cream/60">Language:</span>
    {LOCALES.map((item) => <Link key={item} href={item === "en" ? basePath : `${basePath}?lang=${item}`} aria-current={item === locale ? "page" : undefined}
      className={`rounded-full border px-3 py-1 ${item === locale ? "border-ailu-yellow bg-ailu-yellow font-semibold text-ailu-black" : "border-white/20 text-ailu-cream/80 hover:border-ailu-yellow"}`}>
      <span lang={item}>{LANGUAGES[item].native}</span>{LANGUAGES[item].checked ? "" : <span className="ml-1 text-xs opacity-70">draft</span>}
    </Link>)}
  </nav>;
}
