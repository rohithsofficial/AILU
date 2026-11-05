import Link from "next/link";
import { requireRolePage, STAFF_ROLES } from "@/lib/authz";
import { listEvents } from "@/server/events";
import { EVENT_STATUSES, EVENT_STATUS_LABELS } from "@/lib/eventStatus";
import { formatIN } from "@/lib/format";
import { EVENT_CATEGORIES } from "@/lib/events";
import { listActiveStaff } from "@/server/inbox";

export const dynamic = "force-dynamic";

export default async function EventsPage({ searchParams }: { searchParams: { q?: string; status?: string; category?: string; ownerId?: string; dateFrom?: string; dateTo?: string; archived?: string; page?: string } }) {
  const staff = await requireRolePage(STAFF_ROLES);
  const page = Number(searchParams.page ?? "1") || 1;
  const [data, people] = await Promise.all([
    listEvents({ q: searchParams.q, status: searchParams.status, category: searchParams.category, ownerId: staff.role === "STAFF" ? staff.id : searchParams.ownerId, dateFrom: searchParams.dateFrom, dateTo: searchParams.dateTo, includeArchived: staff.role === "OWNER" && searchParams.archived === "all", page }),
    listActiveStaff(),
  ]);
  const { rows, total, pages } = data;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Events</h1>
          <p className="mt-1 text-sm text-ailu-cream/60">Every event AILU runs, from first lead to money settled.</p>
        </div>
        {staff.role !== "ACCOUNTS" ? <Link href="/admin/events/new" className="rounded-full bg-ailu-yellow px-5 py-2.5 text-sm font-semibold text-ailu-black hover:brightness-105">+ New event</Link> : null}
      </div>

      <form className="mt-4 flex flex-wrap items-end gap-2" action="/admin/events">
        <input name="q" defaultValue={searchParams.q ?? ""} placeholder="Search title, client, city, ID" className="w-56 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm placeholder:text-ailu-cream/40" />
        <select name="status" defaultValue={searchParams.status ?? ""} className="rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-sm">
          <option value="" className="text-black">All statuses</option>
          {EVENT_STATUSES.map((s) => <option key={s} value={s} className="text-black">{EVENT_STATUS_LABELS[s as keyof typeof EVENT_STATUS_LABELS]}</option>)}
        </select>
        <select name="category" defaultValue={searchParams.category ?? ""} className="rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-sm"><option value="" className="text-black">All categories</option>{EVENT_CATEGORIES.map((category) => <option key={category.slug} value={category.slug} className="text-black">{category.title}</option>)}</select>
        <select name="ownerId" defaultValue={searchParams.ownerId ?? ""} className="rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-sm"><option value="" className="text-black">All owners</option>{people.map((person) => <option key={person.id} value={person.id} className="text-black">{person.name || person.email}</option>)}</select>
        <label className="text-xs text-ailu-cream/60">From<input aria-label="Start date from" type="date" name="dateFrom" defaultValue={searchParams.dateFrom ?? ""} className="ml-1 rounded-lg border border-white/20 bg-white/10 px-2 py-2" /></label>
        <label className="text-xs text-ailu-cream/60">To<input aria-label="Start date to" type="date" name="dateTo" defaultValue={searchParams.dateTo ?? ""} className="ml-1 rounded-lg border border-white/20 bg-white/10 px-2 py-2" /></label>
        {staff.role === "OWNER" ? <select name="archived" defaultValue={searchParams.archived ?? ""} className="rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-sm"><option value="" className="text-black">Active events</option><option value="all" className="text-black">Include archived</option></select> : null}
        <button className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10">Filter</button>
      </form>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-white/10 bg-[#111114] p-8 text-center text-sm text-ailu-cream/50">No events yet. Create one from a lead, or convert an enquiry in the Inbox.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.06] text-left text-xs uppercase tracking-wider text-ailu-cream/50">
              <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Event</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">When / where</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Quoted</th></tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className={`border-t border-white/10 hover:bg-white/[0.03] ${e.archivedAt ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3"><Link href={`/admin/events/${e.id}`} className="font-mono text-xs text-ailu-yellow hover:underline">{e.id}</Link></td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/events/${e.id}`} className="font-medium hover:underline">{e.title}</Link>
                    <div className="text-xs text-ailu-cream/50">{e.category}</div>
                    {e.archivedAt ? <span className="text-[10px] text-ailu-cream/45">Archived</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${e.client.id}`} className="text-ailu-cream/70 hover:underline">{e.client.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-ailu-cream/70">
                    <div>{e.startDate ? formatIN(e.startDate) : "—"}{e.venueCity ? " · " + e.venueCity : ""}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">{EVENT_STATUS_LABELS[e.status as keyof typeof EVENT_STATUS_LABELS] || e.status}</td>
                  <td className="px-4 py-3 text-xs text-ailu-cream/70">{e.quotations[0] ? "v" + e.quotations[0].version : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-ailu-cream/50">{total} total{pages > 1 ? ` · page ${page} of ${pages}` : ""}</p>
      {pages > 1 ? (
        <p className="mt-2 space-x-3 text-xs">
          <Link href={`/admin/events?page=${Math.max(1, page - 1)}&q=${encodeURIComponent(searchParams.q ?? "")}&status=${searchParams.status ?? ""}&category=${searchParams.category ?? ""}&ownerId=${searchParams.ownerId ?? ""}&dateFrom=${searchParams.dateFrom ?? ""}&dateTo=${searchParams.dateTo ?? ""}&archived=${searchParams.archived ?? ""}`} className="underline">← prev</Link>
          <Link href={`/admin/events?page=${Math.min(pages, page + 1)}&q=${encodeURIComponent(searchParams.q ?? "")}&status=${searchParams.status ?? ""}&category=${searchParams.category ?? ""}&ownerId=${searchParams.ownerId ?? ""}&dateFrom=${searchParams.dateFrom ?? ""}&dateTo=${searchParams.dateTo ?? ""}&archived=${searchParams.archived ?? ""}`} className="underline">next →</Link>
        </p>
      ) : null}
    </div>
  );
}
