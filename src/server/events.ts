// Database logic for events: list, create, edit, status changes, and converting a website enquiry into a client and an event.
import type { EventEnquiry, Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { phoneFilter } from "@/lib/search";
import { parseINRToPaise } from "@/lib/money";
import { audit } from "@/lib/audit";
import { logActivity } from "@/server/activity";
import { EVENT_STATUSES, type EventStatusValue, canTransitionEventStatus } from "@/lib/eventStatus";
import { EVENT_CATEGORIES } from "@/lib/events";
import { normalizePhone } from "@/lib/validation";
import { upsertClientForManualEvent } from "@/server/clients";
import { indianPhoneSchema } from "@/lib/validation";
import { z } from "zod";

const idCode = (seq: number) => `AILU-EVENT-${String(seq).padStart(6, "0")}`;
const clientIdCode = (seq: number) => `AILU-CLI-${String(seq).padStart(6, "0")}`;
const safeISODate = (value: string | null): Date | null => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
};

export function buildConvertedEventData(
  enquiry: Pick<EventEnquiry, "id" | "category" | "eventDate" | "location" | "guests" | "budget" | "services" | "details">,
  clientId: string,
  ownerId: string | null,
  title: string,
): Prisma.EventUncheckedCreateInput {
  return {
    clientId, enquiryId: enquiry.id, title, category: enquiry.category, status: "LEAD",
    startDate: safeISODate(enquiry.eventDate),
    venueCity: enquiry.location, guestCount: enquiry.guests,
    requirements: [enquiry.budget ? `Budget: ${enquiry.budget}` : null, enquiry.services, enquiry.details].filter(Boolean).join(" | ") || null,
    ownerId, id: `tmp-${crypto.randomUUID()}`,
  };
}

export async function listEvents(params: { q?: string; status?: string; category?: string; ownerId?: string; dateFrom?: string; dateTo?: string; includeArchived?: boolean; page?: number }) {
  const db = getPrisma();
  const where: Prisma.EventWhereInput = params.includeArchived ? {} : { archivedAt: null };
  if (params.status && EVENT_STATUSES.includes(params.status as EventStatusValue)) where.status = params.status as EventStatusValue;
  if (params.category && EVENT_CATEGORIES.some((category) => category.slug === params.category)) where.category = params.category;
  if (params.ownerId) where.ownerId = params.ownerId;
  const startDate: Prisma.DateTimeNullableFilter = {};
  if (params.dateFrom && !Number.isNaN(new Date(params.dateFrom).getTime())) startDate.gte = new Date(params.dateFrom);
  if (params.dateTo && !Number.isNaN(new Date(params.dateTo).getTime())) startDate.lte = new Date(params.dateTo);
  if (startDate.gte || startDate.lte) where.startDate = startDate;
  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { id: { contains: q, mode: "insensitive" } },
      { client: { name: { contains: q, mode: "insensitive" } } },
      ...phoneFilter(q).map((phone) => ({ client: phone })),
      { venueCity: { contains: q, mode: "insensitive" } },
    ];
  }
  const PAGE = 25;
  const page = Math.max(1, Math.min(10000, Math.floor(params.page ?? 1) || 1));
  const [total, rows] = await Promise.all([
    db.event.count({ where }),
    db.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE,
      take: PAGE,
      include: {
        client: { select: { id: true, name: true, phone: true } },
        quotations: { orderBy: { version: "desc" }, take: 1, select: { totalPaise: true, status: true, version: true } },
      },
    }),
  ]);
  return { rows, total, pages: Math.max(1, Math.ceil(total / PAGE)), page };
}

export async function getEvent(id: string) {
  return getPrisma().event.findUnique({
    where: { id },
    include: { client: true, quotations: { orderBy: { version: "desc" }, include: { items: true } } },
  });
}

export async function activityForEvent(eventId: string) {
  return getPrisma().activity.findMany({ where: { eventId }, orderBy: { at: "desc" }, take: 100 });
}

export async function tasksForEvent(eventId: string) {
  return getPrisma().task.findMany({ where: { eventId }, orderBy: [{ doneAt: "asc" }, { createdAt: "desc" }], take: 100 });
}

const categorySlugs = EVENT_CATEGORIES.map((category) => category.slug) as [string, ...string[]];
const dateText = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date")]).refine((value) => {
  if (!value) return true;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "Enter a valid date");
const nullableNumber = z.union([z.literal(""), z.coerce.number().int().min(1).max(100000)]);
const eventFormSchema = z.object({
  title: z.string().trim().min(2, "Give the event a title.").max(160),
  category: z.enum(categorySlugs),
  tradition: z.string().trim().max(120),
  status: z.enum(EVENT_STATUSES),
  lostReason: z.string().trim().max(500),
  startDate: dateText,
  endDate: dateText,
  venueName: z.string().trim().max(160), venueCity: z.string().trim().max(100), venueAddress: z.string().trim().max(500),
  guestCount: nullableNumber,
  budget: z.string().trim().max(40),
  requirements: z.string().trim().max(4000), internalNotes: z.string().trim().max(4000),
  ownerId: z.string().trim().max(100),
});

