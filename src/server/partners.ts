import { Prisma, type PrismaClient } from "@prisma/client";
import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { parseINRToPaise, MAX_PAISE } from "@/lib/money";
import { commissionEligibilityIssues, canTransitionCommission, partnerStatusError } from "@/lib/a3Rules";

const partnerStatuses = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const;
const commissionStatuses = ["PENDING_APPROVAL", "APPROVED", "PAID", "REJECTED"] as const;
const modes = ["CASH", "UPI", "BANK_TRANSFER", "CARD", "CHEQUE", "OTHER"] as const;
const pageSize = 25;

export async function listPartners(params: { q?: string; status?: string; page?: number }) {
  const where: Prisma.SalesPartnerWhereInput = {};
  if ((partnerStatuses as readonly string[]).includes(params.status ?? "")) where.status = params.status as (typeof partnerStatuses)[number];
  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [
      { id: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q.replace(/\D/g, "") } }, { city: { contains: q, mode: "insensitive" } },
    ];
  }
  const page = Math.max(1, Math.min(10000, Math.floor(params.page ?? 1) || 1));
  const [total, rows] = await Promise.all([
    getPrisma().salesPartner.count({ where }),
    getPrisma().salesPartner.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, select: { id: true, name: true, phone: true, city: true, status: true, createdAt: true } }),
  ]);
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getPartner(id: string, includeCommissions: boolean) {
  const db = getPrisma();
  const partner = await db.salesPartner.findUnique({ where: { id } });
  if (!partner) return null;
  const [enquiries, clientEvents, commissions] = await Promise.all([
    db.eventEnquiry.findMany({ where: { referredBySpId: id }, orderBy: { createdAt: "desc" }, include: { event: { select: { id: true, title: true, status: true } } } }),
    db.event.findMany({ where: { client: { referredBySpId: id } }, orderBy: { createdAt: "desc" }, select: { id: true, title: true, status: true } }),
    includeCommissions ? db.commission.findMany({ where: { partnerId: id }, orderBy: [{ eventId: "asc" }, { version: "desc" }], include: { event: { select: { id: true, title: true, status: true } } } }) : Promise.resolve([]),
  ]);
  const events = new Map(clientEvents.map((event) => [event.id, event]));
  for (const enquiry of enquiries) if (enquiry.event) events.set(enquiry.event.id, enquiry.event);
  return { partner, enquiries, events: [...events.values()], commissions };
}

