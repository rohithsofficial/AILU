// POST /api/partners: saves a sales partner registration from /join/partner. One registration per phone.
import { NextResponse } from "next/server";
import { dbConfigured, getPrisma } from "@/lib/db";
import { normalizePhone, partnerSchema } from "@/lib/validation";
import { checkPublicRateLimit, clientIpFrom, PUBLIC_RATE_LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const parsed = partnerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the highlighted fields.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ id: "AILU-SP-000000" }); // honeypot

  if (!dbConfigured()) return NextResponse.json({ error: "Partner registration is not switched on yet. Please WhatsApp us." }, { status: 503 });

  const { website, consent, email, clientCategories, experience, referralSource, phone, ...rest } = parsed.data; void website; void consent;
  const phoneN = normalizePhone(phone);
  try {
    if (!process.env.RATE_LIMIT_SALT) return NextResponse.json({ error: "Partner registration is temporarily unavailable. Please WhatsApp us." }, { status: 503 });
    const limit = await checkPublicRateLimit({ ...PUBLIC_RATE_LIMITS.partnerIp, identifier: clientIpFrom(req.headers) });
    if (!limit.allowed) return NextResponse.json({ error: "Too many registrations from this connection. Please try again later or WhatsApp us." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
    const db = getPrisma();
    if (await db.salesPartner.findUnique({ where: { phone: phoneN }, select: { seq: true } })) {
      return NextResponse.json({ error: "This number is already registered as a partner. Our team will be in touch." }, { status: 409 });
    }
    const id = await db.$transaction(async (tx) => {
      const row = await tx.salesPartner.create({
        data: { ...rest, phone: phoneN, id: `tmp-${crypto.randomUUID()}`, email: email || null, clientCategories: clientCategories || null, experience: experience || null, referralSource: referralSource || null },
      });
      const code = `AILU-SP-${String(row.seq).padStart(6, "0")}`;
      await tx.salesPartner.update({ where: { seq: row.seq }, data: { id: code } });
      return code;
    });
    return NextResponse.json({ id });
  } catch (e) {
    // Two registrations with the same phone at the same moment: the database's unique phone rule stops the second.
    if ((e as { code?: string })?.code === "P2002") return NextResponse.json({ error: "This number is already registered as a partner. Our team will be in touch." }, { status: 409 });
    console.error("partner save failed", e);
    return NextResponse.json({ error: "Something went wrong saving your registration. Please WhatsApp us." }, { status: 500 });
  }
}
