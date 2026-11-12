import { describe, expect, it } from "vitest";
import { languageAlternates, localePath, overlayTranslation, routeFor, splitLocale, switcherLocales, toLocale } from "./i18n";

describe("localePath", () => {
  it("keeps English addresses as they are", () => {
    expect(localePath("en", "/events")).toBe("/events");
    expect(localePath("en", "/kn/events")).toBe("/events");
  });
  it("adds the language prefix for other languages", () => {
    expect(localePath("kn", "/events")).toBe("/kn/events");
    expect(localePath("hi", "/events#enquire")).toBe("/hi/events#enquire");
    expect(localePath("ta", "/join/partner?category=x")).toBe("/ta/join/partner?category=x");
    expect(localePath("kn", "/te/about")).toBe("/kn/about");
  });
  it("leaves the AILU World, admin, api, outside and hash links alone", () => {
    expect(localePath("kn", "/")).toBe("/");
    expect(localePath("kn", "/#rewards")).toBe("/#rewards");
    expect(localePath("kn", "/admin/cms")).toBe("/admin/cms");
    expect(localePath("kn", "/api/enquiries")).toBe("/api/enquiries");
    expect(localePath("kn", "https://wa.me/1")).toBe("https://wa.me/1");
    expect(localePath("kn", "//evil.example")).toBe("//evil.example");
    expect(localePath("kn", "#main")).toBe("#main");
    expect(localePath("kn", "mailto:a@b.c")).toBe("mailto:a@b.c");
  });
});

describe("splitLocale", () => {
  it("reads a language prefix", () => {
    expect(splitLocale("/kn/events")).toEqual({ locale: "kn", path: "/events" });
    expect(splitLocale("/kn")).toEqual({ locale: "kn", path: "/" });
    expect(splitLocale("/en/faq")).toEqual({ locale: "en", path: "/faq" });
  });
  it("does not mistake other two-letter words for a language", () => {
    expect(splitLocale("/ab/events")).toEqual({ locale: "en", path: "/ab/events" });
    expect(splitLocale("/knots")).toEqual({ locale: "en", path: "/knots" });
  });
});

describe("routeFor", () => {
  it("serves English pages from /en without changing the address", () => {
    expect(routeFor("/events")).toEqual({ action: "rewrite", to: "/en/events" });
    expect(routeFor("/celebrate")).toEqual({ action: "rewrite", to: "/en/celebrate" });
  });
  it("leaves the world, admin, api and coming soon alone", () => {
    for (const path of ["/", "/admin", "/admin/cms", "/api/enquiries", "/coming-soon"]) expect(routeFor(path)).toEqual({ action: "pass" });
  });
  it("passes language addresses and tidies /en and bare prefixes", () => {
    expect(routeFor("/kn/events")).toEqual({ action: "pass" });
    expect(routeFor("/en/events")).toEqual({ action: "redirect", to: "/events" });
    expect(routeFor("/en")).toEqual({ action: "redirect", to: "/classic" });
    expect(routeFor("/kn")).toEqual({ action: "redirect", to: "/kn/classic" });
  });
});

describe("languages on offer", () => {
  it("unknown values become English", () => {
    expect(toLocale("kn")).toBe("kn");
    expect(toLocale("xx")).toBe("en");
    expect(toLocale(undefined)).toBe("en");
  });
  it("hides draft languages unless asked", () => {
    expect(switcherLocales(false)).toEqual(["en"]);
    expect(switcherLocales(true)).toEqual(["en", "kn", "hi", "ml", "ta", "te"]);
  });
  it("lists only checked languages for Google, plus x-default", () => {
    expect(languageAlternates("/events")).toEqual({ en: "/events", "x-default": "/events" });
  });
});

describe("overlayTranslation", () => {
  const english = { title: "Hello", href: "/events", phone: "+91 1", enabled: false, items: [{ slug: "a", label: "One" }, { slug: "b", label: "Two" }] };
  it("takes text from the translation and keeps links, ids and switches from English", () => {
    const result = overlayTranslation(english, { title: "ನಮಸ್ಕಾರ", href: "/x", phone: "0", enabled: true, items: [{ slug: "z", label: "ಒಂದು" }] });
    expect(result).toEqual({ title: "ನಮಸ್ಕಾರ", href: "/events", phone: "+91 1", enabled: false, items: [{ slug: "a", label: "ಒಂದು" }, { slug: "b", label: "Two" }] });
  });
  it("falls back to English for missing, empty or broken values", () => {
    expect(overlayTranslation(english, { title: "  " })).toEqual(english);
    expect(overlayTranslation(english, null)).toEqual(english);
    expect(overlayTranslation(english, { items: "oops" })).toEqual(english);
  });
});
