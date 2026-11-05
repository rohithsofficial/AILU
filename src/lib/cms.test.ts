import { describe, expect, it } from "vitest";
import { CMS_DEFAULTS, CMS_SECTIONS } from "@/content/defaults";
import { cleanContent, fillTokens, humanise, isFixedList, listTemplate, mergeContent, seoIssues } from "./cms";

const base = { title: "Hello", enabled: false, href: "/events", steps: [{ title: "One", body: "Text" }], items: [{ slug: "a", title: "A" }, { slug: "b", title: "B" }], lines: ["x"] };

describe("CMS content", () => {
  it("has an entry for every section", () => {
    expect(CMS_SECTIONS.map((section) => section.key).sort()).toEqual(Object.keys(CMS_DEFAULTS).sort());
  });

  it("keeps the defaults when nothing or broken content is saved", () => {
    expect(mergeContent(base, undefined)).toEqual(base);
    expect(mergeContent(base, { title: 5, enabled: "yes", steps: "none" })).toEqual(base);
  });

  it("uses saved values and ignores unknown keys", () => {
    const merged = mergeContent(base, { title: " New ", enabled: true, extra: "no", lines: ["a", "b"] });
    expect(merged.title).toBe("New");
    expect(merged.enabled).toBe(true);
    expect(merged.lines).toEqual(["a", "b"]);
    expect(merged).not.toHaveProperty("extra");
  });

  it("lets lists grow, but keeps fixed lists and their keys", () => {
    const merged = mergeContent(base, { steps: [{ title: "1", body: "a" }, { title: "2", body: "b" }], items: [{ slug: "hacked", title: "New A" }] });
    expect(merged.steps).toHaveLength(2);
    expect(merged.items).toEqual([{ slug: "a", title: "New A" }, { slug: "b", title: "B" }]);
    expect(isFixedList(base.items)).toBe(true);
    expect(isFixedList(base.steps)).toBe(false);
  });

  it("refuses unsafe links and oversized text when saving", () => {
    expect(() => cleanContent(base, { href: "javascript:alert(1)" })).toThrow(/link/);
    expect(() => cleanContent(base, { title: "x".repeat(9000) })).toThrow(/too long/);
    expect(cleanContent(base, { href: "https://wa.me/91" }).href).toBe("https://wa.me/91");
    expect(() => cleanContent(base, "nope")).toThrow();
  });

  it("drops an unsafe link already in the database", () => {
    expect(mergeContent(base, { href: "javascript:alert(1)" }).href).toBe("/events");
  });

  it("fills contact details into wording", () => {
    expect(fillTokens({ a: ["Call {phone}", { b: "or {email}" }] }, { phone: "1", email: "e" })).toEqual({ a: ["Call 1", { b: "or e" }] });
  });

  it("makes blank items for empty lists", () => {
    expect(listTemplate("socialLinks", [])).toEqual({ label: "", href: "" });
    expect(listTemplate("steps", base.steps)).toEqual({ title: "", body: "" });
  });

  it("writes readable field names", () => {
    expect(humanise("servicesTitleLine1")).toBe("Services title line 1");
    expect(humanise("peopleEyebrow")).toBe("People small heading");
  });

  it("finds SEO problems, and skips hidden pages", () => {
    const issues = seoIssues([
      { path: "/a", title: "Same", description: "", hideFromGoogle: false },
      { path: "/b", title: "Same", description: "x".repeat(170), hideFromGoogle: false },
      { path: "/c", title: "", description: "", hideFromGoogle: true },
    ]);
    expect(issues.map((issue) => issue.problem)).toEqual(["Description is missing.", "Description is over 160 characters, so Google may cut it.", "Same title as /a."]);
  });

  it("publishes valid defaults for every section", () => {
    for (const key of Object.keys(CMS_DEFAULTS) as (keyof typeof CMS_DEFAULTS)[]) {
      expect(cleanContent(CMS_DEFAULTS[key], CMS_DEFAULTS[key])).toEqual(mergeContent(CMS_DEFAULTS[key], CMS_DEFAULTS[key]));
    }
  });
});
