import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ configured: false, prisma: null as unknown }));
vi.mock("@/lib/db", () => ({ dbConfigured: () => mocks.configured, getPrisma: () => mocks.prisma }));

import { POST } from "./route";

describe("public event enquiry endpoint", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); mocks.configured = false; mocks.prisma = null; });

  it("keeps the existing 503 response when the database is not configured", async () => {
    mocks.configured = false;
    const request = new Request("http://localhost/api/enquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Rani", phone: "9876543210", category: "personal-celebrations", location: "Udupi", consent: true }),
    });
    const response = await POST(request);
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: "Enquiries are not switched on yet. Please call or WhatsApp us." });
  });

  it("returns 429 for the sixth enquiry from one IP in an hour", async () => {
    const counts = new Map<string, number>();
    let seq = 0;
    mocks.configured = true;
    vi.stubEnv("RATE_LIMIT_SALT", "route-test-salt");
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    mocks.prisma = {
      rateLimit: {
        async upsert({ where, create, update }: { where: { keyHash_route_windowStart: { keyHash: string; route: string; windowStart: Date } }; create: { keyHash: string; route: string; windowStart: Date; count: number }; update: { count: { increment: number } } }) {
          const unique = where.keyHash_route_windowStart;
          const key = `${unique.keyHash}:${unique.route}:${unique.windowStart.toISOString()}`;
          const count = counts.has(key) ? (counts.get(key) ?? 0) + update.count.increment : create.count;
          counts.set(key, count);
          return { count };
        },
        async deleteMany() { return { count: 0 }; },
      },
      salesPartner: { async findUnique() { return null; } },
      async $transaction(run: (tx: unknown) => Promise<unknown>) {
        return run({ eventEnquiry: {
          async create() { seq += 1; return { seq }; },
          async update() { return {}; },
        } });
      },
    };
    const statuses: number[] = [];
    let last: Response | undefined;
    for (let index = 0; index < 6; index += 1) {
      last = await POST(new Request("http://localhost/api/enquiries", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.8" },
        body: JSON.stringify({ name: "Rani", phone: `98765432${String(10 + index).padStart(2, "0")}`, category: "personal-celebrations", location: "Udupi", consent: true }),
      }));
      statuses.push(last.status);
    }
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
    expect(Number(last?.headers.get("Retry-After"))).toBeGreaterThan(0);
  });
});
