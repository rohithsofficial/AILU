import type { Staff } from "@/lib/authz";
import type { Prisma } from "@prisma/client";
import { EVENT_STATUSES, type EventStatusValue } from "@/lib/eventStatus";
import { EVENT_CATEGORIES } from "@/lib/events";
import { getPrisma } from "@/lib/db";
import { calendarMonthRange } from "./attention-rules";

export function currentIndiaMonth(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" }).formatToParts(now).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}`;
}

export function currentIndiaDay(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now).map((part) => [part.type, part.value]));
  return parts.day;
}

export function shiftCalendarMonth(month: string, delta: number) {
  const { start } = calendarMonthRange(month);
  start.setUTCMonth(start.getUTCMonth() + delta);
  return start.toISOString().slice(0, 7);
}

export async function calendarData(staff: Staff, params: { month?: string; status?: string; category?: string; ownerId?: string; includeClosed?: boolean }) {
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(params.month ?? "") ? params.month! : currentIndiaMonth();
  const { start, end } = calendarMonthRange(month);
  const filters: Prisma.EventWhereInput[] = [
    { OR: [{ endDate: { gte: start } }, { endDate: null, startDate: { gte: start } }] },
  ];
  const where: Prisma.EventWhereInput = {
    startDate: { lte: end },
    AND: filters,
  };
  if (!params.includeClosed) {
    where.archivedAt = null;
    filters.push({ status: { notIn: ["CANCELLED", "LOST"] } });
  }
  if (params.status && EVENT_STATUSES.includes(params.status as EventStatusValue)) filters.push({ status: params.status as EventStatusValue });
  if (params.category && EVENT_CATEGORIES.some((item) => item.slug === params.category)) where.category = params.category;
  if (staff.role === "STAFF") where.ownerId = staff.id;
  else if (params.ownerId) where.ownerId = params.ownerId;
  const db = getPrisma();
  const [events, owners] = await Promise.all([
    db.event.findMany({ where, orderBy: [{ startDate: "asc" }, { title: "asc" }], select: { id: true, title: true, status: true, category: true, startDate: true, endDate: true, venueCity: true, ownerId: true } }),
    staff.role === "STAFF" ? Promise.resolve([]) : db.staffUser.findMany({ where: { active: true }, orderBy: [{ name: "asc" }], select: { id: true, name: true, email: true } }),
  ]);
  return { month, events, owners };
}
