import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { phoneFilter } from "@/lib/search";
import { indianPhoneSchema, normalizePhone } from "@/lib/validation";
import { audit } from "@/lib/audit";
import { z } from "zod";

// Client logic for phase A1 (docs/CRM_CMS_PLAN.md section 4.2). Phones are the dedupe key.

const idCode = (seq: number) => `AILU-CLI-${String(seq).padStart(6, "0")}`;

export async function listClients(params: { q?: string; type?: string; tag?: string; ownerId?: string; page?: number; includeArchived?: boolean }) {
  const db = getPrisma();
  const q = params.q?.trim();
  const where: Prisma.ClientWhereInput = {};
  if (!params.includeArchived) where.archivedAt = null;
  if (params.ownerId) where.ownerId = params.ownerId;
  if (["INDIVIDUAL", "COMPANY", "COMMUNITY"].includes(params.type ?? "")) where.type = params.type as "INDIVIDUAL" | "COMPANY" | "COMMUNITY";
  if (params.tag?.trim()) where.tags = { has: params.tag.trim() };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { companyName: { contains: q, mode: "insensitive" } },
      ...phoneFilter(q),
      { city: { contains: q, mode: "insensitive" } },
      { id: { contains: q, mode: "insensitive" } },
    ];
  }
  const PAGE = 25;
  const page = Math.max(1, Math.min(10000, Math.floor(params.page ?? 1) || 1));
  const [total, rows] = await Promise.all([
    db.client.count({ where }),
    db.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE,
      take: PAGE,
      include: { events: { select: { id: true, status: true } } },
    }),
  ]);
  return { rows, total, pages: Math.max(1, Math.ceil(total / PAGE)), page };
}

export async function getClient(id: string) {
  const db = getPrisma();
  return db.client.findUnique({
    where: { id },
    include: {
      events: { orderBy: { createdAt: "desc" } },
      contacts: { orderBy: { name: "asc" } },
    },
  });
}

export async function enquiriesForClient(clientId: string) {
  return getPrisma().eventEnquiry.findMany({ where: { clientId }, orderBy: { createdAt: "desc" } });
}

export async function activityForClient(clientId: string) {
  return getPrisma().activity.findMany({ where: { clientId }, orderBy: { at: "desc" }, take: 100 });
}

export async function tasksForClient(clientId: string) {
  return getPrisma().task.findMany({ where: { clientId }, orderBy: [{ doneAt: "asc" }, { createdAt: "desc" }], take: 100 });
}

const emptyToNull = (max: number) => z.string().trim().max(max).transform((value) => value || null);
const clientSchema = z.object({
  type: z.enum(["INDIVIDUAL", "COMPANY", "COMMUNITY"]),
  name: z.string().trim().min(2, "Enter the client name.").max(120),
  companyName: emptyToNull(120),
  phone: indianPhoneSchema,
  altPhone: z.union([z.literal(""), indianPhoneSchema]).optional().transform((value) => value || null),
  email: z.union([z.literal(""), z.string().trim().email().max(120)]).optional().transform((value) => value || null),
  city: emptyToNull(100), address: emptyToNull(300), gstin: emptyToNull(20),
  source: z.enum(["WEBSITE", "PARTNER", "REFERRAL", "WALK_IN", "SOCIAL", "OTHER"]),
  referredBySpId: z.union([z.literal(""), z.string().trim().toUpperCase().regex(/^AILU-SP-\d{6}$/)]).optional().transform((value) => value || null),
  ownerId: z.string().trim().max(100),
  tags: z.string().max(500).transform((value) => [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))].slice(0, 20)),
  notes: emptyToNull(2000), consentToContact: z.boolean(),
});

