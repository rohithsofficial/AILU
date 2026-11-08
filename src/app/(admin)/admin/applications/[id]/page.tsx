// CRM: one team application. Owner and manager can change its status, add notes or convert it into a team member.
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRolePage, can } from "@/lib/authz";
import { getApplication } from "@/server/applications";
import { formatIN } from "@/lib/format";
import { convertApplicationAction, updateApplicationAction } from "../actions";

const statuses = ["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "CONTACTED", "SELECTED", "NOT_SELECTED", "CLOSED"];
const input = "mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-ailu-cream";
function safeHttpUrl(value: string | null) {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null; } catch { return null; }
}

export default async function ApplicationDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { msg?: string } }) {
  const staff = await requireRolePage(["OWNER", "MANAGER", "STAFF"]);
  if (!can(staff.role, "applications.read")) notFound();
  const result = await getApplication(params.id);
  if (!result) notFound();
  const { application: app, auditRows } = result;
  const canEdit = can(staff.role, "applications.write");
  const portfolio = safeHttpUrl(app.portfolioUrl);
  const details: Array<[string, string | null]> = [
    ["Applicant", app.name], ["Phone", app.phone], ["Email", app.email], ["City", app.city], ["Applied role", app.role], ["Skills", app.skills],
    ["Experience", app.experience], ["Availability", app.availability], ["Event categories", app.eventCategories], ["Beginner", app.beginner ? "Yes" : "No"],
    ["Submitted note", app.notes], ["Received", formatIN(app.createdAt)],
  ];
  return <div className="mx-auto max-w-5xl"><Link href="/admin/applications" className="text-sm text-ailu-cream/60 hover:underline">← Applications</Link><div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="font-display text-2xl font-bold">{app.name}</h1><span className="font-mono text-xs text-ailu-yellow">{app.id}</span><span className="rounded-full bg-white/10 px-2 py-1 text-xs">{app.status.replaceAll("_"," ")}</span></div>
    {searchParams.msg ? <p role="status" className="mt-4 rounded-lg border border-ailu-yellow/30 bg-ailu-yellow/10 p-3 text-sm">{searchParams.msg}</p> : null}
    {app.teamMember ? <p className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-sm">Linked to <Link className="text-ailu-yellow underline" href={`/admin/team/${app.teamMember.id}`}>{app.teamMember.id} · {app.teamMember.name}</Link></p> : null}
    <div className="mt-5 grid gap-4 lg:grid-cols-2"><section className="rounded-2xl border border-white/10 bg-[#111114] p-5"><h2 className="font-semibold">Submitted details</h2><dl className="mt-3 space-y-2 text-sm">{details.map(([label,value])=><div key={label} className="flex gap-3"><dt className="w-36 shrink-0 text-ailu-cream/50">{label}</dt><dd className="whitespace-pre-wrap">{value || "—"}</dd></div>)}<div className="flex gap-3"><dt className="w-36 shrink-0 text-ailu-cream/50">Portfolio</dt><dd>{portfolio ? <a href={portfolio} target="_blank" rel="noopener noreferrer" className="text-ailu-yellow underline">Open portfolio</a> : "—"}</dd></div></dl></section>
      <section className="rounded-2xl border border-white/10 bg-[#111114] p-5"><h2 className="font-semibold">Review</h2>{canEdit ? <form action={updateApplicationAction} className="mt-3 space-y-3"><input type="hidden" name="id" value={app.id}/><label className="block text-sm">Status<select name="status" defaultValue={app.status} className={input}>{statuses.map((status)=><option key={status} className="text-black">{status}</option>)}</select></label><label className="block text-sm">Internal notes<textarea name="internalNotes" rows={5} maxLength={3000} defaultValue={app.internalNotes ?? ""} className={input}/></label><button className="rounded-lg border border-ailu-yellow/60 px-4 py-2 text-sm font-semibold text-ailu-yellow">Save review</button></form> : <dl className="mt-3 space-y-2 text-sm"><div><dt className="text-xs text-ailu-cream/50">Internal status</dt><dd>{app.status.replaceAll("_"," ")}</dd></div><div><dt className="text-xs text-ailu-cream/50">Internal notes</dt><dd className="whitespace-pre-wrap">{app.internalNotes || "—"}</dd></div></dl>}
        {canEdit && !app.teamMemberId ? <form action={convertApplicationAction} className="mt-5 border-t border-white/10 pt-4"><input type="hidden" name="id" value={app.id}/><p className="mb-2 text-xs text-ailu-cream/50">Conversion reuses an existing team member with the same normalised phone.</p><button className="rounded-full bg-ailu-yellow px-4 py-2 text-sm font-semibold text-ailu-black">Convert to team member</button></form> : null}</section></div>
    <section className="mt-5 rounded-2xl border border-white/10 bg-[#111114] p-5"><h2 className="font-semibold">Review history</h2>{auditRows.length ? <ul className="mt-3 space-y-2">{auditRows.map((row)=><li key={row.id} className="rounded-lg border border-white/10 p-3 text-sm"><div className="flex justify-between gap-3"><span className="font-medium">{row.action.replaceAll("_"," ")}</span><time className="text-xs text-ailu-cream/50">{formatIN(row.at)}</time></div><p className="mt-1 text-xs text-ailu-cream/50">{row.diff ? JSON.stringify(row.diff) : "Recorded"}</p></li>)}</ul> : <p className="mt-2 text-sm text-ailu-cream/50">No review changes yet.</p>}</section>
  </div>;
}
