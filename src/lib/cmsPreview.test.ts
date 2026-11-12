// Tests for the CMS editing helpers: preview addresses, the editor "back" link and field length hints.
import { describe, expect, it } from "vitest";
import { fieldLimit, humanise, safeEditorPath, safePreviewPath } from "@/lib/cms";
import { CMS_SECTIONS } from "@/content/defaults";

describe("safePreviewPath", () => {
  it("keeps addresses on this website", () => {
    expect(safePreviewPath("/about")).toBe("/about");
    expect(safePreviewPath("/kn/events/weddings")).toBe("/kn/events/weddings");
  });
  it("refuses other websites and odd input", () => {
    for (const bad of ["https://evil.example", "//evil.example", String.raw`/\evil.example`, "about", "", null, 5, "/a\nb"]) expect(safePreviewPath(bad)).toBe("/classic");
  });
});

describe("safeEditorPath", () => {
  it("allows only CMS editor addresses", () => {
    expect(safeEditorPath("/admin/cms/hero")).toBe("/admin/cms/hero");
    expect(safeEditorPath("/admin/cms/hero?lang=kn")).toBe("/admin/cms/hero?lang=kn");
    for (const bad of ["/admin/clients", "https://evil.example", "/admin/cms/hero?x=1", undefined]) expect(safeEditorPath(bad)).toBe("/admin/cms");
  });
});

describe("fieldLimit", () => {
  it("uses Google's limits for SEO", () => {
    expect(fieldLimit("seo", "title")).toBe(60);
    expect(fieldLimit("seo", "description")).toBe(160);
    expect(fieldLimit("celebrations", "seoTitle")).toBe(60);
  });
  it("keeps headings and buttons short, and leaves body text free", () => {
    expect(fieldLimit("hero", "title")).toBe(90);
    expect(fieldLimit("hero", "ctaLabel")).toBe(90);
    expect(fieldLimit("about", "introText")).toBe(0);
  });
});

describe("CMS sections", () => {
  it("each section except SEO points to a page on this website, for View page and Preview", () => {
    for (const section of CMS_SECTIONS) {
      if (section.key === "seo") expect(section.path).toBeUndefined();
      else expect(safePreviewPath(section.path, "")).toBe(section.path);
    }
  });
});

describe("humanise", () => {
  it("reads keys with several capitals as words", () => {
    expect(humanise("atAGlance")).toBe("At a glance");
    expect(humanise("servicesTitleLine1")).toBe("Services title line 1");
  });
});
