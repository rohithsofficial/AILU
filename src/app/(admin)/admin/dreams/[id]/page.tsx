// CRM: one private dream. Owner and manager only. Opening it is recorded in the audit log.
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRolePage, can } from "@/lib/authz";
import { formatIN, formatINTime } from "@/lib/format";
import { allowedDreamStatuses, DREAM_CATEGORY_LABELS, type DreamStatusValue } from "@/lib/dreams";
import { getDreamDetail } from "@/server/dreams";
import { deleteDreamAction, updateDreamReviewAction } from "../actions";

export const dynamic = "force-dynamic";
const input = "mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-ailu-cream";

export default async function DreamDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { msg?: string } }) {
  const staff = await requireRolePage(["OWNER", "MANAGER"]);
  if (!can(staff.role, "dream.read")) notFound();
  const dream = await getDreamDetail(staff, params.id);
  if (!dream) notFound();
  const minor = dream.isMinor;
  const phone = minor ? dream.guardianPhone : dream.contactPhone;
  const phoneDigits = phone?.replace(/\D/g, "") ?? "";
  const statuses = allowedDreamStatuses(dream.status as DreamStatusValue);
  const details: Array<[string, string | null]> = [
    [minor ? "Dreamer first name / nickname" : "Name / nickname", dream.displayName],
    ["City", dream.city],
    ["Category", DREAM_CATEGORY_LABELS[dream.category]],
    ["Dreamer under 18", minor ? "Yes" : "No"],
    ...(minor ? [["Parent / guardian", dream.guardianName] as [string, string | null]] : []),
    ["Submitted", formatINTime(dream.createdAt)],
  ];
  return <div className="mx-auto max-w-5xl">
    <Link href="/admin/dreams" className="text-sm text-ailu-cream/60 hover:underline">← Private dreams</Link>
    <div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="font-display text-2xl font-bold">Private dream submission</h1><span className="font-mono text-xs text-ailu-yellow">{dream.id}</span><span className="rounded-full bg-white/10 px-2 py-1 text-xs">{dream.status.replaceAll("_", " ")}</span></div>
    {searchParams.msg ? <p role="status" className="mt-4 rounded-lg border border-ailu-yellow/30 bg-ailu-yellow/10 p-3 text-sm">{searchParams.msg}</p> : null}
    <p className="mt-3 rounded-xl border border-ailu-yellow/20 bg-ailu-yellow/5 p-4 text-sm text-ailu-cream/75">Private record. Do not copy into public content, messages, or analytics. This view has been recorded in the access audit.</p>
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-white/10 bg-[#111114] p-5"><h2 className="font-semibold">Submission details</h2><dl className="mt-3 space-y-2 text-sm">{details.map(([label, value]) => <div key={label} className="flex gap-3"><dt className="w-40 shrink-0 text-ailu-cream/50">{label}</dt><dd className="whitespace-pre-wrap">{value || "—"}</dd></div>)}</dl>
        <div className="mt-4 border-t border-white/10 pt-4"><h3 className="text-sm font-semibold">Contact privately</h3>{minor ? <p className="mt-2 text-xs text-ailu-cream/50">Only the parent or guardian’s contact is shown.</p> : null}{phone ? <p className="mt-2 flex flex-wrap gap-4 text-sm"><a className="text-ailu-yellow underline" href={`tel:${phone}`}>Call {phone}</a>{phoneDigits ? <a className="text-ailu-yellow underline" href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer">WhatsApp</a> : null}</p> : null}{!minor && dream.contactEmail ? <a className="mt-2 inline-block text-sm text-ailu-yellow underline" href={`mailto:${dream.contactEmail}`}>Email {dream.contactEmail}</a> : null}</div>
        <div className="mt-4 border-t border-white/10 pt-4"><h3 className="text-sm font-semibold">The dream</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{dream.dream}</p>{dream.whyItMatters ? <><h3 className="mt-4 text-sm font-semibold">Why it matters</h3><p className="mt-2 whitespace-pre-wrap text-sm">{dream.whyItMatters}</p></> : null}{dream.helpNeeded ? <><h3 className="mt-4 text-sm font-semibold">Help requested</h3><p className="mt-2 whitespace-pre-wrap text-sm">{dream.helpNeeded}</p></> : null}</div>
      </section>
      <section className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-[#111114] p-5"><h2 className="font-semibold">Private review</h2><form action={updateDreamReviewAction} className="mt-3 space-y-3"><input type="hidden" name="id" value={dream.id}/><label className="block text-sm">Status<select name="status" defaultValue={dream.status} className={input}><option value={dream.status}>{dream.status.replaceAll("_", " ")}</option>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label><label className="block text-sm">Decision reason (required for Not possible or Closed)<textarea name="statusReason" rows={3} maxLength={1000} defaultValue={dream.statusReason ?? ""} className={input}/></label><label className="block text-sm">Internal notes<textarea name="internalNotes" rows={5} maxLength={4000} defaultValue={dream.internalNotes ?? ""} className={input}/></label><button className="min-h-11 rounded-lg border border-ailu-yellow/60 px-4 py-2 text-sm font-semibold text-ailu-yellow">Save private review</button></form></div>
        <div className="rounded-2xl border border-white/10 bg-[#111114] p-5"><h2 className="font-semibold">Status history</h2>{dream.statusHistory.length ? <ol className="mt-3 space-y-3">{[...dream.statusHistory].reverse().map((entry) => <li key={entry.id} className="border-l border-white/20 pl-3 text-sm"><p>{entry.fromStatus ? `${entry.fromStatus.replaceAll("_", " ")} → ` : ""}{entry.toStatus.replaceAll("_", " ")}</p>{entry.reason ? <p className="mt-1 whitespace-pre-wrap text-xs text-ailu-cream/60">{entry.reason}</p> : null}<time className="mt-1 block text-xs text-ailu-cream/45">{formatINTime(entry.createdAt)}</time></li>)}</ol> : <p className="mt-2 text-sm text-ailu-cream/50">No status changes recorded.</p>}</div>
        {staff.role === "OWNER" ? <div className="rounded-2xl border border-red-400/30 bg-red-950/20 p-5"><h2 className="font-semibold text-red-200">Permanently delete</h2><p className="mt-2 text-xs text-ailu-cream/65">For a verified deletion request. The record and its status history will be deleted; the audit log keeps only the reference ID and reason.</p><form action={deleteDreamAction} className="mt-3 space-y-3"><input type="hidden" name="id" value={dream.id}/><label className="block text-sm">Type <span className="font-mono">{dream.id}</span> to confirm<input name="confirmId" required autoComplete="off" className={input}/></label><label className="block text-sm">Deletion reason<textarea name="reason" required minLength={5} maxLength={500} rows={2} className={input}/></label><button className="min-h-11 rounded-lg border border-red-400/50 px-4 py-2 text-sm font-semibold text-red-200">Delete permanently</button></form></div> : null}
      </section>
    </div>
  </div>;
}
