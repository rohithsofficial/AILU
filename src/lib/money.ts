// All money is stored as integer paise (plan section 2). INR only. Format at the edge.
export const toPaise = (rupees: number) => Math.round(rupees * 100);
export const toRupees = (paise: number) => Math.round(paise) / 100;

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
  return Math.round(n * 100);
}
