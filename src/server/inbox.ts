import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { logActivity } from "@/server/activity";

export async function listEnquiries(params: { q?: string; status?: string; spam?: string; conversion?: string; owner?: string; staffId?: string; page?: number }) {
  const db = getPrisma();
  const where: Prisma.EventEnquiryWhereInput = {};
  if (params.spam === "only") where.spam = true;
  else if (params.spam !== "all") where.spam = false; // default: hide spam
  if (params.staffId) where.AND = [{ OR: [{ ownerId: params.staffId }, { ownerId: null }] }];
  if (params.owner === "unassigned") where.ownerId = null;
  if (params.conversion === "unconverted") where.eventId = null;
  else if (params.conversion === "converted") where.eventId = { not: null };
  if (params.status) where.status = params.status as Prisma.EnumEnquiryStatusFilter;
  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q.replace(/\D/g, "") } },
      { id: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
    ];
  }
  const PAGE = 25;
  const [total, rows] = await Promise.all([
    db.eventEnquiry.count({ where }),
    db.eventEnquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: ((params.page ?? 1) - 1) * PAGE,
      take: PAGE,
      include: { event: { select: { id: true, title: true, status: true } } },
    }),
  ]);
  return { rows, total, pages: Math.max(1, Math.ceil(total / PAGE)), page: params.page ?? 1 };
}

export async function getEnquiry(id: string) {
  const db = getPrisma();
  const enquiry = await db.eventEnquiry.findUnique({ where: { id }, include: { event: { select: { id: true, title: true, status: true } } } });
  if (!enquiry) return null;
  const tasks = await db.task.findMany({ where: { enquiryId: id }, orderBy: [{ doneAt: "asc" }, { createdAt: "desc" }] });
  const activity = await db.activity.findMany({ where: { enquiryId: id }, orderBy: { at: "desc" }, take: 100 });
  return { enquiry, tasks, activity };
}

export async function setEnquirySpam(actor: { id: string }, enquiryId: string, spam: boolean) {
  const db = getPrisma();
  const updated = await db.eventEnquiry.update({ where: { id: enquiryId }, data: { spam } });
  await audit({ id: actor.id }, spam ? "enquiry.marked_spam" : "enquiry.marked_not_spam", "EventEnquiry", enquiryId);
  return updated;
}

export async function setEnquiryOwner(actor: { id: string }, enquiryId: string, ownerId: string) {
  const db = getPrisma();
  const owner = ownerId.trim();
  if (owner && !(await getPrisma().staffUser.findFirst({ where: { id: owner, active: true } }))) {
    throw new Error("That staff member does not exist.");
  }
  const updated = await db.eventEnquiry.update({ where: { id: enquiryId }, data: { ownerId: owner || null } });
  await audit({ id: actor.id }, "enquiry.owner_assigned", "EventEnquiry", enquiryId, { ownerId: updated.ownerId });
  await logActivity("NOTE", updated.ownerId ? "Enquiry assigned to a staff member" : "Enquiry unassigned", { enquiryId }, actor.id);
  return updated;
}

export async function setEnquiryStatus(actor: { id: string }, enquiryId: string, status: string) {
  const db = getPrisma();
  const allowed = ["SUBMITTED", "UNDER_REVIEW", "QUOTATION_PREPARED", "AWAITING_CUSTOMER", "PAYMENT_PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
  if (!allowed.includes(status)) throw new Error("That status does not exist.");
  const existing = await db.eventEnquiry.findUnique({ where: { id: enquiryId } });
  if (!existing) throw new Error("That enquiry does not exist.");
  const updated = await db.eventEnquiry.update({ where: { id: enquiryId }, data: { status: status as "SUBMITTED" } });
  await audit({ id: actor.id }, "enquiry.status_changed", "EventEnquiry", enquiryId, { from: existing.status, to: status });
  await logActivity("STATUS", `Enquiry status changed: ${existing.status} → ${status}`, { clientId: existing.clientId, eventId: existing.eventId, enquiryId }, actor.id);
  return updated;
}

export async function listActiveStaff() {
  return getPrisma().staffUser.findMany({ where: { active: true }, orderBy: [{ role: "asc" }, { name: "asc" }], select: { id: true, name: true, email: true, role: true } });
}
