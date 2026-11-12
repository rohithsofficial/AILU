import { describe, expect, it, vi } from "vitest";

// buildContent lives in a server file that imports database code; stub those so the test runs without a database.
vi.mock("react", async (original) => ({ ...(await original<typeof import("react")>()), cache: (fn: unknown) => fn }));
vi.mock("@vercel/blob", () => ({ del: vi.fn() }));
vi.mock("@/lib/db", () => ({ dbConfigured: () => false, getPrisma: () => { throw new Error("no database in tests"); } }));
vi.mock("@/lib/audit", () => ({ audit: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }));

import { CMS_DEFAULTS } from "@/content/defaults";
import { LANDING, LANDING_VARIANTS } from "@/content/landing";
import { TRANSLATIONS } from "@/content/translations";
import { buildContent, parseSectionId } from "@/server/cms";
import { LOCALES } from "@/lib/i18n";

type Walker = (english: unknown, translated: unknown, path: string) => void;
const walk: Walker = (english, translated, path) => {
  if (translated === undefined) return;
  if (typeof english === "string") {
    expect(typeof translated, path).toBe("string");
    // Placeholders the code fills in must survive translation.
    for (const token of english.match(/\{(phone|email|id|privacy)\}/g) ?? []) expect(translated as string, `${path} keeps ${token}`).toContain(token);
    return;
  }
  if (Array.isArray(english)) {
    expect(Array.isArray(translated), path).toBe(true);
    // A translated list may be shorter (the rest stays English) but never longer than the English one.
    expect((translated as unknown[]).length, `${path} has no extra items`).toBeLessThanOrEqual(english.length);
    (translated as unknown[]).forEach((item, index) => walk(english[index], item, `${path}[${index}]`));
    return;
  }
  if (english && typeof english === "object") {
    for (const [key, value] of Object.entries(translated as Record<string, unknown>)) {
      expect(Object.keys(english), `${path}.${key} exists in English`).toContain(key);
      walk((english as Record<string, unknown>)[key], value, `${path}.${key}`);
    }
  }
};

describe("translation files", () => {
  for (const [locale, translation] of Object.entries(TRANSLATIONS)) {
    it(`${locale} matches the English shape and keeps every placeholder`, () => {
      walk(CMS_DEFAULTS, translation?.content, `${locale}.content`);
      walk({ page: LANDING, variants: LANDING_VARIANTS }, translation?.landing, `${locale}.landing`);
    });
  }
});

describe("buildContent per language", () => {
  it("English is exactly the defaults with contact details filled in", () => {
    const english = buildContent({});
    expect(english.hero).toEqual(CMS_DEFAULTS.hero);
    expect(english.ui.forms.enquiry.submit).toBe("Send enquiry");
  });

  it("Kannada uses the translation and keeps links, ids and contact details from English", () => {
    const kn = buildContent({}, "kn");
    expect(kn.hero.titleLine1).not.toBe(CMS_DEFAULTS.hero.titleLine1);
    expect(kn.nav.destinations.map((item) => item.href)).toEqual(CMS_DEFAULTS.nav.destinations.map((item) => item.href));
    expect(kn.celebrations.items.map((item) => item.slug)).toEqual(CMS_DEFAULTS.celebrations.items.map((item) => item.slug));
    expect(kn.ui.forms.application.roles.map((role) => role.slug)).toEqual(CMS_DEFAULTS.ui.forms.application.roles.map((role) => role.slug));
    expect(kn.settings.phone).toBe(CMS_DEFAULTS.settings.phone);
    expect(kn.faqs.items.at(-1)?.answer).toContain(CMS_DEFAULTS.settings.phone);
  });

  it("CMS edits in a language win over the translation file, and English edits do not leak into it", () => {
    const kn = buildContent({ "hero:kn": { titleLine1: "ಹೊಸ ಸಾಲು" }, hero: { titleLine2: "Edited in English" } }, "kn");
    expect(kn.hero.titleLine1).toBe("ಹೊಸ ಸಾಲು");
    expect(kn.hero.titleLine2).not.toBe("Edited in English");
  });

  it("an untranslated line falls back to English", () => {
    const hi = buildContent({}, "hi");
    expect(hi.hero).toEqual(CMS_DEFAULTS.hero);
    expect(hi.ui.nav.events).not.toBe(CMS_DEFAULTS.ui.nav.events);
  });

  it("builds every language without errors", () => {
    for (const locale of LOCALES) expect(buildContent({}, locale).ui.language.label).toBeTruthy();
  });
});

describe("parseSectionId", () => {
  it("reads the section and its language", () => {
    expect(parseSectionId("hero")).toEqual({ key: "hero", locale: "en" });
    expect(parseSectionId("hero:kn")).toEqual({ key: "hero", locale: "kn" });
    expect(parseSectionId("hero:xx")).toEqual({ key: "hero", locale: "en" });
  });
});
