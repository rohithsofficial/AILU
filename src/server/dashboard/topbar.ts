import type { Staff } from "@/lib/authz";
import { getPrisma } from "@/lib/db";

function indiaStartOfToday(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(`${value.year}-${value.month}-${value.day}T00:00:00.000Z`);
}

export async function myTasksDueCount(staff: Staff, now = new Date()) {
  const tomorrow = indiaStartOfToday(now);
  tomorrow.setTime(tomorrow.getTime() + 24 * 60 * 60 * 1000);
  return getPrisma().task.count({ where: { assigneeId: staff.id, doneAt: null, dueAt: { lt: tomorrow } } });
}
