// CRM: month calendar of events, with a simple agenda list on phones. STAFF see only their own events.
import Link from "next/link";
import { requireRolePage, STAFF_ROLES } from "@/lib/authz";
import { EVENT_STATUSES, EVENT_STATUS_LABELS, type EventStatusValue } from "@/lib/eventStatus";
import { EVENT_CATEGORIES } from "@/lib/events";
import { calendarData, currentIndiaDay, currentIndiaMonth, shiftCalendarMonth } from "@/server/dashboard/calendar";
import { calendarMonthGrid, eventOccursOnDay } from "@/server/dashboard/attention-rules";

export const dynamic = "force-dynamic";

type Params = { month?: string; status?: string; category?: string; ownerId?: string; closed?: string };
const statusClasses: Record<EventStatusValue, string> = {
  LEAD: "border-white/20 bg-white/[0.03] text-ailu-cream/85",
  QUOTED: "border-ailu-yellow/20 bg-ailu-yellow/[0.06] text-ailu-cream/85",
  NEGOTIATION: "border-ailu-yellow/30 bg-ailu-yellow/[0.10] text-ailu-yellow",
  CONFIRMED: "border-ailu-yellow/40 bg-ailu-yellow/[0.14] text-ailu-yellow",
  PLANNING: "border-ailu-yellow/50 bg-ailu-yellow/[0.18] text-ailu-yellow",
  EXECUTED: "border-white/25 bg-white/[0.08] text-ailu-cream",
  COMPLETED: "border-white/30 bg-white/[0.12] text-ailu-cream",
  CANCELLED: "border-white/10 bg-white/[0.02] text-ailu-cream/45",
  LOST: "border-white/10 bg-white/[0.02] text-ailu-cream/35",
};
const makeHref = (month: string, params: Params) => {
  const query = new URLSearchParams();
  query.set("month", month);
  for (const key of ["status", "category", "ownerId", "closed"] as const) if (params[key]) query.set(key, params[key]!);
  return `/admin/calendar?${query.toString()}`;
};
const dateLabel = (day: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`));

export default async function CalendarPage({ searchParams }: { searchParams: Params }) {
  const staff = await requireRolePage(STAFF_ROLES);
  const params = searchParams ?? {};
  const { month, events, owners } = await calendarData(staff, { month: params.month, status: params.status, category: params.category, ownerId: params.ownerId, includeClosed: params.closed === "all" });
  const days = calendarMonthGrid(month);
  const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T12:00:00Z`));
  const eventsOn = (day: string) => events.filter((event) => eventOccursOnDay({ startDate: event.startDate!, endDate: event.endDate }, day));
  const today = currentIndiaMonth();
  const todayDay = currentIndiaDay();
  return <div className="mx-auto max-w-7xl">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="font-display text-2xl font-bold">Events calendar</h1><p className="mt-1 text-sm text-ailu-cream/60">Events appear on every day from their start through end date.</p></div>
      <div className="flex items-center gap-2 text-sm">
        <Link className="rounded-lg border border-white/15 px-3 py-2 hover:bg-white/10" href={makeHref(shiftCalendarMonth(month, -1), params)} aria-label="Previous month">←</Link>
        <span className="min-w-36 text-center font-semibold">{monthLabel}</span>
        <Link className="rounded-lg border border-white/15 px-3 py-2 hover:bg-white/10" href={makeHref(shiftCalendarMonth(month, 1), params)} aria-label="Next month">→</Link>
        <Link className="rounded-lg border border-ailu-yellow/40 px-3 py-2 text-ailu-yellow hover:bg-ailu-yellow/10" href={makeHref(today, params)}>Today</Link>
      </div>
    </div>

    <form action="/admin/calendar" className="mt-4 flex flex-wrap items-end gap-2 rounded-2xl border border-white/10 bg-[#111114] p-4">
      <label className="text-xs text-ailu-cream/65">Month<input type="month" name="month" value={month} className="mt-1 block rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-ailu-cream" /></label>
      <label className="text-xs text-ailu-cream/65">Status<select name="status" defaultValue={params.status ?? ""} className="mt-1 block rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-ailu-cream"><option value="" className="text-black">All visible statuses</option>{EVENT_STATUSES.map((status) => <option key={status} value={status} className="text-black">{EVENT_STATUS_LABELS[status]}</option>)}</select></label>
      <label className="text-xs text-ailu-cream/65">Category<select name="category" defaultValue={params.category ?? ""} className="mt-1 block rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-ailu-cream"><option value="" className="text-black">All categories</option>{EVENT_CATEGORIES.map((category) => <option key={category.slug} value={category.slug} className="text-black">{category.title}</option>)}</select></label>
      {staff.role !== "STAFF" ? <label className="text-xs text-ailu-cream/65">Owner<select name="ownerId" defaultValue={params.ownerId ?? ""} className="mt-1 block rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-ailu-cream"><option value="" className="text-black">All owners</option>{owners.map((owner) => <option key={owner.id} value={owner.id} className="text-black">{owner.name || owner.email}</option>)}</select></label> : null}
      <label className="flex items-center gap-2 px-2 py-2 text-xs text-ailu-cream/70"><input type="checkbox" name="closed" value="all" defaultChecked={params.closed === "all"} />Include archived, cancelled and lost</label>
      <button className="rounded-lg bg-ailu-yellow px-4 py-2 text-sm font-semibold text-ailu-black">Apply filters</button>
    </form>

    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="Event status legend">
      {EVENT_STATUSES.filter((status) => !["CANCELLED", "LOST"].includes(status)).map((status) => <span key={status} className="flex items-center gap-2 text-xs text-ailu-cream/65"><span className={`h-3 w-3 rounded-sm border ${statusClasses[status]}`} />{EVENT_STATUS_LABELS[status]}</span>)}
      {params.closed === "all" ? <><span className="flex items-center gap-2 text-xs text-ailu-cream/65"><span className={`h-3 w-3 rounded-sm border ${statusClasses.CANCELLED}`} />Cancelled</span><span className="flex items-center gap-2 text-xs text-ailu-cream/65"><span className={`h-3 w-3 rounded-sm border ${statusClasses.LOST}`} />Lost</span></> : null}
    </div>

    {events.length === 0 ? <p className="mt-4 rounded-2xl border border-white/10 bg-[#111114] p-8 text-center text-sm text-ailu-cream/55">No events match this month and these filters.</p> : null}
    <div className="mt-4 hidden overflow-hidden rounded-2xl border border-white/10 sm:block">
      <div className="grid grid-cols-7 bg-white/[0.04] text-center text-xs font-semibold text-ailu-cream/60">{["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => <div key={day} className="border-b border-white/10 px-2 py-3">{day}</div>)}</div>
      <div className="grid grid-cols-7">{days.map((day) => {
        const entries = eventsOn(day);
        const inMonth = day.startsWith(month);
        return <div key={day} className={`min-h-32 border-b border-r border-white/10 p-2 ${inMonth ? "bg-[#111114]" : "bg-black/20 opacity-50"}`}>
          <time dateTime={day} className={`text-xs ${day === today + "-" + todayDay ? "font-bold text-ailu-yellow" : "text-ailu-cream/45"}`}>{Number(day.slice(-2))}</time>
          <ul className="mt-2 space-y-1">{entries.slice(0, 4).map((event) => <li key={event.id}><Link href={`/admin/events/${event.id}`} aria-label={`${event.title}, ${EVENT_STATUS_LABELS[event.status as EventStatusValue]}`} className={`block truncate rounded border px-1.5 py-1 text-[11px] ${statusClasses[event.status as EventStatusValue]}`}><span className="font-semibold">{EVENT_STATUS_LABELS[event.status as EventStatusValue]}</span><span className="ml-1">{event.title}</span></Link></li>)}</ul>
          {entries.length > 4 ? <p className="mt-1 text-[10px] text-ailu-cream/45">+{entries.length - 4} more</p> : null}
        </div>;
      })}</div>
    </div>

    <ol className="mt-4 space-y-3 sm:hidden" aria-label="Calendar agenda">
      {days.filter((day) => day.startsWith(month)).map((day) => <li key={day} className="rounded-xl border border-white/10 bg-[#111114] p-4"><h2 className="text-sm font-semibold">{dateLabel(day)}</h2>{eventsOn(day).length ? <ul className="mt-2 space-y-2">{eventsOn(day).map((event) => <li key={event.id}><Link href={`/admin/events/${event.id}`} className={`flex justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${statusClasses[event.status as EventStatusValue]}`}><span>{event.title}</span><span className="shrink-0 text-xs">{EVENT_STATUS_LABELS[event.status as EventStatusValue]}</span></Link></li>)}</ul> : <p className="mt-2 text-xs text-ailu-cream/40">No events</p>}</li>)}
    </ol>
  </div>;
}
