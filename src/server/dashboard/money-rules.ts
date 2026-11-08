// Small money rules for the dashboard (amounts due, due within 7 days, monthly margin). Tested.
export const DUE_WARNING_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

function indiaDayIndex(date: Date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date).map((part) => [part.type, part.value]));
  return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / DAY_MS;
}

export type DueRecord = { id: string; duePaise: number; startDate: Date | null; status?: string };

export function outstandingPaise(agreedPaise: number | null, paidPaise: number): number {
  return Math.max(0, (agreedPaise ?? 0) - paidPaise);
}

export function isDueWithinDays(startDate: Date | null, now: Date, days = DUE_WARNING_DAYS): boolean {
  if (!startDate) return false;
  const until = indiaDayIndex(startDate) - indiaDayIndex(now);
  return until >= 0 && until <= days;
}

export function summarizeDue<T extends DueRecord>(rows: T[], now: Date) {
  const due = rows.filter((row) => row.duePaise > 0);
  return {
    rows: due.sort((a, b) => (a.startDate?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.startDate?.getTime() ?? Number.MAX_SAFE_INTEGER)),
    totalPaise: due.reduce((sum, row) => sum + row.duePaise, 0),
    withinSevenDays: (row: T) => isDueWithinDays(row.startDate, now),
  };
}

export function marginForCompletedEvents(rows: { acceptedQuotePaise: number; vendorCostsPaise: number; teamCostsPaise: number; commissionCostsPaise: number; otherExpensesPaise: number }[]) {
  return rows.reduce((sum, row) => sum + row.acceptedQuotePaise - row.vendorCostsPaise - row.teamCostsPaise - row.commissionCostsPaise - row.otherExpensesPaise, 0);
}
