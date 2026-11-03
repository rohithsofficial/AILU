import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRolePage, STAFF_ROLES, canWriteCRM, canEditEvent } from "@/lib/authz";
import { getEvent, activityForEvent, tasksForEvent } from "@/server/events";
import { listQuotations, CATEGORY_OPTIONS } from "@/server/quotations";
import { listActiveStaff } from "@/server/inbox";
import { EVENT_STATUSES, EVENT_STATUS_LABELS, canTransitionEventStatus } from "@/lib/eventStatus";
import { formatIN } from "@/lib/format";
import { formatINR, toRupees } from "@/lib/money";
import QuotationForm from "@/components/admin/QuotationForm";
import { updateEventAction, setEventStatusAction, archiveEventAction, createQuotationAction, updateQuotationAction, setQuotationStatusAction, addTaskAction, toggleTaskAction } from "../actions";

const box = "border border-white/10 bg-[#111114] p-6 rounded-2xl";
const input = "mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream placeholder:text-ailu-cream/40";
const badge = (s: string) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s === "LEAD" || s === "QUOTED" || s === "NEGOTIATION" ? "bg-blue-500/15 text-blue-400" : s === "CONFIRMED" || s === "PLANNING" ? "bg-emerald-500/15 text-emerald-400" : s === "EXECUTED" ? "bg-violet-500/15 text-violet-400" : s === "COMPLETED" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>{EVENT_STATUS_LABELS[s as keyof typeof EVENT_STATUS_LABELS] || s}</span>;

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "quotations", label: "Quotations" },
  { id: "tasks", label: "Tasks" },
  { id: "activity", label: "Activity" },
] as const;

