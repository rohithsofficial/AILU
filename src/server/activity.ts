import type { StaffRole } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { canChangeNote } from "@/lib/recordRules";

// Timeline entries (calls, WhatsApp, meetings, notes, status changes). CRM_CMS_PLAN.md section 5.
export async function logActivity(
  kind: "CALL" | "WHATSAPP" | "MEETING" | "NOTE" | "STATUS",
  body: string,
  links: { clientId?: string | null; eventId?: string | null; enquiryId?: string | null; vendorId?: string | null },
  byId?: string | null,
) {
  await getPrisma().activity.create({
    data: { kind, body, byId: byId ?? null, clientId: links.clientId ?? null, eventId: links.eventId ?? null, enquiryId: links.enquiryId ?? null, vendorId: links.vendorId ?? null },
  });
}

async function changeableNote(actor: { id: string; role: StaffRole }, id: string) {
  const note = await getPrisma().activity.findUnique({ where: { id } });
  if (!note) throw new Error("That note no longer exists.");
  if (!canChangeNote(actor, note)) throw new Error("You cannot change this note.");
  return note;
}

export async function updateNote(actor: { id: string; role: StaffRole }, id: string, body: string) {
  const text = body.trim();
  if (text.length < 2 || text.length > 2000) throw new Error("Write a note between 2 and 2000 characters.");
  await changeableNote(actor, id);
  await getPrisma().activity.update({ where: { id }, data: { body: text } });
  await audit(actor, "activity.updated", "Activity", id);
}

export async function deleteNote(actor: { id: string; role: StaffRole }, id: string) {
  const note = await changeableNote(actor, id);
  await getPrisma().activity.delete({ where: { id } });
  await audit(actor, "activity.deleted", "Activity", id, { kind: note.kind });
}
