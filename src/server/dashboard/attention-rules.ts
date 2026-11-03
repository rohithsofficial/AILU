export const ATTENTION_THRESHOLDS = {
  enquiryHours: 24,
  sentQuotationDays: 5,
  preEventDays: 14,
  balanceDueDays: 7,
  executedDays: 3,
  overdueTaskDays: 3,
  pendingPartnerDays: 3,
  dreamReviewDays: 3,
} as const;

const hour = 60 * 60 * 1000;
const day = 24 * hour;
const indiaDayIndex = (date: Date) => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date).map((part) => [part.type, part.value]));
  return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / day;
};
const calendarDaysUntil = (date: Date, now: Date) => indiaDayIndex(date) - indiaDayIndex(now);

export type AttentionItem = {
  rule: string;
  recordId: string;
  label: string;
  message: string;
  href: string;
  at: Date;
};

export type AttentionInput = {
  enquiries?: { id: string; name: string; ownerId: string | null; eventId: string | null; spam: boolean; createdAt: Date }[];
  quotations?: { id: string; eventId: string; eventTitle: string; status: string; createdAt: Date }[];
  planningEvents?: { id: string; title: string; status: string; startDate: Date; vendorBookingCount: number; assignmentCount: number }[];
  balancesDue?: { id: string; title: string; startDate: Date; balanceDuePaise: number }[];
  executedEvents?: { id: string; title: string; status: string; startDate: Date | null; executedAt?: Date | null }[];
  overdueTasks?: { id: string; title: string; dueAt: Date; eventId: string | null; clientId: string | null }[];
  pendingPartners?: { id: string; name: string; status: string; createdAt: Date }[];
  dreams?: { id: string; status: string; createdAt: Date }[];
};

export function buildAttentionItems(input: AttentionInput, now = new Date(), includeFinance = false): AttentionItem[] {
  const items: AttentionItem[] = [];
  const add = (item: AttentionItem) => items.push(item);

  for (const row of input.enquiries ?? []) {
    if (row.spam || now.getTime() - row.createdAt.getTime() <= ATTENTION_THRESHOLDS.enquiryHours * hour) continue;
    if (row.ownerId && row.eventId) continue;
    add({ rule: "Enquiries", recordId: row.id, label: row.name, message: row.ownerId ? "Unconverted for over 24 hours" : "Unassigned or unconverted for over 24 hours", href: `/admin/inbox/${row.id}`, at: row.createdAt });
  }
  for (const row of input.quotations ?? []) {
    if (row.status !== "SENT" || now.getTime() - row.createdAt.getTime() <= ATTENTION_THRESHOLDS.sentQuotationDays * day) continue;
    add({ rule: "Quotations", recordId: row.id, label: row.eventTitle, message: "Sent quotation has had no decision for over 5 days", href: `/admin/events/${row.eventId}#quotations`, at: row.createdAt });
  }
  for (const row of input.planningEvents ?? []) {
    const daysUntil = calendarDaysUntil(row.startDate, now);
    if (!["CONFIRMED", "PLANNING"].includes(row.status) || daysUntil < 0 || daysUntil > ATTENTION_THRESHOLDS.preEventDays || row.vendorBookingCount || row.assignmentCount) continue;
    add({ rule: "Event preparation", recordId: row.id, label: row.title, message: "Starts within 14 days with no vendor booking or team assignment", href: `/admin/events/${row.id}#vendors`, at: row.startDate });
  }
  if (includeFinance) for (const row of input.balancesDue ?? []) {
    const daysUntil = calendarDaysUntil(row.startDate, now);
    if (row.balanceDuePaise <= 0 || daysUntil < 0 || daysUntil > ATTENTION_THRESHOLDS.balanceDueDays) continue;
    add({ rule: "Client balances", recordId: row.id, label: row.title, message: "Event starts within 7 days and client balance is due", href: `/admin/events/${row.id}#finance`, at: row.startDate });
  }
  for (const row of input.executedEvents ?? []) {
    const executedAt = row.executedAt ?? row.startDate;
    if (row.status !== "EXECUTED" || !executedAt || calendarDaysUntil(now, executedAt) <= ATTENTION_THRESHOLDS.executedDays) continue;
    add({ rule: "Event closing", recordId: row.id, label: row.title, message: "Executed over 3 days ago and not marked complete", href: `/admin/events/${row.id}`, at: executedAt });
  }
  for (const row of input.overdueTasks ?? []) {
    if (calendarDaysUntil(now, row.dueAt) <= ATTENTION_THRESHOLDS.overdueTaskDays || (!row.eventId && !row.clientId)) continue;
    const href = row.eventId ? `/admin/events/${row.eventId}#tasks` : `/admin/clients/${row.clientId}`;
    add({ rule: "Overdue tasks", recordId: row.id, label: row.title, message: "Task overdue by more than 3 days", href, at: row.dueAt });
  }
  for (const row of input.pendingPartners ?? []) {
    if (row.status !== "PENDING" || now.getTime() - row.createdAt.getTime() <= ATTENTION_THRESHOLDS.pendingPartnerDays * day) continue;
    add({ rule: "Partners", recordId: row.id, label: row.name, message: "Registration pending for over 3 days", href: `/admin/partners/${row.id}`, at: row.createdAt });
  }
  for (const row of input.dreams ?? []) {
    if (row.status !== "SUBMITTED" || now.getTime() - row.createdAt.getTime() <= ATTENTION_THRESHOLDS.dreamReviewDays * day) continue;
    add({ rule: "Dreams", recordId: row.id, label: "Private dream submission", message: "Waiting for review for over 3 days", href: `/admin/dreams/${row.id}`, at: row.createdAt });
  }
  return items.sort((a, b) => a.at.getTime() - b.at.getTime());
}

export function calendarMonthGrid(month: string): string[] {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
  if (!match) throw new Error("Use a calendar month in YYYY-MM format.");
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const mondayOffset = (first.getUTCDay() + 6) % 7;
  const start = new Date(Date.UTC(year, monthIndex, 1 - mondayOffset));
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

export function calendarMonthRange(month: string) {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
  if (!match) throw new Error("Use a calendar month in YYYY-MM format.");
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  return { start: new Date(Date.UTC(year, monthIndex, 1)), end: new Date(Date.UTC(year, monthIndex + 1, 1) - 1) };
}

export function eventOccursOnDay(event: { startDate: Date; endDate: Date | null }, dayKey: string): boolean {
  const start = event.startDate.toISOString().slice(0, 10);
  const end = (event.endDate ?? event.startDate).toISOString().slice(0, 10);
  return start <= dayKey && end >= dayKey;
}
