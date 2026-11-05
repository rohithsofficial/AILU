import { z } from "zod";
import type { DreamCategory, DreamStatus, StaffRole } from "@prisma/client";
import { audit } from "@/lib/audit";
import type { Staff } from "@/lib/authz";
import { can } from "@/lib/permissions";
import { getPrisma } from "@/lib/db";
import { normalizePhone } from "@/lib/validation";
import { dreamSubmissionAuditDiff, dreamStatusNeedsReason, isDreamTransitionAllowed, isRecentDuplicateDream, DREAM_STATUSES, type DreamStatusValue } from "@/lib/dreams";
import type { DreamSubmissionInput } from "@/lib/validation";

const pageSize = 20;
const reviewSchema = z.object({
  status: z.enum(DREAM_STATUSES),
  statusReason: z.string().trim().max(1000),
  internalNotes: z.string().trim().max(4000),
});

function assertDreamPermission(role: StaffRole, action: "dream.read" | "dream.manage") {
  if (!can(role, action)) throw new Error("Your role does not allow this action.");
}

export async function listDreams(actor: Staff, input: { q?: string; status?: string; category?: string; minor?: string; page?: number }) {
  assertDreamPermission(actor.role, "dream.read");
  const db = getPrisma();
  const requestedPage = input.page ?? 1;
  const page = Number.isFinite(requestedPage) ? Math.min(100000, Math.max(1, Math.floor(requestedPage))) : 1;
  const q = input.q?.trim().slice(0, 80) ?? "";
  const status = DREAM_STATUSES.includes(input.status as DreamStatusValue) ? input.status as DreamStatusValue : undefined;
  const categories = ["MY_DREAM", "FAMILY", "CELEBRATION", "HELPING_SOMEONE", "COMMUNITY", "CREATIVE_IDEA", "SOMETHING_SPECIAL"];
  const category = categories.includes(input.category ?? "") ? input.category as DreamCategory : undefined;
  const isMinor = input.minor === "yes" ? true : input.minor === "no" ? false : undefined;
  const where = {
    ...(status ? { status: status as DreamStatus } : {}),
    ...(category ? { category } : {}),
    ...(isMinor === undefined ? {} : { isMinor }),
    ...(q ? { OR: [{ id: { contains: q, mode: "insensitive" as const } }, { displayName: { contains: q, mode: "insensitive" as const } }] } : {}),
  };
  const [rows, total] = await Promise.all([
    db.dream.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, select: { id: true, category: true, city: true, isMinor: true, status: true, createdAt: true, displayName: true } }),
    db.dream.count({ where }),
  ]);
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getDreamDetail(actor: Staff, id: string) {
  assertDreamPermission(actor.role, "dream.read");
  const dream = await getPrisma().dream.findUnique({ where: { id }, include: { statusHistory: { orderBy: { createdAt: "desc" }, take: 100 } } });
  if (!dream) return null;
  await audit(actor, "dream.viewed", "Dream", id);
  return dream;
}

function normalizedContacts(input: DreamSubmissionInput) {
  if (input.isMinor) return { contactPhone: null, contactEmail: null, guardianPhone: normalizePhone(input.guardianPhone!.trim()) };
  return {
    contactPhone: input.contactPhone?.trim() ? normalizePhone(input.contactPhone.trim()) : null,
    contactEmail: input.contactEmail?.trim() ? input.contactEmail.trim().toLowerCase() : null,
    guardianPhone: null,
  };
}

export async function hasRecentDuplicateDream(input: DreamSubmissionInput, now = new Date()) {
  const contacts = normalizedContacts(input);
  const OR = [
    ...(contacts.contactPhone ? [{ contactPhone: contacts.contactPhone }] : []),
    ...(contacts.contactEmail ? [{ contactEmail: contacts.contactEmail }] : []),
    ...(contacts.guardianPhone ? [{ guardianPhone: contacts.guardianPhone }] : []),
  ];
  if (!OR.length) return false;
  const recent = await getPrisma().dream.findMany({
    where: { createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }, OR },
    select: { dream: true, createdAt: true },
    take: 100,
  });
  return isRecentDuplicateDream(recent, input.dream, now);
}

