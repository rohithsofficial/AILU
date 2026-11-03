import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { logActivity } from "@/server/activity";
import { formatINR } from "@/lib/money";
import { EVENT_CATEGORIES } from "@/lib/events";

// Quotations: versions with line items. Totals are always computed on the server from the items.

const itemSchema = z.object({
  description: z.string().trim().min(2, "Describe the line item").max(300),
  quantity: z.coerce.number().int().min(1).max(10000),
  unitPrice: z.coerce.number().min(0).max(100000000),
});

const quotationSchema = z.object({
  items: z.array(itemSchema).min(1, "Add at least one line item"),
  discount: z.coerce.number().min(0).max(100000000).default(0),
  tax: z.coerce.number().min(0).max(100000000).default(0),
  validUntil: z.string().trim().max(20).optional(),
  terms: z.string().trim().max(2000).optional(),
});

export async function listQuotations(eventId: string) {
  return getPrisma().quotation.findMany({ where: { eventId }, orderBy: { version: "desc" }, include: { items: true } });
}

export async function createQuotation(actor: { id: string }, eventId: string, fd: FormData) {
  const db = getPrisma();
  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("That event does not exist.");

  // Items arrive as six parallel arrays from the dynamic form.
  const descriptions = fd.getAll("itemDescription").map(String);
  const quantities = fd.getAll("itemQuantity").map(String);
  const unitPrices = fd.getAll("itemUnitPrice").map(String);
  const draftItems = descriptions
    .map((description, i) => ({ description, quantity: quantities[i], unitPrice: unitPrices[i] }))
    .filter((it) => it.description.trim() !== "" || String(it.unitPrice ?? "").trim() !== "");

  const parsed = quotationSchema.safeParse({
    items: draftItems,
    discount: String(fd.get("discount") ?? "0") || "0",
    tax: String(fd.get("tax") ?? "0") || "0",
    validUntil: String(fd.get("validUntil") ?? "") || undefined,
    terms: String(fd.get("terms") ?? "") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the quotation details.");

  const items = parsed.data.items.map((it) => ({ description: it.description, quantity: it.quantity, unitPricePaise: Math.round(it.unitPrice * 100) }));
  const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unitPricePaise, 0);
  const discountPaise = Math.round(parsed.data.discount * 100);
  const taxPaise = Math.round(parsed.data.tax * 100);
  const totalPaise = Math.max(0, subtotal - discountPaise) + taxPaise;

  const created = await db.$transaction(async (tx) => {
    const [{ _max } = { _max: { version: 0 as number } }] = await Promise.all([tx.quotation.aggregate({ where: { eventId }, _max: { version: true } })]);
    const version = (_max.version ?? 0) + 1;
    const quote = await tx.quotation.create({
      data: {
        eventId,
        version,
        validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
        discountPaise,
        taxPaise,
        totalPaise,
        terms: parsed.data.terms || null,
        items: { create: items },
      },
      include: { items: true },
    });
    return quote;
  });

  await audit({ id: actor.id }, "quotation.created", "Quotation", created.id, { eventId, version: created.version, totalPaise });
  await logActivity("NOTE", `Quotation v${created.version} created — total ${formatINR(created.totalPaise)}`, { eventId, clientId: event.clientId }, actor.id);
  return created;
}

export async function setQuotationStatus(actor: { id: string }, quotationId: string, status: string) {
  const db = getPrisma();
  const existing = await db.quotation.findUnique({ where: { id: quotationId }, include: { event: { select: { id: true, clientId: true } } } });
  if (!existing) throw new Error("That quotation does not exist.");
  const allowed: string[] = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"];
  if (!allowed.includes(status)) throw new Error("That status does not exist.");
  const updated = await db.quotation.update({ where: { id: quotationId }, data: { status: status as "DRAFT" } });
  await audit({ id: actor.id }, "quotation.status_changed", "Quotation", quotationId, { from: existing.status, to: status });
  await logActivity("STATUS", `Quotation v${existing.version} marked ${status}`, { eventId: existing.event.id, clientId: existing.event.clientId }, actor.id);
  return updated;
}

// Quotation form building blocks
export const CATEGORY_OPTIONS = EVENT_CATEGORIES.map((c) => ({ value: c.slug, label: c.title }));
