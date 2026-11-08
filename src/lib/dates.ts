// Dates for AILU, which works in India time (Asia/Kolkata, UTC+5:30).
// Date-only fields (event dates, task due dates, payment dates) are stored as midnight UTC of that day,
// for example "2026-11-08" is saved as 2026-11-08T00:00:00.000Z. So "today" must also be a UTC midnight
// of today's date in India, or a task due today would look overdue from 5:30 in the morning.

/** Today's date in India as "YYYY-MM-DD". */
export function todayInIndia(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

/** The start of today in India, in the same form as stored date-only fields (midnight UTC of that date). */
export const indiaDayStart = (now = new Date()) => new Date(`${todayInIndia(now)}T00:00:00.000Z`);

/** The same moment some whole days later (negative for earlier). */
export const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
