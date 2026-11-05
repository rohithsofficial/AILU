import { afterEach, describe, expect, it, vi } from "vitest";
import { EVENT_CATEGORIES } from "@/lib/events";
import { metadataForPath, PUBLIC_PAGE_CONTENT, eventMetadata } from "./public-metadata";
import sitemap, { PUBLIC_STATIC_ROUTES } from "@/app/sitemap";
import robots from "@/app/robots";

vi.mock("@/server/cms", () => ({ getContent: async () => ({ seo: { pages: [] } }) }));

describe("public metadata and indexing", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("defines metadata for every static route listed in the sitemap", () => {
    for (const route of PUBLIC_STATIC_ROUTES) {
      expect(PUBLIC_PAGE_CONTENT[route]?.title).toBeTruthy();
      expect(PUBLIC_PAGE_CONTENT[route]?.description).toBeTruthy();
      const metadata = metadataForPath(route as keyof typeof PUBLIC_PAGE_CONTENT);
      expect(metadata.alternates?.canonical).toBe(route);
    }
  });

  it("provides canonical and social metadata for every event category", () => {
    for (const category of EVENT_CATEGORIES) {
      const metadata = eventMetadata(category.slug);
      expect(metadata?.alternates?.canonical).toBe(`/events/${category.slug}`);
      expect(metadata?.openGraph?.title).toContain(category.title);
    }
  });

  it("returns public sitemap URLs when open and no URLs while coming soon", async () => {
    vi.stubEnv("COMING_SOON", "false");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://ailu.example");
    const urls = await sitemap();
    expect(urls.some((entry) => entry.url === "https://ailu.example/about")).toBe(true);
    expect(urls.some((entry) => entry.url.includes("/events/"))).toBe(true);
    expect(urls.some((entry) => entry.url.includes("admin") || entry.url.includes("coming-soon") || entry.url.includes("my-ailu"))).toBe(false);
    vi.stubEnv("COMING_SOON", "true");
    expect(await sitemap()).toEqual([]);
  });

  it("blocks indexing of the complete site in coming-soon mode", () => {
    vi.stubEnv("COMING_SOON", "true");
    expect(robots().rules).toMatchObject({ userAgent: "*", disallow: "/" });
    vi.stubEnv("COMING_SOON", "false");
    expect(robots().rules).toMatchObject({ disallow: ["/admin", "/api", "/coming-soon", "/my-ailu"] });
  });
});
