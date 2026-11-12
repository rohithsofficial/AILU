// The /celebrate landing page wording in one language. Translations come from src/content/translations;
// anything not translated stays English. The A/B test compares versions, not languages (docs/AB_TESTING.md).
import { LANDING, LANDING_VARIANTS } from "@/content/landing";
import { SITE_CONTENT } from "@/content/site";
import { translationFor } from "@/content/translations";
import { overlayTranslation, type Locale } from "@/lib/i18n";

export function landingText(locale: Locale) {
  const translation = translationFor(locale);
  return {
    page: overlayTranslation(LANDING, translation.landing?.page),
    variants: overlayTranslation(LANDING_VARIANTS, translation.landing?.variants),
    // The same FAQ and steps as the website, so they share one translation.
    faqs: overlayTranslation(SITE_CONTENT.faqs, translation.content.faqs?.items),
    process: overlayTranslation(SITE_CONTENT.process, translation.content.home?.steps),
  };
}
