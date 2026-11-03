// All money is stored as integer paise (plan section 2). INR only. Format at the edge.
export const rupeesToPaise = (rupees: number) => Math.round(rupees * 100);
export const paiseToRupees = (paise: number) => Math.round(paise) / 100;
export const toPaise = rupeesToPaise;
export const toRupees = paiseToRupees;
export const MAX_PAISE = 2_147_483_647; // Prisma Int / PostgreSQL INTEGER

export type QuotationLine = { quantity: number; unitPricePaise: number };

export function quotationTotalPaise(items: QuotationLine[], discountPaise = 0, taxPaise = 0): number {
  const valid = (n: number) => Number.isSafeInteger(n) && n >= 0 && n <= MAX_PAISE;
  if (!items.length) throw new Error("A quotation needs at least one line item.");
  if (!valid(discountPaise) || !valid(taxPaise)) throw new Error("Quotation amounts are outside the supported range.");
  let subtotal = 0;
  for (const item of items) {
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 || !valid(item.unitPricePaise)) {
      throw new Error("Quotation line items must have valid quantities and prices.");
    }
    subtotal += item.quantity * item.unitPricePaise;
    if (!Number.isSafeInteger(subtotal) || subtotal > MAX_PAISE) throw new Error("Quotation total is outside the supported range.");
  }
  const total = Math.max(0, subtotal - discountPaise) + taxPaise;
  if (!valid(total)) throw new Error("Quotation total is outside the supported range.");
  return total;
}

export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(toRupees(paise));
}

// Parses "12,500.50" / "₹12500" / "12500" into paise; returns null when not a valid amount.
export function parseINRToPaise(input: string): number | null {
  const cleaned = input.replace(/[₹,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  const paise = Math.round(n * 100);
  return Number.isSafeInteger(paise) && paise <= MAX_PAISE ? paise : null;
}