export default async function EventDetail({ params }: { params: { id: string } }) {
  const staff = await requireRolePage(STAFF_ROLES);
  const event = await getEvent(params.id);
  if (!event) notFound();
  if (staff.role === "STAFF" && event.ownerId !== staff.id) notFound();
  const [activity, tasks, quotations] = await Promise.all([
    activityForEvent(event.id),
    tasksForEvent(event.id),
    listQuotations(event.id),
  ]);
  const staffList = await listActiveStaff();
  const canEdit = canWriteCRM(staff) && canEditEvent(staff, event);

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/events" className="text-sm text-ailu-cream/60 hover:underline">← Events</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-xl font-bold">{event.title}</h1>
        <Link href={`/admin/clients/${event.client.id}`} className="font-mono text-xs text-ailu-yellow hover:underline">{event.client.id}</Link>
        {badge(event.status)}
        {event.archivedAt ? <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-ailu-cream/60">archived</span> : null}
      </div>

      <div className="mt-4 border-b border-white/10">
        <nav className="flex flex-wrap gap-1" aria-label="Event sections">
          {TABS.map((t) => (
            <Link key={t.id} href={`#${t.id}`} className="rounded-t-lg px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:bg-white/5 text-ailu-cream/70">{t.label}</Link>
          ))}
        </nav>
      </div>

      {/* Overview */}
      <div id="overview" className="mt-6 grid gap-4 md:grid-cols-2 scroll-mt-24">
        <div className={box}>
          <h2 className="font-display font-bold">Event details</h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            {[
              ["Category", event.category], ["Tradition", event.tradition || "—"],
              ["Dates", event.startDate ? `${formatIN(event.startDate)}${event.endDate ? " – " + formatIN(event.endDate) : ""}` : "—"],
              ["Venue", `${event.venueName || "—"}${event.venueCity ? " · " + event.venueCity : ""}`],
              ["Address", event.venueAddress || "—"], ["Guests", event.guestCount ?? "—"],
              ["Budget", event.budgetPaise ? formatINR(event.budgetPaise) : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2"><dt className="w-28 shrink-0 text-ailu-cream/50">{k}</dt><dd>{v}</dd></div>
            ))}
            <div className="flex gap-2"><dt className="w-28 shrink-0 text-ailu-cream/50">Requirements</dt><dd className="whitespace-pre-wrap">{event.requirements || "—"}</dd></div>
          </dl>
        </div>

        <div className={box}>
          <h2 className="font-display font-bold">Client</h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            {[
              ["Name", event.client.name], ["Phone", event.client.phone],
              ["Email", event.client.email || "—"], ["City", event.client.city || "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2"><dt className="w-28 shrink-0 text-ailu-cream/50">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          {event.enquiryId ? <p className="mt-3 text-xs text-ailu-cream/50">Converted from <Link href={`/admin/inbox/${event.enquiryId}`} className="font-mono text-ailu-yellow underline">{event.enquiryId}</Link></p> : null}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {canEdit ? <section className={box}>
          <h2 className="font-display font-bold">Edit event details</h2>
          <form action={updateEventAction} className="mt-3 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={event.id} />
            <label className="sm:col-span-2">Title<input name="title" required minLength={2} maxLength={160} defaultValue={event.title} className={input} /></label>
            <label>Category<select name="category" defaultValue={event.category} className={input}>{CATEGORY_OPTIONS.map((category) => <option key={category.value} value={category.value} className="text-black">{category.label}</option>)}</select></label>
            <label>Tradition<input name="tradition" defaultValue={event.tradition ?? ""} className={input} placeholder="North Indian, South Indian, other" /></label>
            <label>Start date<input name="startDate" type="date" defaultValue={event.startDate?.toISOString().slice(0, 10) ?? ""} className={input} /></label>
            <label>End date<input name="endDate" type="date" defaultValue={event.endDate?.toISOString().slice(0, 10) ?? ""} className={input} /></label>
            <label>Venue<input name="venueName" defaultValue={event.venueName ?? ""} className={input} /></label>
            <label>Venue city<input name="venueCity" defaultValue={event.venueCity ?? ""} className={input} /></label>
            <label className="sm:col-span-2">Venue address<input name="venueAddress" defaultValue={event.venueAddress ?? ""} className={input} /></label>
            <label>Guest count<input name="guestCount" type="number" min={1} max={100000} defaultValue={event.guestCount ?? ""} className={input} /></label>
            <label>Budget (INR)<input name="budget" inputMode="decimal" defaultValue={event.budgetPaise == null ? "" : toRupees(event.budgetPaise)} className={input} /></label>
            {staff.role === "STAFF" ? <input type="hidden" name="ownerId" value={event.ownerId ?? ""} /> : <label>Owner<select name="ownerId" defaultValue={event.ownerId ?? ""} className={input}><option value="" className="text-black">Unassigned</option>{staffList.map((person) => <option key={person.id} value={person.id} className="text-black">{person.name || person.email}</option>)}</select></label>}
            <label className="sm:col-span-2">Requirements<textarea name="requirements" rows={3} defaultValue={event.requirements ?? ""} className={input} /></label>
            <label className="sm:col-span-2">Internal notes<textarea name="internalNotes" rows={3} defaultValue={event.internalNotes ?? ""} className={input} /></label>
            <button className="rounded-lg border border-ailu-yellow/60 px-4 py-2 font-semibold text-ailu-yellow">Save event</button>
          </form>
        </section> : null}
        <section className={box}>
          <h2 className="font-display font-bold">Pipeline status</h2>
          {canEdit ? <form action={setEventStatusAction} className="mt-3 space-y-3">
            <input type="hidden" name="id" value={event.id} />
            <label className="block text-sm">Move from {EVENT_STATUS_LABELS[event.status]} to<select name="status" defaultValue={event.status} className={input}>{EVENT_STATUSES.filter((status) => canTransitionEventStatus(event.status, status)).map((status) => <option key={status} value={status} className="text-black">{EVENT_STATUS_LABELS[status]}</option>)}</select></label>
            <label className="block text-sm">Reason (required for cancelled or lost)<input name="lostReason" defaultValue={event.lostReason ?? ""} maxLength={500} className={input} /></label>
            <button className="rounded-lg border border-ailu-yellow/60 px-4 py-2 text-sm font-semibold text-ailu-yellow">Update status</button>
          </form> : <p className="mt-2 text-sm text-ailu-cream/60">Current status: {EVENT_STATUS_LABELS[event.status]}</p>}
          {staff.role === "OWNER" ? <form action={archiveEventAction} className="mt-5 border-t border-white/10 pt-4"><input type="hidden" name="id" value={event.id} /><input type="hidden" name="archived" value={event.archivedAt ? "no" : "yes"} /><button className="text-sm text-ailu-cream/60 underline">{event.archivedAt ? "Restore event" : "Archive event"}</button></form> : null}
          {canEdit && event.status === "NEGOTIATION" && quotations.some((quotation) => quotation.status === "ACCEPTED") ? <form action={setEventStatusAction} className="mt-4"><input type="hidden" name="id" value={event.id} /><input type="hidden" name="status" value="CONFIRMED" /><button className="rounded-full bg-ailu-yellow px-4 py-2 text-sm font-semibold text-ailu-black">Mark event confirmed</button><p className="mt-2 text-xs text-ailu-cream/50">Use after availability, scope, terms and payment are agreed.</p></form> : null}
        </section>
      </div>

      {/* Quotations */}
      <div id="quotations" className="mt-6 scroll-mt-24">
        <div className={box}>
          <h2 className="font-display font-bold">Quotations ({quotations.length})</h2>
          {quotations.length === 0 ? (
            <p className="mt-3 text-sm text-ailu-cream/50">No quotations yet. Create the first version below.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {quotations.map((q) => (
                <li key={q.id} className="rounded-lg border border-white/10 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-ailu-yellow">v{q.version}</span>
                      <span className="font-semibold">{formatINR(q.totalPaise)}</span>
                      {q.validUntil ? <span className="text-xs text-ailu-cream/50">Valid until {formatIN(q.validUntil)}</span> : null}
                    </div>
                    {canEdit ? <form action={setQuotationStatusAction}>
                      <input type="hidden" name="eventId" value={event.id} />
                      <input type="hidden" name="quotationId" value={q.id} />
                      <select name="status" defaultValue={q.status} className="text-xs rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-ailu-cream">
                        {["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"].map((s) => <option key={s} value={s} className="text-black">{s}</option>)}
                      </select>
                      <button className="text-xs text-ailu-yellow underline">Save</button>
                    </form> : <span className="text-xs text-ailu-cream/60">{q.status}</span>}
                  </div>
                  <ul className="mt-2 text-xs text-ailu-cream/70">
                    {q.items.map((it, i) => (
                      <li key={i} className="flex gap-2">
                        <span>{it.quantity} × {it.description}</span>
                        <span className="ml-auto">{formatINR(it.quantity * it.unitPricePaise)}</span>
                      </li>
                    ))}
                  </ul>
                  {q.terms ? <p className="mt-2 text-xs text-ailu-cream/50">{q.terms}</p> : null}
                  {canEdit && q.status === "DRAFT" ? <QuotationForm eventId={event.id} action={updateQuotationAction} quotation={q} /> : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* New quotation form */}
        {canEdit ? <QuotationForm eventId={event.id} action={createQuotationAction} /> : null}
      </div>

      {/* Tasks */}
      <div id="tasks" className="mt-6 scroll-mt-24">
        <div className={box}>
          <h2 className="font-display font-bold">Follow-up tasks ({tasks.length})</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {tasks.length === 0 ? <li className="text-ailu-cream/50">No tasks yet.</li> : null}
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2">
                <span className={t.doneAt ? "line-through text-ailu-cream/50" : ""}>{t.title}{t.dueAt ? <span className="ml-2 text-xs text-ailu-cream/50">due {formatIN(t.dueAt)}</span> : null}</span>
                {canEdit || (staff.role === "STAFF" && t.assigneeId === staff.id) ? <form action={toggleTaskAction}>
                  <input type="hidden" name="eventId" value={event.id} />
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="done" value={t.doneAt ? "no" : "yes"} />
                  <button className="text-xs text-ailu-yellow underline">{t.doneAt ? "Reopen" : "Mark done"}</button>
                </form> : null}
              </li>
            ))}
          </ul>
          {canEdit ? <form action={addTaskAction} className="mt-3 flex flex-wrap items-end gap-2 text-sm">
            <input type="hidden" name="eventId" value={event.id} />
            <label className="flex-1">New task<input name="title" required placeholder="Call client to discuss dates" className={input} /></label>
            <label>Due<input name="dueAt" type="date" className={`${input} w-40`} /></label>
            <label>Assignee<select name="assigneeId" className={`${input} w-48`}><option value="" className="text-black">Unassigned</option>{staffList.map((s) => <option key={s.id} value={s.id} className="text-black">{s.name || s.email}</option>)}</select></label>
            <label>Priority<select name="priority" className={`${input} w-32`}><option value="HIGH" className="text-black">HIGH</option><option value="NORMAL" className="text-black">NORMAL</option><option value="LOW" className="text-black">LOW</option></select></label>
            <button className="rounded-lg border border-ailu-yellow/60 px-4 py-2 font-semibold text-ailu-yellow">Add</button>
          </form> : null}
        </div>
      </div>

      {/* Activity */}
      <div id="activity" className="mt-6 scroll-mt-24">
        <div className={box}>
          <h2 className="font-display font-bold">Timeline ({activity.length})</h2>
          {activity.length === 0 ? (
            <p className="mt-3 text-sm text-ailu-cream/50">No activity logged yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {activity.map((a) => (
                <li key={a.id} className="flex gap-3 rounded-lg border border-white/10 px-3 py-2">
                  <span className="whitespace-nowrap text-xs text-ailu-cream/50">{formatIN(a.at)}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-ailu-cream/70">{a.kind}</span>
                  <span className="flex-1 text-ailu-cream/80">{a.body}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
