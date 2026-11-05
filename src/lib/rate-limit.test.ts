import { afterEach, describe, expect, it, vi } from "vitest";
import { consumeRateLimit, hashRateLimitKey, publicRateLimitReady, PUBLIC_RATE_LIMITS, rateWindowStart } from "./rate-limit";

function fakeStore() {
  const counts = new Map<string, number>();
  return {
    counts,
    rateLimit: {
      async upsert({ where, create, update }: { where: { keyHash_route_windowStart: { keyHash: string; route: string; windowStart: Date } }; create: { keyHash: string; route: string; windowStart: Date; count: number }; update: { count: { increment: number } } }) {
        const key = `${where.keyHash_route_windowStart.keyHash}:${where.keyHash_route_windowStart.route}:${where.keyHash_route_windowStart.windowStart.toISOString()}`;
        const count = counts.has(key) ? (counts.get(key) ?? 0) + update.count.increment : create.count;
        counts.set(key, count);
        return { count };
      },
      async deleteMany() { return { count: 0 }; },
    },
  };
}

describe("public form rate limits", () => {
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

  it("starts a new window exactly at its boundary", () => {
    const window = 60 * 60 * 1000;
    expect(rateWindowStart(new Date("2026-11-03T10:59:59.999Z"), window).toISOString()).toBe("2026-11-03T10:00:00.000Z");
    expect(rateWindowStart(new Date("2026-11-03T11:00:00.000Z"), window).toISOString()).toBe("2026-11-03T11:00:00.000Z");
  });

  it("hashes identifiers with a secret salt and route separation", () => {
    expect(hashRateLimitKey("203.0.113.1", "enquiries-ip", "secret")).toBe(hashRateLimitKey("203.0.113.1", "enquiries-ip", "secret"));
    expect(hashRateLimitKey("203.0.113.1", "enquiries-ip", "secret")).not.toBe(hashRateLimitKey("203.0.113.1", "enquiries-ip", "other"));
    expect(hashRateLimitKey("203.0.113.1", "enquiries-ip", "secret")).not.toBe(hashRateLimitKey("203.0.113.1", "applications-ip", "secret"));
  });

  it("leaves public forms unavailable through the existing 503 path when the database is missing", () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("RATE_LIMIT_SALT", "test-salt");
    expect(publicRateLimitReady()).toBe(false);
  });

  it("allows the configured number, rejects the next request, and resets at the window boundary", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const store = fakeStore();
    const base = { store, route: "enquiries-ip", identifier: "203.0.113.2", limit: 2, windowMs: 60_000, salt: "test-salt" };
    const now = new Date("2026-11-03T10:00:01.000Z");
    expect((await consumeRateLimit({ ...base, now })).allowed).toBe(true);
    expect((await consumeRateLimit({ ...base, now })).allowed).toBe(true);
    expect((await consumeRateLimit({ ...base, now })).allowed).toBe(false);
    expect((await consumeRateLimit({ ...base, now: new Date("2026-11-03T10:01:00.000Z") })).allowed).toBe(true);
  });

  it("uses the requested public route limits", async () => {
    expect(PUBLIC_RATE_LIMITS.enquiryIp.limit).toBe(5);
    expect(PUBLIC_RATE_LIMITS.enquiryPhone.limit).toBe(3);
    expect(PUBLIC_RATE_LIMITS.applicationIp.limit).toBe(3);
    expect(PUBLIC_RATE_LIMITS.partnerIp.limit).toBe(3);
    expect(PUBLIC_RATE_LIMITS.dreamIp.limit).toBe(3);
    expect(PUBLIC_RATE_LIMITS.dreamContact.limit).toBe(2);
    expect(PUBLIC_RATE_LIMITS.dreamIp.windowMs).toBe(24 * 60 * 60 * 1000);
    expect(PUBLIC_RATE_LIMITS.dreamContact.windowMs).toBe(24 * 60 * 60 * 1000);
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const store = fakeStore();
    const results = [];
    for (let index = 0; index < 4; index += 1) results.push((await consumeRateLimit({ store, route: PUBLIC_RATE_LIMITS.enquiryPhone.route, identifier: "+919876543210", limit: PUBLIC_RATE_LIMITS.enquiryPhone.limit, windowMs: PUBLIC_RATE_LIMITS.enquiryPhone.windowMs, salt: "test-salt", now: new Date("2026-11-03T10:00:00Z") })).allowed);
    expect(results).toEqual([true, true, true, false]);
  });

  it("limits dream IPs to three and each contact to two per day", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const store = fakeStore();
    const now = new Date("2026-11-03T10:00:00Z");
    const ipResults = [];
    for (let index = 0; index < 4; index += 1) ipResults.push((await consumeRateLimit({ store, route: PUBLIC_RATE_LIMITS.dreamIp.route, identifier: "203.0.113.3", limit: PUBLIC_RATE_LIMITS.dreamIp.limit, windowMs: PUBLIC_RATE_LIMITS.dreamIp.windowMs, salt: "test-salt", now })).allowed);
    const contactResults = [];
    for (let index = 0; index < 3; index += 1) contactResults.push((await consumeRateLimit({ store, route: PUBLIC_RATE_LIMITS.dreamContact.route, identifier: "phone:+919876543210", limit: PUBLIC_RATE_LIMITS.dreamContact.limit, windowMs: PUBLIC_RATE_LIMITS.dreamContact.windowMs, salt: "test-salt", now })).allowed);
    expect(ipResults).toEqual([true, true, true, false]);
    expect(contactResults).toEqual([true, true, false]);
  });
});
