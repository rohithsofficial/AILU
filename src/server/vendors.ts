import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { logActivity } from "@/server/activity";
import { parseINRToPaise, MAX_PAISE } from "@/lib/money";
import { normalizePhone, indianPhoneSchema } from "@/lib/validation";
import { calculateEventFinancials } from "@/lib/eventFinance";

const vendorIdCode = (seq: number) => `AILU-VEN-${String(seq).padStart(6, "0")}`;
const optional = (max: number) => z.string().trim().max(max).optional().default("");
const vendorSchema = z.object({
  name: z.string().trim().min(2).max(160), category: z.string().trim().min(2).max(80),
  contactPerson: optional(120), phone: indianPhoneSchema, altPhone: optional(30), email: z.union([z.literal(""), z.string().trim().email().max(254)]).optional().default(""),
  city: optional(100), address: optional(500), gstin: optional(30), rateNotes: optional(1000),
  rating: z.union([z.literal(""), z.coerce.number().int().min(1).max(5)]).optional().default(""),
  status: z.enum(["ACTIVE", "INACTIVE", "DO_NOT_USE"]), tags: optional(500), notes: optional(2000), upiId: optional(100),
});

function parseVendor(fd: FormData) {
  const result = vendorSchema.safeParse(Object.fromEntries([
    "name", "category", "contactPerson", "phone", "altPhone", "email", "city", "address", "gstin", "rateNotes", "rating", "status", "tags", "notes", "upiId",
  ].map((key) => [key, String(fd.get(key) ?? "")])));
  if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Check the vendor details.");
  const d = result.data;
  return {
    name: d.name, category: d.category, contactPerson: d.contactPerson || null,
    phone: normalizePhone(d.phone), altPhone: d.altPhone || null, email: d.email || null,
    city: d.city || null, address: d.address || null, gstin: d.gstin || null, rateNotes: d.rateNotes || null,
    rating: d.rating === "" ? null : Number(d.rating), status: d.status,
    tags: d.tags ? d.tags.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 20) : [],
    notes: d.notes || null, upiId: d.upiId || null,
  };
}

export async function listVendors(params: { q?: string; category?: string; status?: string; includeArchived?: boolean } = {}) {
  const where: import("@prisma/client").Prisma.VendorWhereInput = params.includeArchived ? {} : { archivedAt: null };
  if (["ACTIVE", "INACTIVE", "DO_NOT_USE"].includes(params.status ?? "")) where.status = params.status as "ACTIVE" | "INACTIVE" | "DO_NOT_USE";
  if (params.category) where.category = params.category;
  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { phone: { contains: q.replace(/\D/g, "") } },
    ];
  }
  return getPrisma().vendor.findMany({ where, orderBy: [{ status: "asc" }, { name: "asc" }], take: 300 });
}

export async function getVendor(id: string) {
  return getPrisma().vendor.findUnique({ where: { id }, include: { bookings: { orderBy: { createdAt: "desc" }, take: 100, include: { event: { select: { id: true, title: true, status: true } }, payments: true } } } });
}

export async function vendorActivities(vendorId: string) {
  return getPrisma().activity.findMany({ where: { vendorId }, orderBy: { at: "desc" }, take: 100 });
}

export async function addVendorNote(actor: { id: string }, vendorId: string, raw: string) {
  const note = z.string().trim().min(2, "Add a note.").max(2000, "Keep the note under 2,000 characters.").safeParse(raw);
  if (!note.success) throw new Error(note.error.issues[0]?.message ?? "Check the note.");
  const exists = await getPrisma().vendor.findUnique({ where: { id: vendorId }, select: { id: true } });
  if (!exists) throw new Error("That vendor does not exist.");
  const result = await getPrisma().activity.create({ data: { kind: "NOTE", body: note.data, byId: actor.id, vendorId } });
  await audit(actor, "vendor.note_added", "Vendor", vendorId, { fields: ["note"] });
  return result;
}

export async function createVendor(actor: { id: string }, fd: FormData) {
  const data = parseVendor(fd);
  const result = await getPrisma().$transaction(async (tx) => {
    const created = await tx.vendor.create({ data: { ...data, id: `tmp-${crypto.randomUUID()}` } });
    return tx.vendor.update({ where: { seq: created.seq }, data: { id: vendorIdCode(created.seq) } });
  });
  await audit(actor, "vendor.created", "Vendor", result.id, { fields: ["name", "category", "status"] });
  await logActivity("NOTE", "Vendor added to directory.", { vendorId: result.id }, actor.id);
  return result;
}

export async function updateVendor(actor: { id: string; role?: string }, id: string, fd: FormData) {
  const data = parseVendor(fd);
  if (actor.role !== "OWNER" && actor.role !== "ACCOUNTS") {
    const existing = await getPrisma().vendor.findUnique({ where: { id }, select: { upiId: true } });
    data.upiId = existing?.upiId ?? null;
  }
  const result = await getPrisma().vendor.update({ where: { id }, data });
  await audit(actor, "vendor.updated", "Vendor", id, { fields: Object.keys(data) });
  await logActivity("NOTE", "Vendor details updated.", { vendorId: id }, actor.id);
  return result;
}

