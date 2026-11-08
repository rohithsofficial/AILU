// CRM: private dream submissions. Owner and manager only. The list shows no dream text, only metadata.
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRolePage, can } from "@/lib/authz";
import { formatIN, formatRelative } from "@/lib/format";
import { DREAM_CATEGORIES, DREAM_CATEGORY_LABELS, DREAM_STATUSES } from "@/lib/dreams";
import { listDreams } from "@/server/dreams";

export const dynamic = "force-dynamic";
const input = "rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-ailu-cream";

export default async function DreamsPage({ searchParams }: { searchParams: { q?: string; status?: string; category?: string; minor?: string; page?: string; msg?: string } }) {
  const staff = await requireRolePage(["OWNER", "MANAGER"]);
  if (!can(staff.role, "dream.read")) notFound();
  const page = Number(searchParams.page ?? 1) || 1;
  const data = await listDreams(staff, { ...searchParams, page });
  const filters = new URLSearchParams();
  for (const key of ["q", "status", "category", "minor"] as const) if (searchParams[key]) filters.set(key, searchParams[key]!);
  const pageHref = (to: number) => { const query = new URLSearchParams(filters); query.set("page", String(to)); return `/admin/dreams?${query}`; };

  return <div className="mx-auto max-w-6xl">
    <h1 className="font-display text-2xl font-bold">Private dream submissions</h1>
    <p className="mt-1 text-sm text-ailu-cream/60">Restricted review for OWNER and MANAGER. Submission text is only shown after opening a record.</p>
    {searchParams.msg ? <p role="status" className="mt-4 rounded-lg border border-ailu-yellow/30 bg-ailu-yellow/10 p-3 text-sm">{searchParams.msg}</p> : null}
    <form action="/admin/dreams" className="mt-5 flex flex-wrap gap-2">
      <input name="q" defaultValue={searchParams.q ?? ""} maxLength={80} placeholder="Search reference ID or nickname" aria-label="Search reference ID or nickname" className={input} />
      <select name="status" defaultValue={searchParams.status ?? ""} aria-label="Filter by status" className={input}><option value="" className="text-black">All statuses</option>{DREAM_STATUSES.map((status) => <option key={status} value={status} className="text-black">{status.replaceAll("_", " ")}</option>)}</select>
      <select name="category" defaultValue={searchParams.category ?? ""} aria-label="Filter by category" className={input}><option value="" className="text-black">All categories</option>{DREAM_CATEGORIES.map((category) => <option key={category} value={category} className="text-black">{DREAM_CATEGORY_LABELS[category]}</option>)}</select>
      <select name="minor" defaultValue={searchParams.minor ?? ""} aria-label="Filter by age group" className={input}><option value="" className="text-black">All ages</option><option value="yes" className="text-black">Dreamer under 18</option><option value="no" className="text-black">Dreamer 18 or older</option></select>
      <button className="min-h-11 rounded-lg border border-white/20 px-4 py-2 text-sm">Filter</button>
    </form>
    {data.rows.length ? <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10"><table className="w-full text-sm"><thead className="bg-white/[0.06] text-left text-xs uppercase text-ailu-cream/50"><tr><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Dreamer under 18</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Submitted</th></tr></thead><tbody>{data.rows.map((row) => <tr key={row.id} className="border-t border-white/10"><td className="px-4 py-3"><Link href={`/admin/dreams/${row.id}`} className="font-mono text-ailu-yellow hover:underline">{row.id}</Link>{row.displayName ? <div className="mt-1 text-xs text-ailu-cream/50">{row.displayName}</div> : null}</td><td className="px-4 py-3">{DREAM_CATEGORY_LABELS[row.category]}</td><td className="px-4 py-3">{row.city}</td><td className="px-4 py-3">{row.isMinor ? "Yes" : "No"}</td><td className="px-4 py-3">{row.status.replaceAll("_", " ")}</td><td className="px-4 py-3 text-xs" title={formatIN(row.createdAt)}>{formatRelative(row.createdAt)}</td></tr>)}</tbody></table></div> : <p className="mt-6 rounded-2xl border border-white/10 p-8 text-center text-sm text-ailu-cream/50">No private dream submissions match these filters.</p>}
    <div className="mt-4 flex items-center justify-between text-sm text-ailu-cream/60"><span>{data.total} submissions · page {data.page} of {data.pages}</span><div className="flex gap-4">{data.page > 1 ? <Link className="underline" href={pageHref(data.page - 1)}>← previous</Link> : null}{data.page < data.pages ? <Link className="underline" href={pageHref(data.page + 1)}>next →</Link> : null}</div></div>
  </div>;
}
