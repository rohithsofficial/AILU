import { NextResponse } from "next/server";
import { dbConfigured, getPrisma } from "@/lib/db";
import { enquirySchema, normalizePhone } from "@/lib/validation";
import { checkPublicRateLimit, clientIpFrom, PUBLIC_RATE_LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the highlighted fields.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ id: "AILU-EVT-000000" }); // honeypot: pretend success

  if (!dbConfigured()) return NextResponse.json({ error: "Enquiries are not switched on yet. Please call or WhatsApp us.", fields: undefined }, { status: 503 });

  const { website, email, eventDate, budget, services, details, referralId, consent, phone, ...rest } = parsed.data; void website; void consent;
  const phoneN = normalizePhone(phone);
  try {
    if (!process.env.RATE_LIMIT_SALT) return NextResponse.json({ error: "Enquiries are temporarily unavailable. Please call or WhatsApp us." }, { status: 503 });
    const ipLimit = await checkPublicRateLimit({ ...PUBLIC_RATE_LIMITS.enquiryIp, identifier: clientIpFrom(req.headers) });
    if (!ipLimit.allowed) return NextResponse.json({ error: "Too many enquiries from this connection. Please try again later or contact AILU." }, { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds) } });
    const phoneLimit = await checkPublicRateLimit({ ...PUBLIC_RATE_LIMITS.enquiryPhone, identifier: phoneN });
    if (!phoneLimit.allowed) return NextResponse.json({ error: "Too many enquiries from this number. Please try again later or contact AILU." }, { status: 429, headers: { "Retry-After": String(phoneLimit.retryAfterSeconds) } });
    const db = getPrisma();

    // A referral only counts for a real, active partner, and never when the partner refers themselves.
    // Anything else is ignored quietly so the form never reveals which IDs exist.
    let referredBySpId: string | null = null;
    if (referralId) {
      const sp = await db.salesPartner.findUnique({ where: { id: referralId.toUpperCase() } });
      if (sp && sp.phone !== phoneN && sp.status !== "REJECTED" && sp.status !== "SUSPENDED") referredBySpId = sp.id;
    }

    const id = await db.$transaction(async (tx) => {
      const row = await tx.eventEnquiry.create({
        data: { ...rest, phone: phoneN, id: `tmp-${crypto.randomUUID()}`, email: email || null, eventDate: eventDate || null, budget: budget || null, services: services || null, details: details || null, referredBySpId },
      });
      const code = `AILU-EVT-${String(row.seq).padStart(6, "0")}`;
      await tx.eventEnquiry.update({ where: { seq: row.seq }, data: { id: code } });
      return code;
    });
    return NextResponse.json({ id });
  } catch (e) {
    console.error("enquiry save failed", e);
    return NextResponse.json({ error: "Something went wrong saving your enquiry. Please call or WhatsApp us." }, { status: 500 });
  }
}
