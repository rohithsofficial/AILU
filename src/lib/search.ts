// Shared rules for the search boxes on the CRM list pages (inbox, clients, events, vendors, applications, partners, team).

/**
 * The digits to look for in phone numbers, or null when the search should not look at phones.
 * Phones are stored as "+919876543210". A search like "Rani" has no digits; matching phones that
 * "contain nothing" would match every row, so phones are searched only when there are at least 3 digits.
 */
export function phoneDigits(query: string): string | null {
  const digits = query.replace(/\D/g, "");
  return digits.length >= 3 ? digits : null;
}

/** A Prisma filter list for the phone field: empty when the search has too few digits. */
export function phoneFilter(query: string): { phone: { contains: string } }[] {
  const digits = phoneDigits(query);
  return digits ? [{ phone: { contains: digits } }] : [];
}

/** A safe page number from the address bar: whole, at least 1, at most 10000. */
export function pageNumber(value: unknown): number {
  const page = Math.floor(Number(value));
  return Number.isFinite(page) ? Math.max(1, Math.min(10000, page)) : 1;
}
