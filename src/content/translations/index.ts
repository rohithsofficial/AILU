// Draft translations of the website wording. Each file holds only text: links, images and ids always
// come from English (src/lib/i18n.ts overlayTranslation). Missing lines show in English.
// These are machine drafts. A native speaker must check each language before LANGUAGES[x].checked is set to true.
import type { Locale } from "@/lib/i18n";
import type { Translation } from "./types";
import kn from "./kn";
import hi from "./hi";
import ml from "./ml";
import ta from "./ta";
import te from "./te";

export const TRANSLATIONS: Partial<Record<Locale, Translation>> = { kn, hi, ml, ta, te };

/** The translation file for a language (empty for English). */
export const translationFor = (locale: Locale): Translation => TRANSLATIONS[locale] ?? { content: {} };
export type { Translation } from "./types";
