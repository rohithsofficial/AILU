import Link from "next/link";
import { requireRolePage, STAFF_ROLES, can } from "@/lib/authz";
import { listVendors } from "@/server/vendors";
import { createVendorAction } from "./actions";

export const dynamic = "force-dynamic";
const input = "rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-ailu-cream placeholder:text-ailu-cream/40";

export default async function VendorsPage({ searchParams }: { searchParams: { q?: string; category?: string; status?: string; archived?: string; msg?: string } }) {
  const staff = await requireRolePage(STAFF_ROLES);
  if (!can(staff.role, "vendors.read")) return <p className="p-8">You do not have access to vendors.</p>;
  const rows = await listVendors({ ...searchParams, includeArchived: staff.role === "OWNER" && searchParams.archived === "all" });
  const categories = [...new Set(rows.map((v) => v.category))].sort();
  return <div className="mx-auto max-w-6xl">
    <h1 className="font-display text-2xl font-bold">Vendors</h1>
    <p className="mt-1 text-sm text-ailu-cream/60">A private directory for event suppliers and collaborators.</p>
    {searchParams.msg ? <p role="status" className="mt-4 rounded-lg border border-ailu-yellow/30 bg-ailu-yellow/10 p-3 text-sm">{searchParams.msg}</p> : null}
    <form action="/admin/vendors" className="mt-5 flex flex-wrap gap-2">
      <input name="q" defaultValue={searchParams.q ?? ""} placeholder="Search name, category, city, phone" className={input} />
      <select name="category" defaultValue={searchParams.category ?? ""} className={input}><option value="" className="text-black">All categories</option>{categories.map((c) => <option key={c} className="text-black">{c}</option>)}</select>
      <select name="status" defaultValue={searchParams.status ?? ""} className={input}><option value="" className="text-black">All statuses</option>{["ACTIVE", "INACTIVE", "DO_NOT_USE"].map((s) => <option key={s} value={s} className="text-black">{s.replaceAll("_", " ")}</option>)}</select>
      {staff.role === "OWNER" ? <select name="archived" defaultValue={searchParams.archived ?? ""} aria-label="Archived vendors" className={input}><option value="" className="text-black">Hide archived</option><option value="all" className="text-black">Include archived</option></select> : null}
      <button className="rounded-lg border border-white/20 px-4 py-2 text-sm">Filter</button>
    </form>

    {can(staff.role, "vendors.write") ? <details className="mt-5 rounded-2xl border border-white/10 bg-[#111114] p-5">
      <summary className="cursor-pointer font-semibold text-ailu-yellow">Add vendor</summary>
      <form action={createVendorAction} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label>Name<input required name="name" maxLength={160} className={`${input} mt-1 w-full`} /></label>
        <label>Category<input required name="category" maxLength={80} placeholder="Decor, catering, photography…" className={`${input} mt-1 w-full`} /></label>
        <label>Contact person<input name="contactPerson" maxLength={120} className={`${input} mt-1 w-full`} /></label>
        <label>Phone<input required name="phone" inputMode="tel" className={`${input} mt-1 w-full`} /></label>
        <label>Email<input name="email" type="email" className={`${input} mt-1 w-full`} /></label>
        <label>City<input name="city" maxLength={100} className={`${input} mt-1 w-full`} /></label>
        <label>Rating (internal)<select name="rating" defaultValue="" className={`${input} mt-1 w-full`}><option value="" className="text-black">Not rated</option>{[1,2,3,4,5].map((n) => <option key={n} className="text-black">{n}</option>)}</select></label>
        <label>Status<select name="status" defaultValue="ACTIVE" className={`${input} mt-1 w-full`}><option className="text-black">ACTIVE</option><option className="text-black">INACTIVE</option><option className="text-black">DO_NOT_USE</option></select></label>
        {staff.role === "OWNER" ? <label>UPI ID (optional)<input name="upiId" maxLength={100} className={`${input} mt-1 w-full`} /></label> : null}
        <label className="sm:col-span-2">Rate notes<textarea name="rateNotes" rows={2} maxLength={1000} className={`${input} mt-1 w-full`} /></label>
        <label className="sm:col-span-2">Internal notes<textarea name="notes" rows={2} maxLength={2000} className={`${input} mt-1 w-full`} /></label>
        <button className="rounded-lg bg-ailu-yellow px-4 py-2 font-semibold text-ailu-black">Save vendor</button>
      </form>
    </details> : null}

    {rows.length === 0 ? <p className="mt-6 rounded-2xl border border-white/10 p-8 text-center text-sm text-ailu-cream/50">No vendors found.</p> : <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10"><table className="w-full text-sm"><thead className="bg-white/[0.06] text-left text-xs uppercase text-ailu-cream/50"><tr><th className="px-4 py-3">Vendor</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{rows.map((v) => <tr key={v.id} className="border-t border-white/10"><td className="px-4 py-3"><Link href={`/admin/vendors/${v.id}`} className="font-semibold text-ailu-yellow hover:underline">{v.name}</Link><div className="text-xs text-ailu-cream/50">{v.phone}</div></td><td className="px-4 py-3">{v.category}</td><td className="px-4 py-3">{v.city ?? "—"}</td><td className="px-4 py-3 text-xs">{v.status.replaceAll("_", " ")}{v.archivedAt ? " · archived" : ""}</td></tr>)}</tbody></table></div>}
  </div>;
}