const clientInput = (fd: FormData) => {
  const parsed = clientSchema.safeParse({
    type: String(fd.get("type") ?? "INDIVIDUAL"), name: String(fd.get("name") ?? ""),
    companyName: String(fd.get("companyName") ?? ""), phone: String(fd.get("phone") ?? ""),
    altPhone: String(fd.get("altPhone") ?? ""), email: String(fd.get("email") ?? ""),
    city: String(fd.get("city") ?? ""), address: String(fd.get("address") ?? ""), gstin: String(fd.get("gstin") ?? ""),
    source: String(fd.get("source") ?? "OTHER"), referredBySpId: String(fd.get("referredBySpId") ?? ""),
    tags: String(fd.get("tags") ?? ""), ownerId: String(fd.get("ownerId") ?? ""),
    notes: String(fd.get("notes") ?? ""), consentToContact: fd.get("consentToContact") === "on",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the client details.");
  return parsed.data;
};

export async function createClient(actor: { id: string; role?: string }, fd: FormData) {
  const db = getPrisma();
  const input = clientInput(fd);
  if (actor.role === "STAFF") input.ownerId = actor.id;
  if (input.ownerId && !(await db.staffUser.findFirst({ where: { id: input.ownerId, active: true } }))) throw new Error("Choose an active staff owner.");
  const phone = normalizePhone(input.phone);
  const existing = await db.client.findUnique({ where: { phone } });
  if (existing) throw new Error(`A client with this phone already exists: ${existing.id} (${existing.name}).`);
  const { phone: _rawPhone, ...rest } = input;
  const created = await db.$transaction(async (tx) => {
    const row = await tx.client.create({
      data: { ...rest, phone, id: `tmp-${crypto.randomUUID()}` },
    });
    return tx.client.update({ where: { seq: row.seq }, data: { id: idCode(row.seq) } });
  });
  await audit({ id: actor.id }, "client.created", "Client", created.id, { name: created.name });
  return created;
}

export async function updateClient(actor: { id: string; role?: string }, clientId: string, fd: FormData) {
  const db = getPrisma();
  const existing = await db.client.findUnique({ where: { id: clientId } });
  if (!existing) throw new Error("That client does not exist.");
  const input = clientInput(fd);
  if (actor.role === "STAFF") input.ownerId = existing.ownerId ?? "";
  if (input.ownerId && !(await db.staffUser.findFirst({ where: { id: input.ownerId, active: true } }))) throw new Error("Choose an active staff owner.");
  const phone = normalizePhone(input.phone);
  if (phone !== existing.phone) {
    const clash = await db.client.findUnique({ where: { phone } });
    if (clash) throw new Error(`Another client already uses that phone: ${clash.id}.`);
  }
  const { phone: _rawPhone, ...rest } = input;
  const updated = await db.client.update({ where: { id: clientId }, data: { ...rest, phone } });
  await audit({ id: actor.id }, "client.updated", "Client", clientId, { name: updated.name });
  return updated;
}

export async function setClientArchived(actor: { id: string }, clientId: string, archived: boolean) {
  const db = getPrisma();
  const updated = await db.client.update({ where: { id: clientId }, data: { archivedAt: archived ? new Date() : null } });
  await audit({ id: actor.id }, archived ? "client.archived" : "client.unarchived", "Client", clientId);
  return updated;
}

export async function addClientNote(actor: { id: string }, clientId: string, note: string) {
  const db = getPrisma();
  const trimmed = note.trim();
  if (!trimmed) throw new Error("Nothing to add.");
  const updated = await db.client.update({ where: { id: clientId }, data: { notes: trimmed } });
  await audit({ id: actor.id }, "client.note_updated", "Client", clientId);
  return updated;
}

// Used only by the staff-only manual event form; it does not imply website consent.
export async function upsertClientForManualEvent(
  actor: { id: string; role?: string },
  data: { name: string; phone: string; location?: string | null; ownerId?: string | null },
) {
  const db = getPrisma();
  const phone = normalizePhone(data.phone);
  const existing = await db.client.findUnique({ where: { phone } });
  if (existing) {
    if (actor.role === "STAFF" && existing.ownerId && existing.ownerId !== actor.id) throw new Error("This client is assigned to another staff member.");
    const assignTo = data.ownerId || (actor.role === "STAFF" ? actor.id : null);
    if (!existing.ownerId && assignTo) return db.client.update({ where: { id: existing.id }, data: { ownerId: assignTo } });
    return existing;
  }
  const created = await db.$transaction(async (tx) => {
    const row = await tx.client.create({
      data: {
        name: data.name,
        phone,
        city: data.location || null,
        source: "OTHER",
        ownerId: data.ownerId || (actor.role === "STAFF" ? actor.id : null),
        consentToContact: false,
        tags: [],
        id: `tmp-${crypto.randomUUID()}`,
      },
    });
    return tx.client.update({ where: { seq: row.seq }, data: { id: idCode(row.seq) } });
  });
  await audit({ id: actor.id }, "client.created", "Client", created.id, { from: "manual_event" });
  return created;
}
