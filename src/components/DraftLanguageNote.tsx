"use client";

// A short note on pages whose translation has not been checked by a native speaker yet,
// with a link to the same page in English. Nothing shows on English or checked languages.
import { usePathname } from "next/navigation";
import { useContent } from "@/components/ContentProvider";
import { useLocale } from "@/components/LocaleLink";
import { LANGUAGES, localePath, splitLocale } from "@/lib/i18n";

export default function DraftLanguageNote() {
  const locale = useLocale();
  const t = useContent().ui.language;
  const { path } = splitLocale(usePathname() ?? "/");
  if (LANGUAGES[locale].checked) return null;
  return <p className="border-b border-ailu-yellow/30 bg-ailu-black px-4 py-2 text-center text-xs text-ailu-cream/85 sm:text-sm">
    {t.draftNote} <a href={localePath("en", path)} lang="en" hrefLang="en" className="font-semibold text-ailu-yellow underline underline-offset-2">{t.readInEnglish}</a>
  </p>;
}
