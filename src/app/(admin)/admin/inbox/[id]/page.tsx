import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRolePage, STAFF_ROLES } from "@/lib/authz";
import { getEnquiry, listActiveStaff } from "@/server/inbox";
import { ENQUIRY_STATUSES } from "@/lib/enquiryStatus";
import { formatIN } from "@/lib/format";
import { humanize } from "@/lib/format";
import { convertEnquiryAction, assignOwnerAction, setEnquiryStatusAction, toggleSpamAction, addTaskAction, toggleTaskAction } from "../actions";

export const dynamic = "force-dynamic";

const box = "border border-white/10 bg-[#111114] p-6 rounded-2xl";
const input = "mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream placeholder:text-ailu-cream/40";

export default async function EnquiryDetail({ searchParams, params }: { searchParams: { msg?: string }; params: { id: string } }) {
  const staff = await requireRolePage(STAFF_ROLES);
  const data = await getEnquiry(params.id);
  if (!data) notFound();
  const { enquiry, tasks } = data;
  const staffList = await listActiveStaff();

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/inbox" className="text-sm text-ailu-cream/60 hover:underline">← Inbox</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-xl font-bold text-ailu-yellow">{enquiry.id}</h1>
        <span className="text-sm text-ailu-cream/70">{formatIN(enquiry.createdAt)}</span>
        {enquiry.event ? <Link href={`/admin/events/${enquiry.event.id}`} className="rounded-full bg-ailu-yellow/15 px-3 py-1 text-xs font-semibold text-ailu-yellow">→ {enquiry.event.id}</Link> : null}
      </div>
      {searchParams?.msg ? <p className="mt-3 rounded-lg bg-ailu-yellow/10 px-4 py-2 text-sm text-ailu-yellow">{searchParams.msg}</p> : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className={box}>
          <h2 className="font-display font-bold">Details</h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            {[
              ["Name", enquiry.name], ["Phone", enquiry.phone], ["Email", enquiry.email || "—"],
              ["Category", enquiry.category], ["Date", enquiry.eventDate || "—"], ["Location", enquiry.location],
              ["Guests", enquiry.guests ?? "—"], ["Budget", enquiry.budget || "—"], ["Services", enquiry.services || "—"],
              ["Referred by", enquiry.referredBySpId || "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2"><dt className="w-24 shrink-0 text-ailu-cream/50">{k}</dt><dd>{v}</dd></div>
            ))}
            <div className="flex gap-2"><dt className="w-24 shrink-0 text-ailu-cream/50">Message</dt><dd className="whitespace-pre-wrap">{enquiry.details || "—"}</dd></div>
          </dl>
        </div>

        <div className={`space-y-4 ${staff.role === "ACCOUNTS" ? "pointer-events-none opacity-50" : ""}`}>
          <div className={box}>
            <h2 className="font-display font-bold">Convert</h2>
            {enquiry.eventId ? (
              <p className="mt-2 text-sm text-ailu-cream/60">Already converted: <Link href={`/admin/events/${enquiry.event!.id}`} className="font-mono text-ailu-yellow underline">{enquiry.event!.id}</Link></p>
            ) : (
              <form action={convertEnquiryAction} className="mt-3 space-y-3">
                <input type="hidden" name="id" value={enquiry.id} />
                <label className="block text-sm">Event title<input name="title" defaultValue={`${enquiry.category} for ${enquiry.name}`} className={input} /></label>
                <label className="block text-sm">Owner<select name="ownerId" defaultValue={enquiry.ownerId ?? ""} className={input}><option value="" className="text-black">Unassigned</option>{staffList.map((s) => <option key={s.id} value={s.id} className="text-black">{s.name || s.email}</option>)}</select></label>
                <button className="rounded-full bg-ailu-yellow px-5 py-2 text-sm font-semibold text-ailu-black">Convert to client + event</button>
              </form>
            )}
          </div>

          <div className={box}>
            <h2 className="font-display font-bold">Manage</h2>
            <form action={assignOwnerAction} className="mt-3 flex items-end gap-2 text-sm">
              <input type="hidden" name="id" value={enquiry.id} />
              <label className="flex-1">Owner<select name="ownerId" defaultValue={enquiry.ownerId ?? ""} className={input}><option value="" className="text-black">Unassigned</option>{staffList.map((s) => <option key={s.id} value={s.id} className="text-black">{s.name || s.email}</option>)}</select></label>
              <button className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10">Save</button>
            </form>
            <form action={setEnquiryStatusAction} className="mt-3 flex items-end gap-2 text-sm">
              <input type="hidden" name="id" value={enquiry.id} />
              <label className="flex-1">Enquiry status<select name="status" defaultValue={enquiry.status} className={input}>{ENQUIRY_STATUSES.map((s) => <option key={s} value={s} className="text-black">{humanize(s)}</option>)}</select></label>
              <button className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10">Save</button>
            </form>
            <form action={toggleSpamAction} className="mt-3">
              <input type="hidden" name="id" value={enquiry.id} />
              <input type="hidden" name="spam" value={enquiry.spam ? "no" : "yes"} />
              <button className="text-sm text-red-400 underline">{enquiry.spam ? "Mark as not spam" : "Mark as spam"}</button>
            </form>
          </div>
        </div>
      </div>

      <div className={`${box} mt-4 ${staff.role === "ACCOUNTS" ? "pointer-events-none opacity-50" : ""}`}>
        <h2 className="font-display font-bold">Follow-up tasks</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {tasks.length === 0 ? <li className="text-ailu-cream/50">No tasks yet.</li> : null}
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2">
              <span className={t.doneAt ? "line-through text-ailu-cream/50" : ""}>{t.title}{t.dueAt ? <span className="ml-2 text-xs text-ailu-cream/50">due {formatIN(t.dueAt)}</span> : null}</span>
              <form action={toggleTaskAction}>
                <input type="hidden" name="enquiryId" value={enquiry.id} />
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="done" value={t.doneAt ? "no" : "yes"} />
                <button className="text-xs text-ailu-yellow underline">{t.doneAt ? "Reopen" : "Mark done"}</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={addTaskAction} className="mt-3 flex flex-wrap items-end gap-2 text-sm">
          <input type="hidden" name="enquiryId" value={enquiry.id} />
          <label className="flex-1">New task<input name="title" required placeholder="Call to discuss quotation" className={input} /></label>
          <label>Due<input name="dueAt" type="date" className={`${input} w-40`} /></label>
          <button className="rounded-lg border border-ailu-yellow/60 px-4 py-2 font-semibold text-ailu-yellow">Add</button>
        </form>
      </div>
    </div>
  );
}
