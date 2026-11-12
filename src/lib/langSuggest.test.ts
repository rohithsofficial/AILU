// Tests which language a visitor is offered: their own choice, then their browser, then their state.
import { describe, expect, it } from "vitest";
import { suggestLocale } from "@/lib/langSuggest";
import type { Locale } from "@/lib/i18n";

const all: Locale[] = ["en", "kn", "hi", "ml", "ta", "te"];
const base = { choice: null, browser: ["en-US"], region: null, available: all };

describe("suggestLocale", () => {
  it("respects a choice the visitor made", () => {
    expect(suggestLocale({ ...base, choice: "en", region: "IN-KA" })).toBeNull();
    expect(suggestLocale({ ...base, choice: "ta", region: "IN-KA" })).toBe("ta");
  });
  it("uses the browser language before the state", () => {
    expect(suggestLocale({ ...base, browser: ["hi-IN", "en"], region: "IN-KA" })).toBe("hi");
    expect(suggestLocale({ ...base, browser: ["en-IN", "ml"], region: "IN-KA" })).toBe("ml");
  });
  it("falls back to the state language in India", () => {
    expect(suggestLocale({ ...base, region: "IN-KA" })).toBe("kn");
    expect(suggestLocale({ ...base, region: "IN-TG" })).toBe("te");
    expect(suggestLocale({ ...base, region: "IN-DL" })).toBe("hi");
  });
  it("suggests nothing outside India, in other states, or for a language that is not switched on", () => {
    expect(suggestLocale({ ...base, region: "US-CA" })).toBeNull();
    expect(suggestLocale({ ...base, region: "IN-GA" })).toBeNull();
    expect(suggestLocale({ ...base, region: "IN-KA", available: ["en", "hi"] })).toBeNull();
    expect(suggestLocale({ ...base, choice: "kn", available: ["en"] })).toBeNull();
  });
});
