import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { config, middleware } from "./middleware";

describe("coming-soon middleware", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("redirects public pages while hidden and preserves preview access", () => {
    vi.stubEnv("COMING_SOON", "true");
    vi.stubEnv("PREVIEW_SECRET", "preview-test-secret");
    const hidden = middleware(new NextRequest("https://ailu.test/events"));
    expect(hidden?.status).toBe(307);
    expect(hidden?.headers.get("location")).toBe("https://ailu.test/coming-soon");
    const preview = middleware(new NextRequest("https://ailu.test/?preview=preview-test-secret"));
    expect(preview?.headers.get("location")).toBe("https://ailu.test/");
    expect(preview?.cookies.get("ailu_preview")?.value).toBe("preview-test-secret");
  });

  it("keeps robots and sitemap routes outside the redirect matcher", () => {
    const matcher = config.matcher[0];
    expect(matcher).toContain("robots.txt");
    expect(matcher).toContain("sitemap.xml");
  });
});