export async function updatePartnerStatus(actor: { id: string }, id: string, fd: FormData) {
  const parsed = z.object({ status: z.enum(partnerStatuses), reason: z.string().trim().max(500), internalNotes: z.string().trim().max(3000) }).safeParse({
    status: String(fd.get("status") ?? ""), reason: String(fd.get("reason") ?? ""), internalNotes: String(fd.get("internalNotes") ?? ""),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the partner update.");
  const old = await getPrisma().salesPartner.findUnique({ where: { id } });
  if (!old) throw new Error("That sales partner does not exist.");
  const issue = partnerStatusError(old.status, parsed.data.status, parsed.data.reason);
  if (issue) throw new Error(issue);
  const decided = parsed.data.status !== old.status;
  const result = await getPrisma().salesPartner.update({ where: { id }, data: {
    status: parsed.data.status,
    internalNotes: parsed.data.internalNotes || null,
    ...(decided ? { decidedById: actor.id, decidedAt: new Date() } : {}),
  } });
  await audit(actor, "partner.updated", "SalesPartner", id, { from: old.status, to: result.status, reason: parsed.data.reason || undefined, fields: ["status", "internalNotes"] });
  return result;
}

type EligibilityDb = Pick<PrismaClient, "event" | "salesPartner" | "payment" | "quotation">;
async function commissionEligibility(db: EligibilityDb, eventId: string, partnerId: string) {
  const [event, partner, acceptedQuote, payments] = await Promise.all([
    db.event.findUnique({ where: { id: eventId }, select: { id: true, status: true, client: { select: { referredBySpId: true } }, enquiry: { select: { referredBySpId: true } } } }),
    db.salesPartner.findUnique({ where: { id: partnerId }, select: { id: true, status: true } }),
    db.quotation.findFirst({ where: { eventId, status: "ACCEPTED" }, orderBy: { version: "desc" }, select: { totalPaise: true } }),
    db.payment.aggregate({ where: { eventId, direction: "IN" }, _sum: { amountPaise: true } }),
  ]);
  const referredPartnerIds = [...new Set([event?.client.referredBySpId, event?.enquiry?.referredBySpId].filter((value): value is string => !!value))];
  const receivedPaise = payments._sum.amountPaise ?? 0;
  const balanceDuePaise = Math.max(0, (acceptedQuote?.totalPaise ?? 0) - receivedPaise);
  const issues = commissionEligibilityIssues({
    partnerId, eventExists: !!event, partnerExists: !!partner, referredPartnerIds, partnerStatus: partner?.status ?? null,
    eventStatus: event?.status ?? null, hasAcceptedQuote: !!acceptedQuote, balanceDuePaise,
  });
  return { issues, event, partner, acceptedQuotePaise: acceptedQuote?.totalPaise ?? null, receivedPaise, balanceDuePaise, referredPartnerIds };
}

export async function checkCommissionEligibility(eventId: string, partnerId: string) {
  const result = await commissionEligibility(getPrisma(), eventId, partnerId);
  return result;
}

export async function referralPartnersForEvent(eventId: string) {
  const event = await getPrisma().event.findUnique({ where: { id: eventId }, select: { client: { select: { referredBySpId: true } }, enquiry: { select: { referredBySpId: true } } } });
  if (!event) return [];
  const ids = [...new Set([event.client.referredBySpId, event.enquiry?.referredBySpId].filter((value): value is string => !!value))];
  if (!ids.length) return [];
  return getPrisma().salesPartner.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, status: true } });
}

export async function commissionsForEvent(eventId: string) {
  return getPrisma().commission.findMany({ where: { eventId }, orderBy: [{ version: "desc" }], include: { partner: { select: { id: true, name: true, status: true } } } });
}

