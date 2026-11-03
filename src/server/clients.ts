import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { normalizePhone } from "@/lib/validation";
import { audit } from "@/lib/audit";

// Client logic for phase A1 (CRM_CMS_PLAN.md section 4.2). Phones are the dedupe key.

const idCode = (seq: number) => `AILU-CLI-${String(seq).padStart(6, "0")}`;

export async function listClients(params: { q?: string; page?: number; includeArchived?: boolean }) {
  const db = getPrisma();
  const q = params.q?.trim();
  const where: Prisma.ClientWhereInput = {};
  if (!params.includeArchived) where.archivedAt = null;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { companyName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q.replace(/\D/g, "") } },
      { city: { contains: q, mode: "insensitive" } },
      { id: { contains: q, mode: "insensitive" } },
    ];
  }
  const PAGE = 25;
  const [total, rows] = await Promise.all([
    db.client.count({ where }),
    db.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: ((params.page ?? 1) - 1) * PAGE,
      take: PAGE,
      include: { events: { select: { id: true, status: true } } },
    }),
  ]);
  return { rows, total, pages: Math.max(1, Math.ceil(total / PAGE)), page: params.page ?? 1 };
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

const clientInput = (fd: FormData) => ({
  type: String(fd.get("type") ?? "INDIVIDUAL") as "INDIVIDUAL" | "COMPANY" | "COMMUNITY",
  name: String(fd.get("name") ?? "").trim(),
  companyName: String(fd.get("companyName") ?? "").trim() || null,
  phoneRaw: String(fd.get("phone") ?? ""),
  altPhone: String(fd.get("altPhone") ?? "").trim() || null,
  email: String(fd.get("email") ?? "").trim() || null,
  city: String(fd.get("city") ?? "").trim() || null,
  address: String(fd.get("address") ?? "").trim() || null,
  gstin: String(fd.get("gstin") ?? "").trim() || null,
  source: String(fd.get("source") ?? "OTHER") as "WEBSITE" | "PARTNER" | "REFERRAL" | "WALK_IN" | "SOCIAL" | "OTHER",
  referredBySpId: String(fd.get("referredBySpId") ?? "").trim().toUpperCase() || null,
  notes: String(fd.get("notes") ?? "").trim() || null,
  consentToContact: fd.get("consentToContact") === "on",
});

export async function createClient(actor: { id: string }, fd: FormData) {
  const db = getPrisma();
  const input = clientInput(fd);
  if (input.name.length < 2) throw new Error("Enter the client name.");
  const phone = normalizePhone(input.phoneRaw);
  const existing = await db.client.findUnique({ where: { phone } });
  if (existing) throw new Error(`A client with this phone already exists: ${existing.id} (${existing.name}).`);
  const { phoneRaw, ...rest } = input;
  const created = await db.$transaction(async (tx) => {
    const row = await tx.client.create({
      data: { ...rest, phone, tags: [], id: `tmp-${crypto.randomUUID()}` },
    });
    return tx.client.update({ where: { seq: row.seq }, data: { id: idCode(row.seq) } });
  });
  await audit({ id: actor.id }, "client.created", "Client", created.id, { name: created.name });
  return created;
}

export async function updateClient(actor: { id: string }, clientId: string, fd: FormData) {
  const db = getPrisma();
  const existing = await db.client.findUnique({ where: { id: clientId } });
  if (!existing) throw new Error("That client does not exist.");
  const input = clientInput(fd);
  if (input.name.length < 2) throw new Error("Enter the client name.");
  const phone = normalizePhone(input.phoneRaw);
  if (phone !== existing.phone) {
    const clash = await db.client.findUnique({ where: { phone } });
    if (clash) throw new Error(`Another client already uses that phone: ${clash.id}.`);
  }
  const { phoneRaw, ...rest } = input;
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

// Used by the inbox "Convert enquiry" flow: find or create the client for a phone number.
export async function upsertClientFromEnquiry(
  actor: { id: string },
  data: { name: string; phone: string; email?: string | null; location?: string | null; referredBySpId?: string | null },
) {
  const db = getPrisma();
  const phone = normalizePhone(data.phone);
  const existing = await db.client.findUnique({ where: { phone } });
  if (existing) return existing;
  const created = await db.$transaction(async (tx) => {
    const row = await tx.client.create({
      data: {
        name: data.name,
        phone,
        email: data.email || null,
        city: data.location || null,
        source: (data.referredBySpId ? "PARTNER" : "WEBSITE") as "WEBSITE" | "PARTNER",
        referredBySpId: data.referredBySpId || null,
        consentToContact: true, // they submitted a website enquiry asking us to contact them
        tags: [],
        id: `tmp-${crypto.randomUUID()}`,
      },
    });
    return tx.client.update({ where: { seq: row.seq }, data: { id: idCode(row.seq) } });
  });
  await audit({ id: actor.id }, "client.created", "Client", created.id, { from: "enquiry" });
  return created;
}
