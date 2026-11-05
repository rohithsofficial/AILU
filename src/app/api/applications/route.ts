import { NextResponse } from "next/server";
import { dbConfigured, getPrisma } from "@/lib/db";
import { applicationSchema, normalizePhone } from "@/lib/validation";
import { checkPublicRateLimit, clientIpFrom, PUBLIC_RATE_LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the highlighted fields.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ id: "AILU-APP-000000" }); // honeypot

  if (!dbConfigured()) return NextResponse.json({ error: "Applications are not switched on yet. Please WhatsApp us." }, { status: 503 });

  const { website, consent, email, portfolioUrl, experience, availability, eventCategories, notes, phone, beginner, ...rest } = parsed.data; void website; void consent;
  const phoneN = normalizePhone(phone);
  try {
    if (!process.env.RATE_LIMIT_SALT) return NextResponse.json({ error: "Applications are temporarily unavailable. Please WhatsApp us." }, { status: 503 });
    const limit = await checkPublicRateLimit({ ...PUBLIC_RATE_LIMITS.applicationIp, identifier: clientIpFrom(req.headers) });
    if (!limit.allowed) return NextResponse.json({ error: "Too many applications from this connection. Please try again later or WhatsApp us." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
    const db = getPrisma();
    // One application per phone number in any 30 day window, so the team is not flooded with duplicates.
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dup = await db.application.findFirst({ where: { phone: phoneN, createdAt: { gte: since } }, select: { seq: true } });
    if (dup) return NextResponse.json({ error: "We have already received an application from this number. Our team will be in touch." }, { status: 409 });

    const id = await db.$transaction(async (tx) => {
      const row = await tx.application.create({
        data: { ...rest, phone: phoneN, id: `tmp-${crypto.randomUUID()}`, beginner: !!beginner, email: email || null, portfolioUrl: portfolioUrl || null, experience: experience || null, availability: availability || null, eventCategories: eventCategories || null, notes: notes || null },
      });
      const code = `AILU-APP-${String(row.seq).padStart(6, "0")}`;
      await tx.application.update({ where: { seq: row.seq }, data: { id: code } });
      return code;
    });
    return NextResponse.json({ id });
  } catch (e) {
    console.error("application save failed", e);
    return NextResponse.json({ error: "Something went wrong saving your application. Please WhatsApp us." }, { status: 500 });
  }
}
