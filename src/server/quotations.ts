import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { logActivity } from "@/server/activity";
import { formatINR, quotationTotalPaise, parseINRToPaise } from "@/lib/money";
import { EVENT_CATEGORIES } from "@/lib/events";
import { quotationDeleteError } from "@/lib/recordRules";

// Quotations: versions with line items. Totals are always computed on the server from the items.

const itemSchema = z.object({
  description: z.string().trim().min(2, "Describe the line item").max(300),
  quantity: z.coerce.number().int().min(1).max(10000),
  unitPrice: z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "Enter a price with up to two decimal places").transform((value) => parseINRToPaise(value)).refine((value): value is number => value !== null, "Price is outside the supported range"),
});

const quotationSchema = z.object({
  items: z.array(itemSchema).min(1, "Add at least one line item").max(100),
  discount: z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid discount").transform((value) => parseINRToPaise(value)).refine((value): value is number => value !== null, "Discount is outside the supported range").default("0"),
  tax: z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid tax amount").transform((value) => parseINRToPaise(value)).refine((value): value is number => value !== null, "Tax is outside the supported range").default("0"),
  validUntil: z.string().trim().max(10).optional(),
  terms: z.string().trim().max(2000).optional(),
});

export async function listQuotations(eventId: string) {
  return getPrisma().quotation.findMany({ where: { eventId }, orderBy: { version: "desc" }, include: { items: true } });
}

export async function getQuotation(quotationId: string) {
  return getPrisma().quotation.findUnique({ where: { id: quotationId }, select: { id: true, eventId: true, status: true } });
}

