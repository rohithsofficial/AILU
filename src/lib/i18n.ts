// Languages of the public website. No framework code here, so the rules can be tested directly.
// English addresses never change (/events). Other languages add a prefix (/kn/events).
// The AILU World and the CRM stay English.

export const LOCALES = ["en", "kn", "hi", "ml", "ta", "te"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

// `checked` turns true only after a native speaker has read the whole translation.
// An unchecked language still works by its address (so checkers can read it), but it is
// hidden from the switcher on the live site, kept out of Google, and shows a "draft" note.
export const LANGUAGES: Record<Locale, { native: string; english: string; short: string; checked: boolean }> = {
  en: { native: "English", english: "English", short: "EN", checked: true },
  kn: { native: "ಕನ್ನಡ", english: "Kannada", short: "ಕ", checked: false },
  hi: { native: "हिन्दी", english: "Hindi", short: "हि", checked: false },
  ml: { native: "മലയാളം", english: "Malayalam", short: "മ", checked: false },
  ta: { native: "தமிழ்", english: "Tamil", short: "த", checked: false },
  te: { native: "తెలుగు", english: "Telugu", short: "తె", checked: false },
};

export const isLocale = (value: unknown): value is Locale => typeof value === "string" && (LOCALES as readonly string[]).includes(value);

/** Turns anything (a route param, say) into a known language. Unknown values become English. */
export const toLocale = (value: unknown): Locale => (isLocale(value) ? value : DEFAULT_LOCALE);

/** Languages Google may index. Draft languages stay out until a native speaker has checked them. */
export const indexedLocales = () => LOCALES.filter((locale) => LANGUAGES[locale].checked);

/** Languages offered in the switcher. Drafts show only while developing, or when the preview switch is on. */
export function switcherLocales(showDrafts: boolean) {
  return LOCALES.filter((locale) => LANGUAGES[locale].checked || showDrafts);
}

export const showDraftLanguages = () => process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_DRAFT_LANGUAGES === "true";

/**
 * The address of a page in a language: localePath("kn", "/events") is "/kn/events".
 * English keeps the plain address. Outside links, "#" links and the AILU World ("/") are left alone.
 */
export function localePath(locale: Locale, href: string) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const { path } = splitLocale(href);
  if (locale === DEFAULT_LOCALE || path.split(/[?#]/)[0] === "/" || isUnprefixed(path)) return path;
  return `/${locale}${path}`;
}

// Parts of the site that have no language versions.
const UNPREFIXED = [/^\/admin(\/|$)/, /^\/api(\/|$)/, /^\/coming-soon(\/|$)/];
const isUnprefixed = (path: string) => UNPREFIXED.some((pattern) => pattern.test(path.split(/[?#]/)[0]));

/** Splits "/kn/events?x#y" into { locale: "kn", path: "/events?x#y" }. An "/en" prefix is read too. */
export function splitLocale(href: string): { locale: Locale; path: string } {
  const match = /^\/([a-z]{2})(?=$|[/?#])(.*)$/.exec(href);
  if (match && isLocale(match[1])) {
    const rest = match[2];
    return { locale: match[1], path: rest === "" ? "/" : rest.startsWith("/") ? rest : `/${rest}` };
  }
  return { locale: DEFAULT_LOCALE, path: href || "/" };
}

/**
 * What the middleware does with an address.
 * - "rewrite": an English page; serve the /en version without changing the address.
 * - "redirect": /en/... or a bare /kn; send the visitor to the proper address.
 * - "pass": leave it alone (the AILU World, admin, api, coming soon, or an address that already has a language).
 */
export function routeFor(pathname: string): { action: "pass" } | { action: "rewrite" | "redirect"; to: string } {
  if (pathname === "/" || isUnprefixed(pathname)) return { action: "pass" };
  const { locale, path } = splitLocale(pathname);
  const hasPrefix = pathname !== path;
  if (!hasPrefix) return { action: "rewrite", to: `/${DEFAULT_LOCALE}${pathname}` };
  if (locale === DEFAULT_LOCALE) return { action: "redirect", to: path === "/" ? "/classic" : path };
  if (path === "/") return { action: "redirect", to: `/${locale}/classic` };
  return { action: "pass" };
}

/** hreflang links for a page: every indexed language plus x-default (English). */
export function languageAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of indexedLocales()) languages[locale] = localePath(locale, path);
  languages["x-default"] = localePath(DEFAULT_LOCALE, path);
  return languages;
}

// Fixed parts that stay the same in every language: links, images, ids and contact details.
const SHARED_KEY = /(href|whatsapp|image|src|slug|path|kind|scene|phone|email|enabled|googleVerificationCode|hideFromGoogle)$/i;
export const isSharedKey = (key: string) => SHARED_KEY.test(key);

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Lays a translation over the English wording. Only text is taken from the translation; links, images,
 * ids and yes/no switches always come from English. Anything missing or empty stays English,
 * so a page is never blank. Lists keep the English length and order: item 1 translates item 1.
 */
export function overlayTranslation<T>(english: T, translation: unknown, key = ""): T {
  if (typeof english === "string") {
    if (isSharedKey(key)) return english;
    return (typeof translation === "string" && translation.trim() ? translation.trim() : english) as T;
  }
  if (Array.isArray(english)) {
    const items = Array.isArray(translation) ? translation : [];
    return english.map((item, index) => overlayTranslation(item, items[index], key)) as T;
  }
  if (isObject(english)) {
    const source = isObject(translation) ? translation : {};
    return Object.fromEntries(Object.entries(english).map(([k, v]) => [k, overlayTranslation(v, source[k], k)])) as T;
  }
  return english;
}

/** A translation file: any part of the English shape, all optional. */
export type DeepPartial<T> = T extends string ? string : T extends (infer U)[] ? DeepPartial<U>[] : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

/** Route props for pages under src/app/(site)/[lang]. */
export type LangParams = { params: { lang: string } };
