import Link from "next/link";
import { requireRolePage } from "@/lib/authz";
import { getPrisma } from "@/lib/db";
import { STAFF_ROLES } from "@/lib/authz";
import { EVENT_STATUSES, EVENT_STATUS_LABELS } from "@/lib/eventStatus";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const staff = await requireRolePage(STAFF_ROLES);
  const db = getPrisma();
  const ownOnly = staff.role === "STAFF";
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setDate(nextMonth.getDate() + 30);
  const eventWhere = { archivedAt: null, ...(ownOnly ? { ownerId: staff.id } : {}) };
  const taskScope = ownOnly ? { assigneeId: staff.id } : {};
  const [newEnquiries, pipeline, upcoming, upcomingCount, overdue] = await Promise.all([
    db.eventEnquiry.count({ where: { eventId: null, spam: false, status: "SUBMITTED", ...(ownOnly ? { ownerId: staff.id } : {}) } }),
    db.event.groupBy({ by: ["status"], where: eventWhere, _count: { _all: true } }),
    db.event.findMany({ where: { ...eventWhere, startDate: { gte: now, lte: nextMonth } }, orderBy: { startDate: "asc" }, take: 8, select: { id: true, title: true, status: true, startDate: true, venueCity: true } }),
    db.event.count({ where: { ...eventWhere, startDate: { gte: now, lte: nextMonth } } }),
    db.task.count({ where: { ...taskScope, doneAt: null, dueAt: { lt: now } } }),
  ]);

  const cards = [
    ...(staff.role === "ACCOUNTS" ? [] : [{ label: "New enquiries", total: newEnquiries, note: "Unconverted, non-spam, submitted", href: "/admin/inbox" }]),
    { label: "Upcoming events", total: upcomingCount, note: "Next 30 days", href: "/admin/events" },
    { label: "Overdue tasks", total: overdue, note: ownOnly ? "Assigned to you" : "Open follow-ups", href: "/admin/tasks" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-bold">Hello, {staff.name || staff.email}</h1>
      <p className="mt-1 text-sm text-ailu-cream/60">{ownOnly ? "Your assigned CRM work." : "Current CRM activity."}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const inner = (
            <>
              <div className="font-display text-3xl font-extrabold text-ailu-yellow">{c.total}</div>
              <div className="mt-1 text-sm font-semibold">{c.label}</div>
              <div className="mt-0.5 text-xs text-ailu-cream/50">{c.note}</div>
            </>
          );
          return c.href && c.href !== "/admin" ? (
            <Link key={c.label} href={c.href} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-ailu-yellow/50">{inner}</Link>
          ) : (
            <div key={c.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">{inner}</div>
          );
        })}
      </div>

      <section className="mt-8 rounded-2xl border border-white/10 bg-[#111114] p-6">
        <h2 className="font-display text-lg font-bold">Events by stage</h2>
        {pipeline.length === 0 ? <p className="mt-3 text-sm text-ailu-cream/50">No active events yet.</p> : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {EVENT_STATUSES.map((status) => {
              const count = pipeline.find((row) => row.status === status)?._count._all ?? 0;
              return <li key={status} className="rounded-lg border border-white/10 px-3 py-2"><span className="text-xs text-ailu-cream/55">{EVENT_STATUS_LABELS[status]}</span><strong className="ml-2 text-ailu-yellow">{count}</strong></li>;
            })}
          </ul>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-white/10 bg-[#111114] p-6">
        <h2 className="font-display text-lg font-bold">Upcoming events</h2>
        {upcoming.length === 0 ? <p className="mt-3 text-sm text-ailu-cream/50">No events scheduled in the next 30 days.</p> : (
          <ul className="mt-3 divide-y divide-white/10">
            {upcoming.map((event) => <li key={event.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><Link href={`/admin/events/${event.id}`} className="text-ailu-yellow hover:underline">{event.title}</Link><span className="text-ailu-cream/60">{event.startDate?.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })} · {event.venueCity || "Location not set"}</span></li>)}
          </ul>
        )}
      </section>

      {staff.role === "OWNER" && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-[#111114] p-6">
          <h2 className="font-display text-lg font-bold">Owner shortcuts</h2>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link href="/admin/settings/staff" className="rounded-full border border-ailu-yellow/60 px-4 py-2 font-semibold text-ailu-yellow hover:bg-ailu-yellow/10">Manage staff</Link>
            <Link href="/admin/settings/audit" className="rounded-full border border-white/20 px-4 py-2 hover:bg-white/10">Audit log</Link>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-white/10 bg-[#111114] p-6 text-sm text-ailu-cream/60">
        Business rule reminder — an enquiry is never a booking. Confirmation needs availability, agreed scope and payment. Nothing ends up public from this admin without the owner saying so.
      </div>
    </div>
  );
}
