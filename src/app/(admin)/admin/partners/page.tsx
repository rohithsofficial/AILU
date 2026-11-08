// CRM: list of sales partners who registered on /join/partner.
import Link from "next/link";
import { requireRolePage, can } from "@/lib/authz";
import { listPartners } from "@/server/partners";
import { formatIN } from "@/lib/format";

export const dynamic = "force-dynamic";
const statuses = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];
const input = "rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-ailu-cream";
export default async function PartnersPage({ searchParams }: { searchParams: { q?: string; status?: string; page?: string } }) {
  const staff = await requireRolePage(["OWNER", "MANAGER", "STAFF", "ACCOUNTS"]);
  if (!can(staff.role, "partners.read")) return <p>You do not have access to partners.</p>;
  const data = await listPartners({ ...searchParams, page: Number(searchParams.page ?? 1) || 1 });
  const filters = new URLSearchParams({ ...(searchParams.q ? { q: searchParams.q } : {}), ...(searchParams.status ? { status: searchParams.status } : {}) });
  const pageHref = (page: number) => { const query = new URLSearchParams(filters); query.set("page", String(page)); return `/admin/partners?${query}`; };
  return <div className="mx-auto max-w-6xl"><h1 className="font-display text-2xl font-bold">Sales partners</h1><p className="mt-1 text-sm text-ailu-cream/60">Partner registration and referred enquiries.</p>
    <form action="/admin/partners" className="mt-5 flex flex-wrap gap-2"><input name="q" defaultValue={searchParams.q ?? ""} placeholder="Search partner ID, name, phone, city" className={input}/><select name="status" defaultValue={searchParams.status ?? ""} className={input}><option value="" className="text-black">All statuses</option>{statuses.map((s)=><option key={s} className="text-black">{s}</option>)}</select><button className="rounded-lg border border-white/20 px-4 py-2 text-sm">Filter</button></form>
    {data.rows.length ? <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10"><table className="w-full text-sm"><thead className="bg-white/[0.06] text-left text-xs uppercase text-ailu-cream/50"><tr><th className="px-4 py-3">Partner</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Registered</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{data.rows.map((partner)=><tr key={partner.id} className="border-t border-white/10"><td className="px-4 py-3"><Link href={`/admin/partners/${partner.id}`} className="text-ailu-yellow hover:underline">{partner.id}</Link><div className="font-medium">{partner.name}</div><div className="text-xs text-ailu-cream/50">{partner.phone}</div></td><td className="px-4 py-3">{partner.city}</td><td className="px-4 py-3 text-xs">{formatIN(partner.createdAt)}</td><td className="px-4 py-3">{partner.status}</td></tr>)}</tbody></table></div> : <p className="mt-6 rounded-2xl border border-white/10 p-8 text-center text-sm text-ailu-cream/50">No partners match these filters.</p>}
    <div className="mt-4 flex justify-between text-sm text-ailu-cream/60"><span>{data.total} total · page {data.page} of {data.pages}</span><div className="flex gap-4">{data.page > 1 ? <Link href={pageHref(data.page-1)} className="underline">← previous</Link> : null}{data.page < data.pages ? <Link href={pageHref(data.page+1)} className="underline">next →</Link> : null}</div></div>
  </div>;
}
