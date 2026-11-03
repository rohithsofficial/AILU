import { createHmac } from "node:crypto";
import { dbConfigured, getPrisma } from "@/lib/db";

export const PUBLIC_RATE_LIMITS = {
  enquiryIp: { route: "enquiries-ip", limit: 5, windowMs: 60 * 60 * 1000 },
  enquiryPhone: { route: "enquiries-phone", limit: 3, windowMs: 60 * 60 * 1000 },
  applicationIp: { route: "applications-ip", limit: 3, windowMs: 24 * 60 * 60 * 1000 },
  partnerIp: { route: "partners-ip", limit: 3, windowMs: 24 * 60 * 60 * 1000 },
} as const;

export function hashRateLimitKey(identifier: string, route: string, salt = process.env.RATE_LIMIT_SALT ?? "") {
  if (!salt) throw new Error("RATE_LIMIT_SALT is required");
  return createHmac("sha256", salt).update(`${route}\0${identifier}`).digest("hex");
}

export function clientIpFrom(headers: Headers): string {
  // On Vercel, x-forwarded-for is set by the trusted edge. Use only its first address.
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export function rateWindowStart(now: Date, windowMs: number): Date {
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs);
}

type RateLimitStore = {
  rateLimit: {
    upsert(args: { where: { keyHash_route_windowStart: { keyHash: string; route: string; windowStart: Date } }; create: { keyHash: string; route: string; windowStart: Date; count: number }; update: { count: { increment: number } } }): Promise<{ count: number }>;
    deleteMany(args: { where: { windowStart: { lt: Date } } }): Promise<unknown>;
  };
};

export async function consumeRateLimit(input: {
  store: RateLimitStore;
  route: string;
  identifier: string;
  limit: number;
  windowMs: number;
  now?: Date;
  salt?: string;
}) {
  const now = input.now ?? new Date();
  const windowStart = rateWindowStart(now, input.windowMs);
  const keyHash = hashRateLimitKey(input.identifier, input.route, input.salt);
  const row = await input.store.rateLimit.upsert({
    where: { keyHash_route_windowStart: { keyHash, route: input.route, windowStart } },
    create: { keyHash, route: input.route, windowStart, count: 1 },
    update: { count: { increment: 1 } },
  });
  if (Math.random() < 0.02) {
    void input.store.rateLimit.deleteMany({ where: { windowStart: { lt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) } } }).catch(() => undefined);
  }
  return {
    allowed: row.count <= input.limit,
    retryAfterSeconds: Math.max(1, Math.ceil((windowStart.getTime() + input.windowMs - now.getTime()) / 1000)),
  };
}

export function publicRateLimitReady() {
  return dbConfigured() && Boolean(process.env.RATE_LIMIT_SALT);
}

export async function checkPublicRateLimit(input: { route: string; identifier: string; limit: number; windowMs: number }) {
  return consumeRateLimit({ store: getPrisma(), ...input });
}
