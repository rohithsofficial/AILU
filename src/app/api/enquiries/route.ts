import { NextResponse } from "next/server";
import { dbConfigured, prisma } from "@/lib/db";
import { enquirySchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the highlighted fields.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ id: "AILU-EVT-000000" }); // honeypot: pretend success

  if (!dbConfigured()) return NextResponse.json({ error: "Enquiries are not switched on yet. Please call or WhatsApp us." }, { status: 503 });

  const { website, email, eventDate, budget, services, details, ...rest } = parsed.data; void website;
  try {
    const id = await prisma.$transaction(async (tx) => {
      const row = await tx.eventEnquiry.create({
        data: { ...rest, id: `tmp-${crypto.randomUUID()}`, email: email || null, eventDate: eventDate || null, budget: budget || null, services: services || null, details: details || null },
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
