import Link from "next/link";
import { requireRolePage, STAFF_ROLES } from "@/lib/authz";
import { listEnquiries } from "@/server/inbox";
import { ENQUIRY_STATUSES } from "@/lib/enquiryStatus";
import { formatIN, humanize } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function InboxPage({ searchParams }: { searchParams: { q?: string; status?: string; spam?: string; conversion?: string; owner?: string; page?: string } }) {
  const staff = await requireRolePage(["OWNER", "MANAGER", "STAFF"]);
  const page = Number(searchParams.page ?? "1") || 1;
  const { rows, total, pages } = await listEnquiries({ q: searchParams.q, status: searchParams.status, spam: searchParams.spam, conversion: searchParams.conversion, owner: searchParams.owner, staffId: staff.role === "STAFF" ? staff.id : undefined, page });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Inbox</h1>
          <p className="mt-1 text-sm text-ailu-cream/60">Website enquiries. An enquiry is never a booking — convert the good ones into a client and an event.</p>
        </div>
        <form className="flex flex-wrap items-end gap-2" action="/admin/inbox">
          <input name="q" defaultValue={searchParams.q ?? ""} placeholder="Search name, phone, ID, location" className="w-56 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm placeholder:text-ailu-cream/40" />
          <select name="status" defaultValue={searchParams.status ?? ""} className="rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-sm">
            <option value="" className="text-black">All statuses</option>
            {ENQUIRY_STATUSES.map((s) => <option key={s} value={s} className="text-black">{humanize(s)}</option>)}
          </select>
          <select name="spam" defaultValue={searchParams.spam ?? ""} className="rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-sm">
            <option value="" className="text-black">Hiding spam</option>
            <option value="all" className="text-black">Show all incl. spam</option>
            <option value="only" className="text-black">Only spam</option>
          </select>
          <select name="conversion" defaultValue={searchParams.conversion ?? ""} className="rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-sm"><option value="" className="text-black">All enquiries</option><option value="unconverted" className="text-black">Unconverted</option><option value="converted" className="text-black">Converted</option></select>
          <select name="owner" defaultValue={searchParams.owner ?? ""} className="rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-sm"><option value="" className="text-black">All owners</option><option value="unassigned" className="text-black">Unassigned</option></select>
          <button className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10">Filter</button>
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-white/10 bg-[#111114] p-8 text-center text-sm text-ailu-cream/50">No enquiries here yet. Submitting the public form creates one automatically.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.06] text-left text-xs uppercase tracking-wider text-ailu-cream/50">
              <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Who</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Where/when</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Event</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={`border-t border-white/10 hover:bg-white/[0.03] ${r.spam ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link href={`/admin/inbox/${r.id}`} className="font-mono text-xs text-ailu-yellow hover:underline">{r.id}</Link>
                    {r.spam ? <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-400">SPAM</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-ailu-cream/60">{r.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-ailu-cream/70">{r.category}</td>
                  <td className="px-4 py-3 text-ailu-cream/70">
                    <div>{r.location}</div>
                    <div className="text-xs text-ailu-cream/50">{r.eventDate || "date not set"} · {formatIN(r.createdAt)}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">{humanize(r.status)}</td>
                  <td className="px-4 py-3">
                    {r.event
                      ? <Link href={`/admin/events/${r.event.id}`} className="font-mono text-xs text-ailu-yellow hover:underline">{r.event.id}</Link>
                      : <span className="text-xs text-ailu-cream/40">not converted</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-ailu-cream/50">
        {total} total{pages > 1 ? " · page " + page + " of " + pages : ""}{pages > 1 && (searchParams.q || searchParams.status || searchParams.spam) ? "" : ""}
        {pages > 1 && (
          <>
            {" · "}
            <Link href={`/admin/inbox?page=${Math.max(1, page - 1)}&q=${encodeURIComponent(searchParams.q ?? "")}&status=${searchParams.status ?? ""}&spam=${searchParams.spam ?? ""}&conversion=${searchParams.conversion ?? ""}&owner=${searchParams.owner ?? ""}`} className="underline">← prev</Link>
            {" · "}
            <Link href={`/admin/inbox?page=${Math.min(pages, page + 1)}&q=${encodeURIComponent(searchParams.q ?? "")}&status=${searchParams.status ?? ""}&spam=${searchParams.spam ?? ""}&conversion=${searchParams.conversion ?? ""}&owner=${searchParams.owner ?? ""}`} className="underline">next →</Link>
          </>
        )}
      </p>
    </div>
  );
}
