import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { parseINRToPaise } from "@/lib/money";
import { audit } from "@/lib/audit";
import { logActivity } from "@/server/activity";
import { upsertClientFromEnquiry } from "@/server/clients";
import { EVENT_STATUSES, type EventStatusValue } from "@/lib/eventStatus";
import { EVENT_CATEGORIES } from "@/lib/events";

const idCode = (seq: number) => `AILU-EVENT-${String(seq).padStart(6, "0")}`;

export async function listEvents(params: { q?: string; status?: string; page?: number }) {
  const db = getPrisma();
  const where: Prisma.EventWhereInput = { archivedAt: null };
  if (params.status) where.status = params.status as Prisma.EnumEventStatusFilter;
  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { id: { contains: q, mode: "insensitive" } },
      { client: { name: { contains: q, mode: "insensitive" } } },
      { client: { phone: { contains: q.replace(/\D/g, "") } } },
      { venueCity: { contains: q, mode: "insensitive" } },
    ];
  }
  const PAGE = 25;
  const [total, rows] = await Promise.all([
    db.event.count({ where }),
    db.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: ((params.page ?? 1) - 1) * PAGE,
      take: PAGE,
      include: {
        client: { select: { id: true, name: true, phone: true } },
        quotations: { orderBy: { version: "desc" }, take: 1, select: { totalPaise: true, status: true, version: true } },
      },
    }),
  ]);
  return { rows, total, pages: Math.max(1, Math.ceil(total / PAGE)), page: params.page ?? 1 };
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

const date = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

function eventFields(fd: FormData) {
  const budgetPaise = parseINRToPaise(String(fd.get("budget") ?? ""));
  const guests = Number(String(fd.get("guestCount") ?? "").trim());
  const status = String(fd.get("status") ?? "LEAD");
  return {
    title: String(fd.get("title") ?? "").trim(),
    category: String(fd.get("category") ?? "").trim(),
    tradition: String(fd.get("tradition") ?? "").trim() || null,
    status: (EVENT_STATUSES as readonly string[]).includes(status) ? (status as EventStatusValue) : "LEAD",
    lostReason: String(fd.get("lostReason") ?? "").trim() || null,
    startDate: date(fd.get("startDate")),
    endDate: date(fd.get("endDate")),
    venueName: String(fd.get("venueName") ?? "").trim() || null,
    venueCity: String(fd.get("venueCity") ?? "").trim() || null,
    venueAddress: String(fd.get("venueAddress") ?? "").trim() || null,
    guestCount: Number.isFinite(guests) && guests > 0 ? Math.round(guests) : null,
    budgetPaise: budgetPaise === null ? null : budgetPaise,
    requirements: String(fd.get("requirements") ?? "").trim() || null,
    ownerId: String(fd.get("ownerId") ?? "").trim() || null,
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

export async function createEvent(actor: { id: string }, fd: FormData) {
  const db = getPrisma();
  const fields = eventFields(fd);
  if (fields.title.length < 2) throw new Error("Give the event a title.");

  let clientId = String(fd.get("clientId") ?? "").trim();
  if (!clientId) {
    const created = await upsertClientFromEnquiry(actor, {
      name: String(fd.get("clientName") ?? "").trim(),
      phone: String(fd.get("clientPhone") ?? ""),
      location: fields.venueCity,
    });
    clientId = created.id;
  }
  if (!(await db.client.findUnique({ where: { id: clientId } }))) throw new Error("That client does not exist.");

  const created = await createEventWithClient(actor, fields, clientId);
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
  const updated = await db.event.update({ where: { id: eventId }, data: { ...fields, status: fields.status as EventStatusValue } });
  await audit({ id: actor.id }, "event.updated", "Event", eventId, { title: updated.title });
  return updated;
}

export async function setEventStatus(actor: { id: string }, eventId: string, status: string, lostReason?: string) {
  const db = getPrisma();
  const existing = await db.event.findUnique({ where: { id: eventId } });
  if (!existing) throw new Error("That event does not exist.");
  if (!(EVENT_STATUSES as readonly string[]).includes(status)) throw new Error("That status does not exist.");
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
export async function convertEnquiry(actor: { id: string }, enquiryId: string, fd: FormData) {
  const db = getPrisma();
  const enquiry = await db.eventEnquiry.findUnique({ where: { id: enquiryId } });
  if (!enquiry) throw new Error("That enquiry does not exist.");
  if (enquiry.eventId) throw new Error(`Already converted (event ${enquiry.eventId}).`);
  const title = String(fd.get("title") ?? "").trim() || `${getCategoryTitle(enquiry.category)} for ${enquiry.name}`;
  const ownerId = String(fd.get("ownerId") ?? "").trim() || null;

  const client = await upsertClientFromEnquiry(actor, {
    name: enquiry.name,
    phone: enquiry.phone,
    email: enquiry.email,
    location: enquiry.location,
    referredBySpId: enquiry.referredBySpId,
  });

  const event = await db.$transaction(async (tx) => {
    const row = await tx.event.create({
      data: {
        clientId: client.id,
        enquiryId: enquiry.id,
        title,
        category: enquiry.category,
        status: "LEAD",
        venueCity: enquiry.location,
        guestCount: enquiry.guests,
        requirements: [enquiry.budget ? `Budget: ${enquiry.budget}` : null, enquiry.services, enquiry.details].filter(Boolean).join(" | ") || null,
        ownerId,
        id: `tmp-${crypto.randomUUID()}`,
      },
    });
    await tx.eventEnquiry.update({ where: { id: enquiry.id }, data: { clientId: client.id, eventId: row.id, ownerId } });
    return tx.event.update({ where: { seq: row.seq }, data: { id: idCode(row.seq) } });
  });

  await audit({ id: actor.id }, "enquiry.converted", "EventEnquiry", enquiry.id, { clientId: client.id, eventId: event.id });
  await logActivity("NOTE", `Converted from enquiry ${enquiry.id} → ${event.id}`, { eventId: event.id, clientId: client.id }, actor.id);
  return { client, event };
}

function getCategoryTitle(slug: string) {
  return EVENT_CATEGORIES.find((c) => c.slug === slug)?.title ?? "Event";
}