function eventFields(fd: FormData) {
  const parsed = eventFormSchema.safeParse({
    title: String(fd.get("title") ?? ""), category: String(fd.get("category") ?? ""),
    tradition: String(fd.get("tradition") ?? ""), status: String(fd.get("status") ?? "LEAD"),
    lostReason: String(fd.get("lostReason") ?? ""), startDate: String(fd.get("startDate") ?? ""), endDate: String(fd.get("endDate") ?? ""),
    venueName: String(fd.get("venueName") ?? ""), venueCity: String(fd.get("venueCity") ?? ""), venueAddress: String(fd.get("venueAddress") ?? ""),
    guestCount: String(fd.get("guestCount") ?? ""), budget: String(fd.get("budget") ?? ""),
    requirements: String(fd.get("requirements") ?? ""), internalNotes: String(fd.get("internalNotes") ?? ""),
    ownerId: String(fd.get("ownerId") ?? ""),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the event details.");
  const budgetPaise = parsed.data.budget ? parseINRToPaise(parsed.data.budget) : null;
  if (parsed.data.budget && budgetPaise === null) throw new Error("Enter a valid budget amount in rupees.");
  const startDate = parsed.data.startDate ? new Date(`${parsed.data.startDate}T00:00:00.000Z`) : null;
  const endDate = parsed.data.endDate ? new Date(`${parsed.data.endDate}T00:00:00.000Z`) : null;
  if (startDate && endDate && endDate < startDate) throw new Error("The end date must be on or after the start date.");
  if (parsed.data.status === "LOST" || parsed.data.status === "CANCELLED") {
    if (!parsed.data.lostReason) throw new Error("Add a reason when an event is lost or cancelled.");
  }
  return {
    title: parsed.data.title, category: parsed.data.category,
    tradition: parsed.data.tradition || null,
    status: parsed.data.status as EventStatusValue,
    lostReason: parsed.data.lostReason || null,
    startDate, endDate,
    venueName: parsed.data.venueName || null,
    venueCity: parsed.data.venueCity || null,
    venueAddress: parsed.data.venueAddress || null,
    guestCount: parsed.data.guestCount === "" ? null : Number(parsed.data.guestCount),
    budgetPaise,
    requirements: parsed.data.requirements || null,
    internalNotes: parsed.data.internalNotes || null,
    ownerId: parsed.data.ownerId || null,
  };
}

async function createEventWithClient(actor: { id: string }, fields: ReturnType<typeof eventFields>, clientId: string) {
  const db = getPrisma();
  const created = await db.$transaction(async (tx) => {
    const row = await tx.event.create({
      data: {
        ...fields,
        status: fields.status as EventStatusValue,
        clientId,
        id: `tmp-${crypto.randomUUID()}`,
      },
    });
    return tx.event.update({ where: { seq: row.seq }, data: { id: idCode(row.seq) } });
  });
  return created;
}

export async function createEvent(actor: { id: string; role?: string }, fd: FormData) {
  const db = getPrisma();
  const fields = eventFields(fd);
  if (fields.title.length < 2) throw new Error("Give the event a title.");

  let clientId = String(fd.get("clientId") ?? "").trim();
  if (!clientId) {
    const clientName = String(fd.get("clientName") ?? "").trim();
    const phoneParsed = indianPhoneSchema.safeParse(String(fd.get("clientPhone") ?? ""));
    if (clientName.length < 2) throw new Error("Enter the new client's name.");
    if (!phoneParsed.success) throw new Error("Enter a valid Indian mobile number for the client.");
    const created = await upsertClientForManualEvent(actor, {
      name: clientName,
      phone: phoneParsed.data,
      location: fields.venueCity,
      ownerId: fields.ownerId || (actor.role === "STAFF" ? actor.id : null),
    });
    clientId = created.id;
  }
  const client = await db.client.findUnique({ where: { id: clientId } });
  if (!client) throw new Error("That client does not exist.");
  if (client.archivedAt) throw new Error("Restore this client before creating an event.");
  if (fields.ownerId && !(await db.staffUser.findFirst({ where: { id: fields.ownerId, active: true } }))) throw new Error("Choose an active staff owner.");

  const created = await createEventWithClient(actor, { ...fields, status: "LEAD" }, clientId);
  await audit({ id: actor.id }, "event.created", "Event", created.id, { title: created.title, clientId });
  await logActivity("NOTE", `Event created: ${created.title}`, { eventId: created.id, clientId }, actor.id);
  return created;
}

export async function updateEvent(actor: { id: string }, eventId: string, fd: FormData) {
  const db = getPrisma();
  const existing = await db.event.findUnique({ where: { id: eventId } });
  if (!existing) throw new Error("That event does not exist.");
  const fields = eventFields(fd);
  if (fields.title.length < 2) throw new Error("Give the event a title.");
  if (fields.ownerId && !(await db.staffUser.findFirst({ where: { id: fields.ownerId, active: true } }))) throw new Error("Choose an active staff owner.");
  const updated = await db.event.update({ where: { id: eventId }, data: { ...fields, status: existing.status, lostReason: existing.lostReason } });
  await audit({ id: actor.id }, "event.updated", "Event", eventId, { title: updated.title });
  return updated;
}

export async function setEventStatus(actor: { id: string }, eventId: string, status: string, lostReason?: string) {
  const db = getPrisma();
  const existing = await db.event.findUnique({ where: { id: eventId } });
  if (!existing) throw new Error("That event does not exist.");
  if (!(EVENT_STATUSES as readonly string[]).includes(status)) throw new Error("That status does not exist.");
  if (!canTransitionEventStatus(existing.status, status as EventStatusValue)) {
    throw new Error(`The event cannot move from ${existing.status} to ${status}.`);
  }
  const data: Prisma.EventUpdateInput = { status: status as import("@/lib/eventStatus").EventStatusValue };
  if (status === "LOST" || status === "CANCELLED") {
    const reason = lostReason?.trim() || existing.lostReason;
    if (!reason) throw new Error("Note the reason so the team can learn from it.");
    data.lostReason = reason;
  }
  const updated = await db.event.update({ where: { id: eventId }, data });
  await audit({ id: actor.id }, "event.status_changed", "Event", eventId, { from: existing.status, to: updated.status });
  const reason = (status === "LOST" || status === "CANCELLED") && updated.lostReason ? ` (${updated.lostReason})` : "";
  await logActivity("STATUS", `Status changed: ${existing.status} → ${updated.status}${reason}`, { eventId, clientId: updated.clientId }, actor.id);
  return updated;
}

export async function setEventArchived(actor: { id: string }, eventId: string, archived: boolean) {
  const db = getPrisma();
  const updated = await db.event.update({ where: { id: eventId }, data: { archivedAt: archived ? new Date() : null } });
  await audit({ id: actor.id }, archived ? "event.archived" : "event.unarchived", "Event", eventId);
  return updated;
}

// Converts a website enquiry into (maybe) a client + one event. Refuses double conversion.
export async function convertEnquiry(actor: { id: string; role?: string }, enquiryId: string, fd: FormData) {
  const db = getPrisma();
  const titleInput = String(fd.get("title") ?? "").trim();
  const ownerId = String(fd.get("ownerId") ?? "").trim() || null;
  const result = await db.$transaction(async (tx) => {
    const enquiry = await tx.eventEnquiry.findUnique({ where: { id: enquiryId } });
    if (!enquiry) throw new Error("That enquiry does not exist.");
    if (enquiry.eventId) throw new Error(`Already converted (event ${enquiry.eventId}).`);
    const titleParsed = z.string().trim().max(160).safeParse(titleInput);
    if (!titleParsed.success) throw new Error("Event title is too long.");
    const title = titleParsed.data || `${getCategoryTitle(enquiry.category)} for ${enquiry.name}`;
    if (ownerId && !(await tx.staffUser.findFirst({ where: { id: ownerId, active: true } }))) throw new Error("Choose an active staff owner.");
    let client = await tx.client.findUnique({ where: { phone: normalizePhone(enquiry.phone) } });
    if (client?.ownerId && actor.role === "STAFF" && client.ownerId !== actor.id) throw new Error("This client is assigned to another staff member.");
    if (!client) {
      const row = await tx.client.create({ data: {
        id: `tmp-${crypto.randomUUID()}`,
        name: enquiry.name,
        phone: normalizePhone(enquiry.phone),
        email: enquiry.email,
        city: enquiry.location,
        source: enquiry.referredBySpId ? "PARTNER" : "WEBSITE",
        referredBySpId: enquiry.referredBySpId,
        ownerId: ownerId || (actor.role === "STAFF" ? actor.id : null),
        consentToContact: true,
        tags: [],
      } });
      client = await tx.client.update({ where: { seq: row.seq }, data: { id: clientIdCode(row.seq) } });
    } else if (!client.ownerId && (ownerId || actor.role === "STAFF")) {
      client = await tx.client.update({ where: { id: client.id }, data: { ownerId: ownerId || actor.id } });
    }
    const row = await tx.event.create({ data: buildConvertedEventData(enquiry, client.id, ownerId, title) });
    const event = await tx.event.update({ where: { seq: row.seq }, data: { id: idCode(row.seq) } });
    await tx.eventEnquiry.update({ where: { id: enquiry.id }, data: { clientId: client.id, eventId: event.id, ownerId } });
    return { enquiry, client, event };
  });

  await audit({ id: actor.id }, "enquiry.converted", "EventEnquiry", result.enquiry.id, { clientId: result.client.id, eventId: result.event.id });
  await logActivity("NOTE", `Converted from enquiry ${result.enquiry.id} → ${result.event.id}`, { eventId: result.event.id, clientId: result.client.id }, actor.id);
  return { client: result.client, event: result.event };
}

function getCategoryTitle(slug: string) {
  return EVENT_CATEGORIES.find((c) => c.slug === slug)?.title ?? "Event";
}