export async function proposeCommission(actor: { id: string }, eventId: string, fd: FormData) {
  const parsed = z.object({ partnerId: z.string().min(1), amount: z.string().trim().min(1).max(30), basis: z.string().trim().min(5).max(1200) }).safeParse({
    partnerId: String(fd.get("partnerId") ?? ""), amount: String(fd.get("amount") ?? ""), basis: String(fd.get("basis") ?? ""),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the commission proposal.");
  const amountPaise = parseINRToPaise(parsed.data.amount);
  if (amountPaise === null || amountPaise <= 0 || amountPaise > MAX_PAISE) throw new Error("Enter a valid positive amount in rupees.");
  const db = getPrisma();
  return db.$transaction(async (tx) => {
    const eligible = await commissionEligibility(tx, eventId, parsed.data.partnerId);
    if (eligible.issues.length) throw new Error(eligible.issues.join(" "));
    const latest = await tx.commission.findFirst({ where: { eventId, partnerId: parsed.data.partnerId }, orderBy: { version: "desc" } });
    if (latest && latest.status !== "REJECTED") throw new Error("A commission proposal already exists for this partner and event.");
    const commission = await tx.commission.create({ data: {
      eventId, partnerId: parsed.data.partnerId, amountPaise, basis: parsed.data.basis,
      proposedById: actor.id, version: (latest?.version ?? 0) + 1,
    } });
    await tx.auditLog.create({ data: { actorId: actor.id, action: "commission.proposed", entity: "Commission", entityId: commission.id, diff: { eventId, partnerId: parsed.data.partnerId, amountPaise, version: commission.version } } });
    await tx.activity.create({ data: { kind: "NOTE", byId: actor.id, eventId, body: `Partner reward proposal v${commission.version} submitted for owner review.` } });
    return commission;
  });
}

export async function decideCommission(actor: { id: string }, id: string, decision: "APPROVED" | "REJECTED", reason: string) {
  if (decision === "REJECTED" && reason.trim().length < 3) throw new Error("Add a reason when rejecting a commission.");
  const db = getPrisma();
  return db.$transaction(async (tx) => {
    const commission = await tx.commission.findUnique({ where: { id }, include: { partner: { select: { status: true, name: true } } } });
    if (!commission) throw new Error("That commission proposal does not exist.");
    if (!canTransitionCommission(commission.status, decision)) throw new Error(`A commission cannot move from ${commission.status} to ${decision}.`);
    if (decision === "APPROVED") {
      if (commission.proposedById === actor.id) throw new Error("A different owner must approve this proposal.");
      if (commission.partner.status !== "APPROVED") throw new Error("A rejected or suspended partner cannot have a commission approved.");
    }
    const updated = await tx.commission.update({ where: { id }, data: { status: decision, decidedById: actor.id, decidedAt: new Date(), rejectionReason: decision === "REJECTED" ? reason.trim() : null } });
    await tx.auditLog.create({ data: { actorId: actor.id, action: decision === "APPROVED" ? "commission.approved" : "commission.rejected", entity: "Commission", entityId: id, diff: { from: commission.status, to: decision, reason: decision === "REJECTED" ? reason.trim() : undefined } } });
    await tx.activity.create({ data: { kind: "STATUS", byId: actor.id, eventId: commission.eventId, body: `Partner reward proposal ${decision === "APPROVED" ? "approved" : "rejected"} for ${commission.partner.name}.${decision === "REJECTED" ? ` Reason: ${reason.trim()}` : ""}` } });
    return updated;
  });
}

export async function payCommission(actor: { id: string }, id: string, fd: FormData) {
  const parsed = z.object({ paidOn: z.string(), paymentMode: z.enum(modes), paymentReference: z.string().trim().max(120) }).safeParse({ paidOn: String(fd.get("paidOn") ?? ""), paymentMode: String(fd.get("paymentMode") ?? ""), paymentReference: String(fd.get("paymentReference") ?? "") });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the payment details.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed.data.paidOn)) throw new Error("Enter a valid payment date.");
  const paidOn = new Date(`${parsed.data.paidOn}T00:00:00.000Z`);
  if (Number.isNaN(paidOn.getTime()) || paidOn.toISOString().slice(0, 10) !== parsed.data.paidOn) throw new Error("Enter a valid payment date.");
  const db = getPrisma();
  return db.$transaction(async (tx) => {
    const old = await tx.commission.findUnique({ where: { id } });
    if (!old) throw new Error("That commission proposal does not exist.");
    if (!canTransitionCommission(old.status, "PAID")) throw new Error(`A commission cannot move from ${old.status} to PAID.`);
    const result = await tx.commission.update({ where: { id }, data: { status: "PAID", paidOn, paymentMode: parsed.data.paymentMode, paymentReference: parsed.data.paymentReference || null, paidById: actor.id } });
    await tx.auditLog.create({ data: { actorId: actor.id, action: "commission.paid", entity: "Commission", entityId: id, diff: { from: old.status, to: "PAID", paidOn, paymentMode: result.paymentMode } } });
    await tx.activity.create({ data: { kind: "STATUS", byId: actor.id, eventId: old.eventId, body: "Approved partner reward marked as paid." } });
    return result;
  });
}

export async function listCommissions(params: { status?: string; partnerId?: string; page?: number }) {
  const where: Prisma.CommissionWhereInput = {};
  if ((commissionStatuses as readonly string[]).includes(params.status ?? "")) where.status = params.status as (typeof commissionStatuses)[number];
  if (params.partnerId) where.partnerId = params.partnerId;
  const page = Math.max(1, Math.min(10000, Math.floor(params.page ?? 1) || 1));
  const [total, rows, totals] = await Promise.all([
    getPrisma().commission.count({ where }),
    getPrisma().commission.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, include: { partner: { select: { id: true, name: true, status: true } }, event: { select: { id: true, title: true, status: true } } } }),
    getPrisma().commission.groupBy({ by: ["status"], _count: { _all: true }, _sum: { amountPaise: true } }),
  ]);
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / pageSize)), totals };
}
