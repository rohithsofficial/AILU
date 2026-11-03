import { getPrisma } from "@/lib/db";

// Timeline entries (calls, WhatsApp, meetings, notes, status changes). CRM_CMS_PLAN.md section 5.
export async function logActivity(
  kind: "CALL" | "WHATSAPP" | "MEETING" | "NOTE" | "STATUS",
  body: string,
  links: { clientId?: string | null; eventId?: string | null; vendorId?: string | null },
  byId?: string | null,
) {
  await getPrisma().activity.create({
    data: { kind, body, byId: byId ?? null, clientId: links.clientId ?? null, eventId: links.eventId ?? null, vendorId: links.vendorId ?? null },
  });
}
