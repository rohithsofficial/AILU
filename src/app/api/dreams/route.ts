// POST /api/dreams: saves a private dream. Closed unless DREAMS_FORM_OPEN=true.
// Never log the request, the dream text or contact details.
import { NextResponse } from "next/server";
import { createDreamSubmission, hasRecentDuplicateDream } from "@/server/dreams";
import { dbConfigured } from "@/lib/db";
import { dreamSubmissionSchema, normalizePhone } from "@/lib/validation";
import { checkPublicRateLimit, clientIpFrom, PUBLIC_RATE_LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (process.env.DREAMS_FORM_OPEN !== "true") return NextResponse.json({ error: "Private dream submissions are not open yet." }, { status: 503 });
  if (!dbConfigured()) return NextResponse.json({ error: "Private dream submissions are temporarily unavailable." }, { status: 503 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = dreamSubmissionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the highlighted fields and remove any sensitive information.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ id: "AILU-DRM-000000" }); // honeypot: do not create a record

  try {
    if (!process.env.RATE_LIMIT_SALT) return NextResponse.json({ error: "Private dream submissions are temporarily unavailable." }, { status: 503 });
    const ipLimit = await checkPublicRateLimit({ ...PUBLIC_RATE_LIMITS.dreamIp, identifier: clientIpFrom(req.headers) });
    if (!ipLimit.allowed) return NextResponse.json({ error: "Too many submissions from this connection today. Please try again tomorrow." }, { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds) } });

    const contacts = parsed.data.isMinor
      ? [{ identifier: `phone:${normalizePhone(parsed.data.guardianPhone!.trim())}` }]
      : [
          ...(parsed.data.contactPhone?.trim() ? [{ identifier: `phone:${normalizePhone(parsed.data.contactPhone.trim())}` }] : []),
          ...(parsed.data.contactEmail?.trim() ? [{ identifier: `email:${parsed.data.contactEmail.trim().toLowerCase()}` }] : []),
        ];
    for (const contact of contacts) {
      const contactLimit = await checkPublicRateLimit({ ...PUBLIC_RATE_LIMITS.dreamContact, identifier: contact.identifier });
      if (!contactLimit.allowed) return NextResponse.json({ error: "Too many submissions for this contact today. Please try again tomorrow." }, { status: 429, headers: { "Retry-After": String(contactLimit.retryAfterSeconds) } });
    }

    if (await hasRecentDuplicateDream(parsed.data)) return NextResponse.json({ error: "A very similar dream was already shared with AILU in the last 24 hours. Please wait before sending it again." }, { status: 409 });
    const id = await createDreamSubmission(parsed.data);
    return NextResponse.json({ id });
  } catch {
    // Never log request data, submitted text, contact details, or database error payloads.
    return NextResponse.json({ error: "We could not save this submission right now. Please try again later." }, { status: 500 });
  }
}
