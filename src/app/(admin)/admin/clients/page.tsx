// CRM: list of clients with search (name, company, phone, city, ID) and filters.
import Link from "next/link";
import { requireRolePage, STAFF_ROLES } from "@/lib/authz";
import { listClients } from "@/server/clients";
import { formatIN } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ClientsPage({ searchParams }: { searchParams: { q?: string; archived?: string; type?: string; tag?: string; page?: string } }) {
  const staff = await requireRolePage(STAFF_ROLES);
  const page = Number(searchParams.page ?? "1") || 1;
  const { rows, total, pages } = await listClients({ q: searchParams.q, type: searchParams.type, tag: searchParams.tag, ownerId: staff.role === "STAFF" ? staff.id : undefined, page, includeArchived: searchParams.archived === "all" });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Clients</h1>
          <p className="mt-1 text-sm text-ailu-cream/60">One record per phone number. Created automatically when an enquiry is converted.</p>
        </div>
        <form className="flex flex-wrap items-end gap-2" action="/admin/clients">
          <input name="q" defaultValue={searchParams.q ?? ""} placeholder="Search name, phone, city, ID" className="w-56 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm placeholder:text-ailu-cream/40" />
          <select name="type" defaultValue={searchParams.type ?? ""} className="rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-sm"><option value="" className="text-black">All types</option><option value="INDIVIDUAL" className="text-black">Individual</option><option value="COMPANY" className="text-black">Company</option><option value="COMMUNITY" className="text-black">Community</option></select>
          <input name="tag" defaultValue={searchParams.tag ?? ""} placeholder="Exact tag" className="w-32 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm placeholder:text-ailu-cream/40" />
          <select name="archived" defaultValue={searchParams.archived ?? ""} className="rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-sm">
            <option value="" className="text-black">Active clients</option>
            <option value="all" className="text-black">Include archived</option>
          </select>
          <button className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10">Search</button>
        </form>
      </div>

      <div className="mt-4 flex text-sm">
        {staff.role !== "ACCOUNTS" ? <Link href="/admin/clients/new" className="rounded-full bg-ailu-yellow px-4 py-2 font-semibold text-ailu-black hover:brightness-105">+ Add a client manually</Link> : null}
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-white/10 bg-[#111114] p-8 text-center text-sm text-ailu-cream/50">No clients yet. Convert an enquiry from the Inbox.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.06] text-left text-xs uppercase tracking-wider text-ailu-cream/50">
              <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Type / tags</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Events</th><th className="px-4 py-3">Since</th></tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className={`border-t border-white/10 hover:bg-white/[0.03] ${c.archivedAt ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3"><Link href={`/admin/clients/${c.id}`} className="font-mono text-xs text-ailu-yellow hover:underline">{c.id}</Link></td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${c.id}`} className="font-medium hover:underline">{c.name}</Link>
                    {c.companyName ? <div className="text-xs text-ailu-cream/60">{c.companyName}</div> : null}
                    {c.archivedAt ? <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-ailu-cream/60">archived</span> : null}
                  </td>
                  <td className="px-4 py-3 text-ailu-cream/70">{c.phone}</td>
                  <td className="px-4 py-3 text-ailu-cream/70">{c.city || "—"}</td>
                  <td className="px-4 py-3 text-xs text-ailu-cream/70">{c.type}{c.tags.length ? <div className="mt-1 text-ailu-cream/45">{c.tags.join(", ")}</div> : null}</td>
                  <td className="px-4 py-3 text-xs text-ailu-cream/70">{c.source}{c.referredBySpId ? ` · ${c.referredBySpId}` : ""}</td>
                  <td className="px-4 py-3 text-center">{c.events.length}</td>
                  <td className="px-4 py-3 text-xs text-ailu-cream/60">{formatIN(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-ailu-cream/50">{total} total{pages > 1 ? ` · page ${page} of ${pages}` : ""}</p>
      {pages > 1 ? (
        <p className="mt-2 space-x-3 text-xs">
          <Link href={`/admin/clients?page=${Math.max(1, page - 1)}&q=${encodeURIComponent(searchParams.q ?? "")}&archived=${searchParams.archived ?? ""}&type=${searchParams.type ?? ""}&tag=${encodeURIComponent(searchParams.tag ?? "")}`} className="underline">← prev</Link>
          <Link href={`/admin/clients?page=${Math.min(pages, page + 1)}&q=${encodeURIComponent(searchParams.q ?? "")}&archived=${searchParams.archived ?? ""}&type=${searchParams.type ?? ""}&tag=${encodeURIComponent(searchParams.tag ?? "")}`} className="underline">next →</Link>
        </p>
      ) : null}
    </div>
  );
}
