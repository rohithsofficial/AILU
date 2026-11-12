// Which language to suggest to a visitor on an English page. Usage comes first: a language the visitor already
// chose, then the languages set in their own browser or phone. Only then their state in India (from Vercel).
// It is only ever a suggestion bar: visitors and Google are never sent to another language automatically.
import type { Locale } from "@/lib/i18n";

export const LANG_CHOICE_KEY = "ailu-lang-choice";
export const REGION_COOKIE = "ailu_region";

/** Indian states (ISO 3166-2 codes, as Vercel gives them) and the language most people there read. */
export const REGION_LANGUAGE: Record<string, Locale> = {
  KA: "kn",
  KL: "ml", LD: "ml",
  TN: "ta", PY: "ta",
  AP: "te", TG: "te", TS: "te",
  UP: "hi", UK: "hi", UT: "hi", BR: "hi", JH: "hi", MP: "hi", CG: "hi", CT: "hi", RJ: "hi", HR: "hi", HP: "hi", DL: "hi", CH: "hi",
};

/**
 * @param choice   a language the visitor picked before ("en" means they want English: suggest nothing)
 * @param browser  navigator.languages, for example ["kn-IN", "en-GB"]
 * @param region   "IN-KA" from the region cookie, or null
 * @param available languages that are switched on for visitors
 */
export function suggestLocale({ choice, browser, region, available }: { choice: string | null; browser: readonly string[]; region: string | null; available: readonly Locale[] }): Locale | null {
  const ok = (locale: string | undefined): locale is Locale => !!locale && locale !== "en" && (available as readonly string[]).includes(locale);
  if (choice) return ok(choice) ? choice : null;
  // The first Indian language in the browser list wins. If English comes first, the visitor likely reads English,
  // but a state language is still offered once, because many phones are set to English by default.
  for (const tag of browser) {
    const base = tag.toLowerCase().split("-")[0];
    if (ok(base)) return base;
  }
  const [country, state] = (region ?? "").toUpperCase().split("-");
  return country === "IN" ? (ok(REGION_LANGUAGE[state]) ? REGION_LANGUAGE[state] : null) : null;
}
