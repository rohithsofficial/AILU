// CRM: list of team applications from /join/team, with search and filters. Owner, manager and staff.
import Link from "next/link";
import { requireRolePage, can } from "@/lib/authz";
import { listApplications } from "@/server/applications";
import { formatIN } from "@/lib/format";

export const dynamic = "force-dynamic";
const statuses = ["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "CONTACTED", "SELECTED", "NOT_SELECTED", "CLOSED"];
const input = "rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-ailu-cream";
export default async function ApplicationsPage({ searchParams }: { searchParams: { q?: string; status?: string; role?: string; beginner?: string; page?: string } }) {
  const staff = await requireRolePage(["OWNER", "MANAGER", "STAFF"]);
  if (!can(staff.role, "applications.read")) return <p>You do not have access to applications.</p>;
  const page = Number(searchParams.page ?? 1) || 1;
  const data = await listApplications({ ...searchParams, page });
  const query = new URLSearchParams({ ...(searchParams.q ? { q: searchParams.q } : {}), ...(searchParams.status ? { status: searchParams.status } : {}), ...(searchParams.role ? { role: searchParams.role } : {}), ...(searchParams.beginner ? { beginner: searchParams.beginner } : {}) });
  const pageHref = (to: number) => { const p = new URLSearchParams(query); p.set("page", String(to)); return `/admin/applications?${p}`; };
  return <div className="mx-auto max-w-6xl"><h1 className="font-display text-2xl font-bold">Applications</h1><p className="mt-1 text-sm text-ailu-cream/60">Review people who applied to work with AILU.</p>
    <form action="/admin/applications" className="mt-5 flex flex-wrap gap-2"><input name="q" defaultValue={searchParams.q ?? ""} placeholder="Search ID, name, phone, city" className={input}/><select name="status" defaultValue={searchParams.status ?? ""} className={input}><option value="" className="text-black">All statuses</option>{statuses.map((s)=><option key={s} value={s} className="text-black">{s.replaceAll("_"," ")}</option>)}</select><input name="role" defaultValue={searchParams.role ?? ""} placeholder="Role" className={input}/><select name="beginner" defaultValue={searchParams.beginner ?? ""} className={input}><option value="" className="text-black">All experience levels</option><option value="yes" className="text-black">Beginner</option><option value="no" className="text-black">Experienced</option></select><button className="rounded-lg border border-white/20 px-4 py-2 text-sm">Filter</button></form>
    {data.rows.length ? <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10"><table className="w-full text-sm"><thead className="bg-white/[0.06] text-left text-xs uppercase text-ailu-cream/50"><tr><th className="px-4 py-3">Application</th><th className="px-4 py-3">Applicant</th><th className="px-4 py-3">City / role</th><th className="px-4 py-3">Level</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Received</th></tr></thead><tbody>{data.rows.map((app)=><tr key={app.id} className="border-t border-white/10"><td className="px-4 py-3"><Link href={`/admin/applications/${app.id}`} className="font-mono text-ailu-yellow hover:underline">{app.id}</Link></td><td className="px-4 py-3">{app.name}<div className="text-xs text-ailu-cream/50">{app.phone}</div></td><td className="px-4 py-3">{app.city}<div className="text-xs text-ailu-cream/50">{app.role}</div></td><td className="px-4 py-3">{app.beginner ? "Beginner" : "Experienced"}</td><td className="px-4 py-3">{app.teamMemberId ? <Link href={`/admin/team/${app.teamMemberId}`} className="text-ailu-yellow underline">Team member linked</Link> : app.status.replaceAll("_"," ")}</td><td className="px-4 py-3 text-xs">{formatIN(app.createdAt)}</td></tr>)}</tbody></table></div> : <p className="mt-6 rounded-2xl border border-white/10 p-8 text-center text-sm text-ailu-cream/50">No applications match these filters.</p>}
    <div className="mt-4 flex items-center justify-between text-sm text-ailu-cream/60"><span>{data.total} total · page {data.page} of {data.pages}</span><div className="flex gap-4">{data.page > 1 ? <Link className="underline" href={pageHref(data.page-1)}>← previous</Link> : null}{data.page < data.pages ? <Link className="underline" href={pageHref(data.page+1)}>next →</Link> : null}</div></div>
  </div>;
}