function parseQuotationForm(fd: FormData) {
  const descriptions = fd.getAll("itemDescription").map(String);
  const quantities = fd.getAll("itemQuantity").map(String);
  const unitPrices = fd.getAll("itemUnitPrice").map(String);
  const draftItems = descriptions.map((description, i) => ({ description, quantity: quantities[i], unitPrice: unitPrices[i] }))
    .filter((item) => item.description.trim() !== "" || String(item.unitPrice ?? "").trim() !== "");
  const parsed = quotationSchema.safeParse({
    items: draftItems,
    discount: String(fd.get("discount") ?? "0") || "0",
    tax: String(fd.get("tax") ?? "0") || "0",
    validUntil: String(fd.get("validUntil") ?? "") || undefined,
    terms: String(fd.get("terms") ?? "") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the quotation details.");
  if (parsed.data.validUntil) {
    const date = new Date(`${parsed.data.validUntil}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== parsed.data.validUntil) throw new Error("Enter a valid quotation date.");
  }
  const items = parsed.data.items.map((item) => ({ description: item.description, quantity: item.quantity, unitPricePaise: item.unitPrice }));
  const totalPaise = quotationTotalPaise(items, parsed.data.discount, parsed.data.tax);
  return { parsed: parsed.data, items, totalPaise };
}

export async function createQuotation(actor: { id: string }, eventId: string, fd: FormData) {
  const db = getPrisma();
  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("That event does not exist.");

  const { parsed, items, totalPaise } = parseQuotationForm(fd);

  const created = await db.$transaction(async (tx) => {
    const [{ _max } = { _max: { version: 0 as number } }] = await Promise.all([tx.quotation.aggregate({ where: { eventId }, _max: { version: true } })]);
    const version = (_max.version ?? 0) + 1;
    const quote = await tx.quotation.create({
      data: {
        eventId,
        version,
        validUntil: parsed.validUntil ? new Date(`${parsed.validUntil}T00:00:00.000Z`) : null,
        discountPaise: parsed.discount,
        taxPaise: parsed.tax,
        totalPaise,
        terms: parsed.terms || null,
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

export async function updateQuotation(actor: { id: string }, eventId: string, quotationId: string, fd: FormData) {
  const db = getPrisma();
  const existing = await db.quotation.findUnique({ where: { id: quotationId }, include: { event: { select: { id: true, clientId: true } } } });
  if (!existing || existing.eventId !== eventId) throw new Error("That quotation does not belong to this event.");
  if (existing.status !== "DRAFT") throw new Error("Only draft quotations can be edited. Create a new version instead.");
  const { parsed, items, totalPaise } = parseQuotationForm(fd);
  const updated = await db.$transaction(async (tx) => {
    await tx.quotationItem.deleteMany({ where: { quotationId } });
    return tx.quotation.update({
      where: { id: quotationId },
      data: {
        validUntil: parsed.validUntil ? new Date(`${parsed.validUntil}T00:00:00.000Z`) : null,
        discountPaise: parsed.discount,
        taxPaise: parsed.tax,
        totalPaise,
        terms: parsed.terms || null,
        items: { create: items },
      },
      include: { items: true },
    });
  });
  await audit({ id: actor.id }, "quotation.updated", "Quotation", quotationId, { version: updated.version, totalPaise });
  await logActivity("NOTE", `Quotation v${updated.version} edited — total ${formatINR(updated.totalPaise)}`, { eventId, clientId: existing.event.clientId }, actor.id);
  return updated;
}

export async function deleteQuotation(actor: { id: string }, eventId: string, quotationId: string) {
  const db = getPrisma();
  const quotation = await db.quotation.findUnique({ where: { id: quotationId }, select: { eventId: true, status: true, version: true } });
  if (!quotation || quotation.eventId !== eventId) throw new Error("That quotation does not belong to this event.");
  const blocked = quotationDeleteError(quotation.status);
  if (blocked) throw new Error(blocked);
  await db.$transaction([db.quotationItem.deleteMany({ where: { quotationId } }), db.quotation.delete({ where: { id: quotationId } })]);
  await audit(actor, "quotation.deleted", "Quotation", quotationId, { eventId, version: quotation.version });
  await logActivity("NOTE", `Draft quotation v${quotation.version} deleted.`, { eventId }, actor.id);
}

export async function setQuotationStatus(actor: { id: string }, quotationId: string, status: string) {
  const db = getPrisma();
  const existing = await db.quotation.findUnique({ where: { id: quotationId }, include: { event: { select: { id: true, clientId: true } } } });
  if (!existing) throw new Error("That quotation does not exist.");
  const allowed: string[] = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"];
  if (!allowed.includes(status)) throw new Error("That status does not exist.");
  const result = await db.$transaction(async (tx) => {
    const rejected = status === "ACCEPTED"
      ? await tx.quotation.findMany({ where: { eventId: existing.event.id, id: { not: quotationId }, status: "ACCEPTED" }, select: { id: true, version: true } })
      : [];
    if (status === "ACCEPTED") {
      await tx.quotation.updateMany({ where: { eventId: existing.event.id, id: { not: quotationId }, status: "ACCEPTED" }, data: { status: "REJECTED" } });
    }
    const updated = await tx.quotation.update({ where: { id: quotationId }, data: { status: status as "DRAFT" } });
    return { updated, rejected };
  });
  await audit({ id: actor.id }, "quotation.status_changed", "Quotation", quotationId, { from: existing.status, to: status });
  await logActivity("STATUS", `Quotation v${existing.version} marked ${status}`, { eventId: existing.event.id, clientId: existing.event.clientId }, actor.id);
  for (const item of result.rejected) {
    await audit({ id: actor.id }, "quotation.status_changed", "Quotation", item.id, { from: "ACCEPTED", to: "REJECTED" });
    await logActivity("STATUS", `Quotation v${item.version} marked REJECTED because another version was accepted`, { eventId: existing.event.id, clientId: existing.event.clientId }, actor.id);
  }
  return result.updated;
}

// Quotation form building blocks
export const CATEGORY_OPTIONS = EVENT_CATEGORIES.map((c) => ({ value: c.slug, label: c.title }));
