"use client";

// The language switcher. "menu" is the small button in the top bar (phone and desktop);
// "list" is the plain row of languages in the footer. It keeps the visitor on the same page.
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useContent } from "@/components/ContentProvider";
import { useLocale } from "@/components/LocaleLink";
import { LANGUAGES, localePath, showDraftLanguages, splitLocale, switcherLocales, type Locale } from "@/lib/i18n";

function useTargets() {
  const pathname = usePathname() ?? "/";
  const [hash, setHash] = useState("");
  useEffect(() => setHash(window.location.hash), [pathname]);
  const { path } = splitLocale(pathname);
  return switcherLocales(showDraftLanguages()).map((locale) => ({ locale, href: localePath(locale, `${path}${hash}`), ...LANGUAGES[locale] }));
}

const label = (locale: Locale) => (LANGUAGES[locale].checked ? LANGUAGES[locale].native : `${LANGUAGES[locale].native} (draft)`);

export default function LanguageSwitcher({ variant = "menu", className = "" }: { variant?: "menu" | "list"; className?: string }) {
  const t = useContent().ui.language;
  const current = useLocale();
  const targets = useTargets();
  const [open, setOpen] = useState(false);
  const listId = useId();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !box.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);

  if (targets.length < 2) return null;

  // Plain <a> links: a language change reloads the page, so the right fonts and wording load together.
  if (variant === "list") {
    return <nav aria-label={t.choose} className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${className}`}>
      <span className="text-ailu-cream/60">{t.label}:</span>
      {targets.map((item) => <a key={item.locale} href={item.href} lang={item.locale} hrefLang={item.locale} aria-current={item.locale === current ? "true" : undefined} className={`inline-flex min-h-11 items-center ${item.locale === current ? "font-bold text-ailu-yellow" : "text-ailu-cream/90 underline-offset-4 hover:text-ailu-yellow hover:underline"}`}>{label(item.locale)}</a>)}
    </nav>;
  }

  return <div ref={box} data-lang-switch className={`relative ${className}`}>
    <button type="button" aria-expanded={open} aria-controls={listId} aria-label={`${t.choose}. ${LANGUAGES[current].native}`} onClick={() => setOpen((value) => !value)}
      className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-white/25 px-2.5 text-sm font-semibold text-ailu-cream transition-colors hover:border-ailu-yellow hover:text-ailu-yellow focus-visible:outline focus-visible:outline-2 focus-visible:outline-ailu-yellow sm:px-3">
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" /></svg>
      <span lang={current} className="hidden min-[400px]:inline">{LANGUAGES[current].short}</span>
    </button>
    {open ? <ul id={listId} className="absolute right-0 top-[calc(100%+.5rem)] z-50 min-w-48 rounded-xl border border-white/15 bg-ailu-black p-1.5 shadow-2xl">
      {targets.map((item) => <li key={item.locale}>
        <a href={item.href} lang={item.locale} hrefLang={item.locale} aria-current={item.locale === current ? "true" : undefined}
          className={`flex min-h-11 items-center justify-between gap-4 rounded-lg px-3 text-sm ${item.locale === current ? "bg-ailu-yellow font-bold text-ailu-black" : "text-ailu-cream hover:bg-white/10"}`}>
          <span>{label(item.locale)}</span><span className="text-xs opacity-60">{item.english}</span>
        </a>
      </li>)}
    </ul> : null}
  </div>;
}