export async function createDreamSubmission(input: DreamSubmissionInput) {
  const db = getPrisma();
  const contacts = normalizedContacts(input);
  return db.$transaction(async (tx) => {
    const row = await tx.dream.create({
      data: {
        id: `tmp-${crypto.randomUUID()}`,
        displayName: input.displayName?.trim() || null,
        city: input.city.trim(),
        isMinor: input.isMinor,
        guardianName: input.isMinor ? input.guardianName!.trim() : null,
        guardianPhone: contacts.guardianPhone,
        guardianConsent: input.isMinor,
        contactPhone: contacts.contactPhone,
        contactEmail: contacts.contactEmail,
        category: input.category as DreamCategory,
        dream: input.dream.trim(),
        whyItMatters: input.whyItMatters?.trim() || null,
        helpNeeded: input.helpNeeded?.trim() || null,
        consentToContact: input.consentToContact,
      },
    });
    const id = `AILU-DRM-${String(row.seq).padStart(6, "0")}`;
    await tx.dream.update({ where: { seq: row.seq }, data: { id } });
    await tx.dreamStatusChange.create({ data: { dreamId: id, fromStatus: null, toStatus: "SUBMITTED" } });
    await tx.auditLog.create({ data: { actorId: null, action: "dream.submitted", entity: "Dream", entityId: id, diff: dreamSubmissionAuditDiff(input.category, input.isMinor) } });
    return id;
  });
}

export async function updateDreamReview(actor: Staff, id: string, formData: FormData) {
  assertDreamPermission(actor.role, "dream.manage");
  const parsed = reviewSchema.safeParse({
    status: String(formData.get("status") ?? ""),
    statusReason: String(formData.get("statusReason") ?? ""),
    internalNotes: String(formData.get("internalNotes") ?? ""),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the dream update.");
  const nextStatus = parsed.data.status as DreamStatusValue;
  const result = await getPrisma().$transaction(async (tx) => {
    const previous = await tx.dream.findUnique({ where: { id } });
    if (!previous) throw new Error("That dream submission does not exist.");
    if (previous.status !== nextStatus && !isDreamTransitionAllowed(previous.status as DreamStatusValue, nextStatus)) throw new Error("That status change is not allowed.");
    if (dreamStatusNeedsReason(nextStatus) && !parsed.data.statusReason.trim()) throw new Error("Add a reason for this decision.");

    const statusChanged = previous.status !== nextStatus;
    const notes = parsed.data.internalNotes || null;
    const notesChanged = previous.internalNotes !== notes;
    const reason = parsed.data.statusReason || null;
    const reasonChanged = previous.statusReason !== reason;
    if (!statusChanged && !notesChanged && !reasonChanged) return { statusChanged, notesChanged, status: previous.status };

    const updated = await tx.dream.update({
      where: { id },
      data: {
        status: nextStatus as DreamStatus,
        internalNotes: notes,
        statusReason: reason,
        ...(statusChanged ? { decidedById: actor.id, decidedAt: new Date() } : {}),
      },
    });
    if (statusChanged) {
      await tx.dreamStatusChange.create({ data: { dreamId: id, fromStatus: previous.status, toStatus: updated.status, reason: parsed.data.statusReason || null, changedById: actor.id } });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "dream.status_changed", entity: "Dream", entityId: id, diff: { from: previous.status, to: updated.status } } });
    }
    if (notesChanged) await tx.auditLog.create({ data: { actorId: actor.id, action: "dream.notes_updated", entity: "Dream", entityId: id, diff: { internalNotesChanged: true } } });
    if (reasonChanged && !statusChanged) await tx.auditLog.create({ data: { actorId: actor.id, action: "dream.reason_updated", entity: "Dream", entityId: id, diff: { statusReasonChanged: true } } });
    return { statusChanged, notesChanged, status: updated.status };
  });
  return result;
}

const deletionSchema = z.object({ id: z.string().regex(/^AILU-DRM-\d{6}$/), confirmId: z.string(), reason: z.string().trim().min(5).max(500) });
export async function permanentlyDeleteDream(actor: Staff, formData: FormData) {
  if (actor.role !== "OWNER" || !can(actor.role, "dream.manage")) throw new Error("Only the owner can permanently delete a dream submission.");
  const parsed = deletionSchema.safeParse({ id: String(formData.get("id") ?? ""), confirmId: String(formData.get("confirmId") ?? ""), reason: String(formData.get("reason") ?? "") });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the deletion request.");
  if (parsed.data.id !== parsed.data.confirmId) throw new Error("Type the dream reference ID exactly to confirm deletion.");
  const db = getPrisma();
  await db.$transaction(async (tx) => {
    const exists = await tx.dream.findUnique({ where: { id: parsed.data.id }, select: { id: true } });
    if (!exists) throw new Error("That dream submission does not exist.");
    await tx.dream.delete({ where: { id: parsed.data.id } });
    await tx.auditLog.create({ data: { actorId: actor.id, action: "dream.deleted", entity: "Dream", entityId: parsed.data.id, diff: { reason: parsed.data.reason } } });
  });
}