export async function setVendorArchived(actor: { id: string }, id: string, archived: boolean) {
  const result = await getPrisma().vendor.update({ where: { id }, data: { archivedAt: archived ? new Date() : null } });
  await audit(actor, archived ? "vendor.archived" : "vendor.restored", "Vendor", id);
  return result;
}

const amountSchema = z.string().trim().min(1, "Enter an amount.").max(30);
function amountPaise(raw: string) {
  const parsed = amountSchema.safeParse(raw);
  const amount = parsed.success ? parseINRToPaise(parsed.data) : null;
  if (amount === null || amount > MAX_PAISE) throw new Error("Enter a valid amount in rupees.");
  return amount;
}
function validDate(raw: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw new Error("Enter a valid date.");
  const d = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== raw) throw new Error("Enter a valid date.");
  return d;
}

export async function createVendorBooking(actor: { id: string }, eventId: string, fd: FormData) {
  const parsed = z.object({ vendorId: z.string().min(1), service: z.string().trim().min(2).max(160), amount: z.string().max(30), status: z.enum(["ENQUIRED", "QUOTED", "CONFIRMED", "DONE", "CANCELLED"]), notes: z.string().trim().max(1000) }).safeParse({
    vendorId: String(fd.get("vendorId") ?? ""), service: String(fd.get("service") ?? ""), amount: String(fd.get("amount") ?? ""), status: String(fd.get("status") ?? "ENQUIRED"), notes: String(fd.get("notes") ?? ""),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the vendor booking.");
  const vendor = await getPrisma().vendor.findFirst({ where: { id: parsed.data.vendorId, archivedAt: null, status: "ACTIVE" } });
  if (!vendor) throw new Error("Choose an active vendor.");
  const booking = await getPrisma().vendorBooking.create({ data: { eventId, vendorId: vendor.id, service: parsed.data.service, agreedAmountPaise: parsed.data.amount ? amountPaise(parsed.data.amount) : null, status: parsed.data.status, notes: parsed.data.notes || null } });
  await audit(actor, "vendor_booking.created", "VendorBooking", booking.id, { eventId, vendorId: vendor.id, fields: ["service", "agreedAmountPaise", "status"] });
  await logActivity("NOTE", `Vendor booking added: ${vendor.name} — ${booking.service}.`, { eventId, vendorId: vendor.id }, actor.id);
  return booking;
}

export async function setVendorBookingStatus(actor: { id: string }, bookingId: string, status: string) {
  if (!(["ENQUIRED", "QUOTED", "CONFIRMED", "DONE", "CANCELLED"] as const).includes(status as never)) throw new Error("That booking status is not valid.");
  const result = await getPrisma().vendorBooking.update({ where: { id: bookingId }, data: { status: status as "ENQUIRED" | "QUOTED" | "CONFIRMED" | "DONE" | "CANCELLED" }, include: { vendor: true } });
  await audit(actor, "vendor_booking.status_changed", "VendorBooking", bookingId, { status });
  await logActivity("STATUS", `Vendor booking status changed to ${status}: ${result.vendor.name}.`, { eventId: result.eventId, vendorId: result.vendorId }, actor.id);
  return result;
}

export async function createPayment(actor: { id: string }, eventId: string, fd: FormData) {
  const eventExists = await getPrisma().event.findUnique({ where: { id: eventId }, select: { id: true } });
  if (!eventExists) throw new Error("That event does not exist.");
  const parsed = z.object({ direction: z.enum(["IN", "OUT"]), purpose: z.string().trim().max(80), amount: amountSchema, mode: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CARD", "CHEQUE", "OTHER"]), reference: z.string().trim().max(120), paidOn: z.string(), vendorBookingId: z.string().max(100), assignmentId: z.string().max(100), note: z.string().trim().max(500) }).safeParse({
    direction: String(fd.get("direction") ?? ""), purpose: String(fd.get("purpose") ?? ""), amount: String(fd.get("amount") ?? ""), mode: String(fd.get("mode") ?? ""), reference: String(fd.get("reference") ?? ""), paidOn: String(fd.get("paidOn") ?? ""), vendorBookingId: String(fd.get("vendorBookingId") ?? ""), assignmentId: String(fd.get("assignmentId") ?? ""), note: String(fd.get("note") ?? ""),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the payment details.");
  const bookingId = parsed.data.vendorBookingId || null;
  const assignmentId = parsed.data.assignmentId || null;
  if (!assignmentId && parsed.data.purpose.length < 2) throw new Error("Enter a payment purpose.");
  if (bookingId && assignmentId) throw new Error("Choose either a vendor booking or a team assignment.");
  if (assignmentId && parsed.data.direction !== "OUT") throw new Error("Team fee payments must be recorded as outgoing payments.");
  if (parsed.data.direction === "IN" && bookingId) throw new Error("Client receipts cannot be linked to a vendor booking.");
  if (bookingId) {
    const booking = await getPrisma().vendorBooking.findUnique({ where: { id: bookingId }, select: { eventId: true } });
    if (!booking || booking.eventId !== eventId) throw new Error("That vendor booking does not belong to this event.");
  }
  if (assignmentId) {
    const assignment = await getPrisma().eventAssignment.findUnique({ where: { id: assignmentId }, select: { eventId: true } });
    if (!assignment || assignment.eventId !== eventId) throw new Error("That team assignment does not belong to this event.");
  }
  const result = await getPrisma().payment.create({ data: { eventId, direction: parsed.data.direction, purpose: assignmentId ? "TEAM_FEE" : parsed.data.purpose, amountPaise: amountPaise(parsed.data.amount), mode: parsed.data.mode, reference: parsed.data.reference || null, paidOn: validDate(parsed.data.paidOn), vendorBookingId: bookingId, assignmentId, recordedById: actor.id, note: parsed.data.note || null } });
  await audit(actor, "payment.recorded", "Payment", result.id, { eventId, direction: result.direction, amountPaise: result.amountPaise, fields: ["direction", "purpose", "amountPaise", "mode", "paidOn"] });
  await logActivity("NOTE", `${result.direction === "IN" ? "Client receipt" : "Vendor payment"} recorded: ₹${(result.amountPaise / 100).toFixed(2)}.`, { eventId }, actor.id);
  return result;
}

export async function createExpense(actor: { id: string }, eventId: string, fd: FormData) {
  const eventExists = await getPrisma().event.findUnique({ where: { id: eventId }, select: { id: true } });
  if (!eventExists) throw new Error("That event does not exist.");
  const parsed = z.object({ category: z.string().trim().min(2).max(80), amount: amountSchema, spentOn: z.string(), vendorBookingId: z.string().max(100), note: z.string().trim().max(500) }).safeParse({
    category: String(fd.get("category") ?? ""), amount: String(fd.get("amount") ?? ""), spentOn: String(fd.get("spentOn") ?? ""), vendorBookingId: String(fd.get("vendorBookingId") ?? ""), note: String(fd.get("note") ?? ""),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the expense details.");
  const bookingId = parsed.data.vendorBookingId || null;
  if (bookingId) {
    const booking = await getPrisma().vendorBooking.findUnique({ where: { id: bookingId }, select: { eventId: true } });
    if (!booking || booking.eventId !== eventId) throw new Error("That vendor booking does not belong to this event.");
  }
  const result = await getPrisma().expense.create({ data: { eventId, category: parsed.data.category, amountPaise: amountPaise(parsed.data.amount), spentOn: validDate(parsed.data.spentOn), vendorBookingId: bookingId, note: parsed.data.note || null, recordedById: actor.id } });
  await audit(actor, "expense.recorded", "Expense", result.id, { eventId, amountPaise: result.amountPaise, fields: ["category", "amountPaise", "spentOn"] });
  await logActivity("NOTE", `Expense recorded: ${result.category}, ₹${(result.amountPaise / 100).toFixed(2)}.`, { eventId }, actor.id);
  return result;
}

export async function eventFinancials(eventId: string) {
  const [event, payments, expenses, bookings, assignments, commissions] = await Promise.all([
    getPrisma().event.findUnique({ where: { id: eventId }, select: { id: true, quotations: { where: { status: "ACCEPTED" }, orderBy: { version: "desc" }, take: 1, select: { totalPaise: true } } } }),
    getPrisma().payment.findMany({ where: { eventId }, orderBy: { paidOn: "desc" }, include: { vendorBooking: { include: { vendor: { select: { id: true, name: true } } } }, assignment: { include: { teamMember: { select: { id: true, name: true } } } } } }),
    getPrisma().expense.findMany({ where: { eventId }, orderBy: { spentOn: "desc" }, include: { vendorBooking: { include: { vendor: { select: { id: true, name: true } } } } } }),
    getPrisma().vendorBooking.findMany({ where: { eventId, status: { not: "CANCELLED" } }, orderBy: { createdAt: "desc" }, include: { vendor: { select: { id: true, name: true, category: true } } } }),
    getPrisma().eventAssignment.findMany({ where: { eventId }, select: { id: true, feePaise: true, status: true } }),
    getPrisma().commission.findMany({ where: { eventId, status: { in: ["APPROVED", "PAID"] } }, select: { amountPaise: true } }),
  ]);
  return {
    payments, expenses, bookings,
    ...calculateEventFinancials({ acceptedQuotePaise: event?.quotations[0]?.totalPaise ?? 0, payments, expenses, bookings, assignments, approvedCommissionPaise: commissions.reduce((sum, commission) => sum + commission.amountPaise, 0) }),
  };
}

export async function vendorBookingsForEvent(eventId: string) {
  return getPrisma().vendorBooking.findMany({
    where: { eventId, status: { not: "CANCELLED" } }, orderBy: { createdAt: "desc" },
    select: { id: true, eventId: true, vendorId: true, service: true, status: true, notes: true, createdAt: true, vendor: { select: { id: true, name: true, category: true } } },
  });
}
