import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRolePage, STAFF_ROLES, canWriteCRM, canEditEvent, can } from "@/lib/authz";
import { getEvent, activityForEvent, tasksForEvent } from "@/server/events";
import { listQuotations, CATEGORY_OPTIONS } from "@/server/quotations";
import { listActiveStaff } from "@/server/inbox";
import { EVENT_STATUSES, EVENT_STATUS_LABELS, canTransitionEventStatus } from "@/lib/eventStatus";
import { formatIN } from "@/lib/format";
import { formatINR, toRupees } from "@/lib/money";
import QuotationForm from "@/components/admin/QuotationForm";
import { eventFinancials, listVendors, vendorBookingsForEvent } from "@/server/vendors";
import { listActiveTeamMembers, eventAssignments } from "@/server/team";
import { checkCommissionEligibility, commissionsForEvent, referralPartnersForEvent } from "@/server/partners";
import { ConfirmButton, EditBox } from "@/components/admin/RecordControls";
import NoteControls from "@/components/admin/NoteControls";
import { deleteAssignmentAction, deleteExpenseAction, deletePaymentAction, deleteQuotationAction, deleteVendorBookingAction, updateAssignmentAction, updateExpenseAction, updatePaymentAction, updateVendorBookingAction } from "../../records/actions";
import { updateEventAction, setEventStatusAction, archiveEventAction, createQuotationAction, updateQuotationAction, setQuotationStatusAction, addTaskAction, toggleTaskAction } from "../actions";
import { createVendorBookingAction, setVendorBookingStatusAction, createPaymentAction, createExpenseAction } from "../../vendors/actions";
import { assignTeamMemberAction, setAssignmentStatusAction } from "../../team/actions";
import { proposeCommissionAction } from "../../partners/actions";

const box = "border border-white/10 bg-[#111114] p-6 rounded-2xl";
const input = "mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream placeholder:text-ailu-cream/40";
const badge = (s: string) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s === "LEAD" || s === "QUOTED" || s === "NEGOTIATION" ? "bg-blue-500/15 text-blue-400" : s === "CONFIRMED" || s === "PLANNING" ? "bg-emerald-500/15 text-emerald-400" : s === "EXECUTED" ? "bg-violet-500/15 text-violet-400" : s === "COMPLETED" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>{EVENT_STATUS_LABELS[s as keyof typeof EVENT_STATUS_LABELS] || s}</span>;

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "quotations", label: "Quotations" },
  { id: "tasks", label: "Tasks" },
  { id: "activity", label: "Activity" },
  { id: "vendors", label: "Vendors" },
  { id: "finance", label: "Finance" },
  { id: "team", label: "Team" },
  { id: "referral", label: "Referral & reward" },
] as const;

const rupees = (paise?: number | null) => (paise == null ? "" : (paise / 100).toFixed(2));

export default async function EventDetail({ params, searchParams }: { params: { id: string }; searchParams?: { msg?: string } }) {
  const staff = await requireRolePage(STAFF_ROLES);
  const canReadFinance = can(staff.role, "finance.read");
  const event = await getEvent(params.id);
  if (!event) notFound();
  if (staff.role === "STAFF" && event.ownerId !== staff.id) notFound();
  const canReadTeam = can(staff.role, "team.read");
  const canReadCommissions = can(staff.role, "commissions.read");
  const [activity, tasks, quotations, finance, vendors, vendorBookings, teamMembers, assignments, referralPartners, commissions] = await Promise.all([
    activityForEvent(event.id),
    tasksForEvent(event.id),
    listQuotations(event.id),
    canReadFinance ? eventFinancials(event.id) : Promise.resolve(null),
    can(staff.role, "vendors.read") ? listVendors({ status: "ACTIVE" }) : Promise.resolve([]),
    can(staff.role, "vendors.read") ? vendorBookingsForEvent(event.id) : Promise.resolve([]),
    canReadTeam ? listActiveTeamMembers() : Promise.resolve([]),
    canReadTeam ? eventAssignments(event.id, staff.role !== "STAFF") : Promise.resolve([]),
    canReadCommissions ? referralPartnersForEvent(event.id) : Promise.resolve([]),
    canReadCommissions ? commissionsForEvent(event.id) : Promise.resolve([]),
  ]);
  const staffList = await listActiveStaff();
  const canEdit = canWriteCRM(staff) && canEditEvent(staff, event);
  const canProposeCommission = can(staff.role, "commissions.propose");
  const eligibleProposalPartners = canProposeCommission ? (await Promise.all(referralPartners.map(async (partner) => ({ partner, result: await checkCommissionEligibility(event.id, partner.id) })))).filter(({ partner, result }) => !result.issues.length && !commissions.some((commission) => commission.partnerId === partner.id && commission.status !== "REJECTED")).map(({ partner }) => partner) : [];

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/events" className="text-sm text-ailu-cream/60 hover:underline">← Events</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-xl font-bold">{event.title}</h1>
        <Link href={`/admin/clients/${event.client.id}`} className="font-mono text-xs text-ailu-yellow hover:underline">{event.client.id}</Link>
        {badge(event.status)}
        {event.archivedAt ? <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-ailu-cream/60">archived</span> : null}
      </div>
      {searchParams?.msg ? <p role="status" className="mt-4 rounded-lg border border-ailu-yellow/30 bg-ailu-yellow/10 p-3 text-sm">{searchParams.msg}</p> : null}

      <div className="mt-4 border-b border-white/10">
        <nav className="flex flex-wrap gap-1" aria-label="Event sections">
          {TABS.filter((tab) => (tab.id !== "finance" || canReadFinance) && (tab.id !== "team" || canReadTeam) && (tab.id !== "referral" || canReadCommissions)).map((t) => (
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
                  {canEdit && q.status === "DRAFT" ? <form action={deleteQuotationAction} className="mt-2"><input type="hidden" name="id" value={q.id} /><input type="hidden" name="eventId" value={event.id} /><input type="hidden" name="back" value={`/admin/events/${event.id}`} /><ConfirmButton label="Delete draft" message="Delete this draft quotation? This cannot be undone." /></form> : null}
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
                <li key={a.id} className="flex flex-wrap gap-3 rounded-lg border border-white/10 px-3 py-2">
                  <span className="whitespace-nowrap text-xs text-ailu-cream/50">{formatIN(a.at)}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-ailu-cream/70">{a.kind}</span>
                  <span className="flex-1 text-ailu-cream/80">{a.body}</span>
                  <NoteControls note={a} staff={staff} back={`/admin/events/${event.id}`} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Vendors */}
      <section id="vendors" className="mt-6 scroll-mt-24 rounded-2xl border border-white/10 bg-[#111114] p-6">
        <h2 className="font-display font-bold">Vendors ({vendorBookings.length})</h2>
        {vendorBookings.length ? <ul className="mt-3 space-y-2">{vendorBookings.map((booking) => <li key={booking.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 p-3 text-sm"><Link href={`/admin/vendors/${booking.vendor.id}`} className="text-ailu-yellow hover:underline">{booking.vendor.name}</Link><span className="text-ailu-cream/60">{booking.service}</span>{finance?.bookings.find((item) => item.id === booking.id)?.agreedAmountPaise != null ? <span className="text-ailu-cream/60">{formatINR(finance.bookings.find((item) => item.id === booking.id)!.agreedAmountPaise!)}</span> : null}<span className="ml-auto text-xs">{booking.status}</span>{canEdit ? <form action={setVendorBookingStatusAction} className="flex gap-1"><input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="bookingId" value={booking.id}/><select name="status" defaultValue={booking.status} className="rounded border border-white/20 bg-white/10 px-2 py-1 text-xs">{["ENQUIRED","QUOTED","CONFIRMED","DONE","CANCELLED"].map((s)=><option key={s} className="text-black">{s}</option>)}</select><button className="text-xs text-ailu-yellow underline">Save</button></form> : null}{canEdit ? <form action={deleteVendorBookingAction}><input type="hidden" name="id" value={booking.id}/><input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="back" value={`/admin/events/${event.id}#vendors`}/><ConfirmButton label="Delete" message="Delete this vendor booking? This cannot be undone."/></form> : null}{canEdit ? <EditBox><form action={updateVendorBookingAction} className="grid gap-2 sm:grid-cols-3"><input type="hidden" name="id" value={booking.id}/><input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="back" value={`/admin/events/${event.id}#vendors`}/><label>Service<input required name="service" minLength={2} maxLength={160} defaultValue={booking.service} className={input}/></label>{finance ? <label>Agreed amount (₹)<input name="amount" inputMode="decimal" defaultValue={rupees(finance.bookings.find((item) => item.id === booking.id)?.agreedAmountPaise)} className={input}/></label> : null}<label>Notes<input name="notes" maxLength={1000} defaultValue={booking.notes ?? ""} className={input}/></label><button className="rounded-lg border border-ailu-yellow/60 px-3 py-1 text-xs font-semibold text-ailu-yellow sm:col-span-3">Save booking</button></form></EditBox> : null}</li>)}</ul> : <p className="mt-2 text-sm text-ailu-cream/50">No vendors assigned yet.</p>}
        {canEdit && vendors.length ? <form action={createVendorBookingAction} className="mt-4 grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-2 lg:grid-cols-5"><input type="hidden" name="eventId" value={event.id}/><label className="lg:col-span-2">Vendor<select required name="vendorId" className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm"><option value="" className="text-black">Select vendor</option>{vendors.map((v)=><option key={v.id} value={v.id} className="text-black">{v.name} · {v.category}</option>)}</select></label><label>Service<input required name="service" maxLength={160} className={input}/></label><label>Agreed amount (₹)<input name="amount" inputMode="decimal" className={input}/></label><label>Status<select name="status" className={input}>{["ENQUIRED","QUOTED","CONFIRMED","DONE"].map((s)=><option key={s} className="text-black">{s}</option>)}</select></label><label className="sm:col-span-2 lg:col-span-4">Notes<input name="notes" maxLength={1000} className={input}/></label><button className="self-end rounded-lg border border-ailu-yellow/60 px-3 py-2 text-sm font-semibold text-ailu-yellow">Add vendor</button></form> : null}
        {canEdit && !vendors.length ? <p className="mt-3 text-sm text-ailu-cream/50">Add an active vendor in the directory before assigning one to this event.</p> : null}
      </section>

      {/* Team assignments */}
      {canReadTeam ? <section id="team" className="mt-6 scroll-mt-24 rounded-2xl border border-white/10 bg-[#111114] p-6"><h2 className="font-display font-bold">Team ({assignments.length})</h2>{assignments.length ? <ul className="mt-3 space-y-2">{assignments.map((assignment)=><li key={assignment.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 p-3 text-sm"><Link href={`/admin/team/${assignment.teamMember.id}`} className="text-ailu-yellow hover:underline">{assignment.teamMember.name}</Link><span>{assignment.role}</span>{"feePaise" in assignment && assignment.feePaise != null ? <span>{formatINR(assignment.feePaise)}</span> : null}<span className="ml-auto text-xs text-ailu-cream/60">{assignment.status}</span>{canEdit ? <form action={setAssignmentStatusAction} className="flex gap-1"><input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="assignmentId" value={assignment.id}/><select name="status" defaultValue={assignment.status} className="rounded border border-white/20 bg-white/10 px-2 py-1 text-xs">{["ASSIGNED","CONFIRMED","DONE","DROPPED"].map((s)=><option key={s} className="text-black">{s}</option>)}</select><button className="text-xs text-ailu-yellow underline">Save</button></form> : null}{canEdit ? <form action={deleteAssignmentAction}><input type="hidden" name="id" value={assignment.id}/><input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="back" value={`/admin/events/${event.id}#team`}/><ConfirmButton label="Delete" message="Remove this assignment? This cannot be undone."/></form> : null}{canEdit ? <EditBox><form action={updateAssignmentAction} className="grid gap-2 sm:grid-cols-3"><input type="hidden" name="id" value={assignment.id}/><input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="back" value={`/admin/events/${event.id}#team`}/><label>Role<input required name="role" minLength={2} maxLength={80} defaultValue={assignment.role} className={input}/></label>{staff.role !== "STAFF" ? <label>Agreed fee (₹)<input name="fee" inputMode="decimal" defaultValue={rupees(assignment.feePaise)} className={input}/></label> : null}<label>Notes<input name="notes" maxLength={1000} defaultValue={assignment.notes ?? ""} className={input}/></label><button className="rounded-lg border border-ailu-yellow/60 px-3 py-1 text-xs font-semibold text-ailu-yellow sm:col-span-3">Save assignment</button></form></EditBox> : null}</li>)}</ul> : <p className="mt-2 text-sm text-ailu-cream/50">No team members assigned.</p>}
        {canEdit && teamMembers.length ? <form action={assignTeamMemberAction} className="mt-4 grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-2 lg:grid-cols-4"><input type="hidden" name="eventId" value={event.id}/><label>Team member<select required name="teamMemberId" className={input}><option value="" className="text-black">Select member</option>{teamMembers.map((member)=><option key={member.id} value={member.id} className="text-black">{member.name} · {member.roles.join(", ")}</option>)}</select></label><label>Event role<input required name="role" maxLength={80} placeholder="Host, dancer, coordinator…" className={input}/></label>{staff.role !== "STAFF" ? <label>Agreed fee (₹)<input name="fee" inputMode="decimal" className={input}/></label> : null}<label>Notes<input name="notes" maxLength={1000} className={input}/></label><button className="self-end rounded-lg border border-ailu-yellow/60 px-3 py-2 text-sm font-semibold text-ailu-yellow">Assign team member</button></form> : null}
        {canEdit && !teamMembers.length ? <p className="mt-3 text-sm text-ailu-cream/50">Add or convert an active team member before assigning one to this event.</p> : null}
      </section> : null}

      {/* Referral and reward proposal */}
      {canReadCommissions ? <section id="referral" className="mt-6 scroll-mt-24 rounded-2xl border border-white/10 bg-[#111114] p-6"><h2 className="font-display font-bold">Referral and commission</h2>{referralPartners.length ? <ul className="mt-3 space-y-2">{referralPartners.map((partner)=><li key={partner.id} className="rounded-lg border border-white/10 p-3 text-sm"><Link href={`/admin/partners/${partner.id}`} className="text-ailu-yellow underline">{partner.name} · {partner.id}</Link><span className="ml-2 text-xs text-ailu-cream/50">Partner status: {partner.status}</span></li>)}</ul> : <p className="mt-2 text-sm text-ailu-cream/50">No partner referral is linked to this event.</p>}{commissions.length ? <ul className="mt-3 space-y-2">{commissions.map((commission)=><li key={commission.id} className="rounded-lg border border-white/10 p-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><span>{commission.partner.name} · {commission.status.replaceAll("_"," ")} · v{commission.version}</span><strong>{formatINR(commission.amountPaise)}</strong></div><p className="mt-2 text-ailu-cream/70">{commission.basis}</p>{commission.rejectionReason ? <p className="mt-1 text-xs text-ailu-cream/50">Reason: {commission.rejectionReason}</p> : null}</li>)}</ul> : null}{canProposeCommission && referralPartners.length ? <div className="mt-4 border-t border-white/10 pt-4">{eligibleProposalPartners.length ? <form action={proposeCommissionAction} className="grid gap-2 sm:grid-cols-3"><input type="hidden" name="eventId" value={event.id}/><h3 className="font-semibold sm:col-span-3">Propose a manual reward</h3><label>Referred partner<select name="partnerId" required className={input}>{eligibleProposalPartners.map((partner)=><option key={partner.id} value={partner.id} className="text-black">{partner.name} · {partner.status}</option>)}</select></label><label>Amount (₹)<input required name="amount" inputMode="decimal" className={input}/></label><label className="sm:col-span-2">Basis / explanation<input required name="basis" minLength={5} maxLength={1200} className={input}/></label><p className="text-xs text-ailu-cream/50 sm:col-span-3">Proposals require an approved partner, completed event, accepted quote and full client payment. An owner must approve; no commission rate is assumed.</p><button className="rounded-lg bg-ailu-yellow px-4 py-2 text-sm font-semibold text-ailu-black sm:col-span-3">Submit proposal</button></form> : <p className="mt-4 text-sm text-ailu-cream/50">No eligible partner is ready for another proposal. Check partner approval, event completion, accepted quotation, full client payment, and any earlier proposal.</p>}</div> : null}<p className="mt-4 text-xs text-ailu-cream/50"><Link href={`/admin/commissions${referralPartners[0] ? `?partnerId=${encodeURIComponent(referralPartners[0].id)}` : ""}`} className="text-ailu-yellow underline">Open commission register</Link>. Rewards are proposed and subject to owner approval; they are not guaranteed earnings.</p></section> : null}

      {/* Finance: OWNER/ACCOUNTS write; OWNER/MANAGER/ACCOUNTS read. */}
      {finance ? <section id="finance" className="mt-6 scroll-mt-24 rounded-2xl border border-white/10 bg-[#111114] p-6">
        <h2 className="font-display font-bold">Event finance</h2>
        <p className="mt-1 text-xs text-ailu-cream/50">Revenue uses the latest accepted quotation. Vendor commitments and non-vendor expenses count once toward margin; outgoing payments track cash paid.</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[["Accepted quote",finance.quotedPaise],["Received",finance.receivedPaise],["Client balance due",finance.balanceDuePaise],["Vendor commitments",finance.vendorCostPaise],["Vendor due",finance.vendorDuePaise],["Team commitments",finance.teamCostPaise],["Team paid",finance.teamPaidPaise],["Team due",finance.teamDuePaise],["Approved partner rewards",finance.partnerCommissionPaise],["Other expenses",finance.otherExpensePaise],["Estimated margin",finance.profitPaise]].map(([label,value])=><div key={label} className="rounded-xl border border-white/10 p-3"><dt className="text-xs text-ailu-cream/50">{label}</dt><dd className="mt-1 font-semibold">{formatINR(Number(value))}</dd></div>)}</dl>
        {can(staff.role, "finance.write") ? <div className="mt-5 grid gap-4 border-t border-white/10 pt-4 lg:grid-cols-2">
          <form action={createPaymentAction} className="grid gap-2 sm:grid-cols-2"><input type="hidden" name="eventId" value={event.id}/><h3 className="font-semibold sm:col-span-2">Record payment</h3><label>Direction<select name="direction" className={input}><option value="IN" className="text-black">Client payment received</option><option value="OUT" className="text-black">Outgoing payment</option></select></label><label>Purpose<input name="purpose" maxLength={80} placeholder="Advance, final, vendor balance…" className={input}/></label><label>Amount (₹)<input required name="amount" inputMode="decimal" className={input}/></label><label>Payment mode<select name="mode" className={input}>{["CASH","UPI","BANK_TRANSFER","CARD","CHEQUE","OTHER"].map((m)=><option key={m} className="text-black">{m}</option>)}</select></label><label>Date<input required type="date" name="paidOn" defaultValue={new Date().toISOString().slice(0,10)} className={input}/></label><label>Reference (UPI/cheque only)<input name="reference" maxLength={120} className={input}/></label><label>Vendor booking<select name="vendorBookingId" className={input}><option value="" className="text-black">Not linked</option>{finance.bookings.map((b)=><option key={b.id} value={b.id} className="text-black">{b.vendor.name} · {b.service}</option>)}</select></label><label>Team assignment<select name="assignmentId" className={input}><option value="" className="text-black">Not linked</option>{assignments.map((a)=><option key={a.id} value={a.id} className="text-black">{a.teamMember.name} · {a.role}</option>)}</select></label><label>Note<input name="note" maxLength={500} className={input}/></label><button className="rounded-lg border border-ailu-yellow/60 px-3 py-2 text-sm font-semibold text-ailu-yellow sm:col-span-2">Save payment</button></form>
          <form action={createExpenseAction} className="grid gap-2 sm:grid-cols-2"><input type="hidden" name="eventId" value={event.id}/><h3 className="font-semibold sm:col-span-2">Record event expense</h3><label>Category<input required name="category" maxLength={80} placeholder="Transport, meals, supplies…" className={input}/></label><label>Amount (₹)<input required name="amount" inputMode="decimal" className={input}/></label><label>Date<input required type="date" name="spentOn" defaultValue={new Date().toISOString().slice(0,10)} className={input}/></label><label>Vendor booking (optional)<select name="vendorBookingId" className={input}><option value="" className="text-black">Other expense</option>{finance.bookings.map((b)=><option key={b.id} value={b.id} className="text-black">{b.vendor.name} · {b.service}</option>)}</select></label><label className="sm:col-span-2">Note<input name="note" maxLength={500} className={input}/></label><button className="rounded-lg border border-ailu-yellow/60 px-3 py-2 text-sm font-semibold text-ailu-yellow sm:col-span-2">Save expense</button></form>
        </div> : null}
        <div className="mt-5 grid gap-4 lg:grid-cols-2"><div><h3 className="font-semibold">Payment history</h3><ul className="mt-2 space-y-2 text-sm">{finance.payments.length ? finance.payments.map((payment)=><li key={payment.id} className="rounded-lg border border-white/10 p-3"><div className="flex justify-between gap-3"><span>{payment.direction === "IN" ? "Received" : "Paid"} · {payment.purpose}</span><strong>{formatINR(payment.amountPaise)}</strong></div><div className="mt-1 text-xs text-ailu-cream/50">{formatIN(payment.paidOn)} · {payment.mode}{payment.vendorBooking?.vendor ? ` · ${payment.vendorBooking.vendor.name}` : ""}{payment.assignment?.teamMember ? ` · ${payment.assignment.teamMember.name}` : ""}{payment.reference ? ` · ref ${payment.reference}` : ""}</div>{can(staff.role, "finance.write") ? <div className="mt-2 flex flex-wrap items-start gap-3"><form action={deletePaymentAction}><input type="hidden" name="id" value={payment.id}/><input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="back" value={`/admin/events/${event.id}#finance`}/><ConfirmButton label="Delete" message="Delete this payment? This cannot be undone and changes the event finance."/></form><div className="min-w-0 flex-1"><EditBox><form action={updatePaymentAction} className="grid gap-2 sm:grid-cols-2"><input type="hidden" name="id" value={payment.id}/><input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="back" value={`/admin/events/${event.id}#finance`}/><label>Direction<select name="direction" defaultValue={payment.direction} className={input}><option value="IN" className="text-black">Client payment received</option><option value="OUT" className="text-black">Outgoing payment</option></select></label><label>Purpose<input name="purpose" maxLength={80} defaultValue={payment.purpose} className={input}/></label><label>Amount (₹)<input required name="amount" inputMode="decimal" defaultValue={rupees(payment.amountPaise)} className={input}/></label><label>Payment mode<select name="mode" defaultValue={payment.mode} className={input}>{["CASH","UPI","BANK_TRANSFER","CARD","CHEQUE","OTHER"].map((m)=><option key={m} className="text-black">{m}</option>)}</select></label><label>Date<input required type="date" name="paidOn" defaultValue={payment.paidOn.toISOString().slice(0,10)} className={input}/></label><label>Reference<input name="reference" maxLength={120} defaultValue={payment.reference ?? ""} className={input}/></label><label>Vendor booking<select name="vendorBookingId" defaultValue={payment.vendorBookingId ?? ""} className={input}><option value="" className="text-black">Not linked</option>{finance.bookings.map((b)=><option key={b.id} value={b.id} className="text-black">{b.vendor.name} · {b.service}</option>)}</select></label><label>Team assignment<select name="assignmentId" defaultValue={payment.assignmentId ?? ""} className={input}><option value="" className="text-black">Not linked</option>{assignments.map((a)=><option key={a.id} value={a.id} className="text-black">{a.teamMember.name} · {a.role}</option>)}</select></label><label className="sm:col-span-2">Note<input name="note" maxLength={500} defaultValue={payment.note ?? ""} className={input}/></label><button className="rounded-lg border border-ailu-yellow/60 px-3 py-1 text-xs font-semibold text-ailu-yellow sm:col-span-2">Save payment</button></form></EditBox></div></div> : null}</li>) : <li className="text-ailu-cream/50">No payments recorded.</li>}</ul></div><div><h3 className="font-semibold">Expense history</h3><ul className="mt-2 space-y-2 text-sm">{finance.expenses.length ? finance.expenses.map((expense)=><li key={expense.id} className="rounded-lg border border-white/10 p-3"><div className="flex justify-between gap-3"><span>{expense.category}{expense.vendorBooking?.vendor ? ` · ${expense.vendorBooking.vendor.name}` : ""}</span><strong>{formatINR(expense.amountPaise)}</strong></div><div className="mt-1 text-xs text-ailu-cream/50">{formatIN(expense.spentOn)}{expense.note ? ` · ${expense.note}` : ""}</div>{can(staff.role, "finance.write") ? <div className="mt-2 flex flex-wrap items-start gap-3"><form action={deleteExpenseAction}><input type="hidden" name="id" value={expense.id}/><input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="back" value={`/admin/events/${event.id}#finance`}/><ConfirmButton label="Delete" message="Delete this expense? This cannot be undone and changes the event finance."/></form><div className="min-w-0 flex-1"><EditBox><form action={updateExpenseAction} className="grid gap-2 sm:grid-cols-2"><input type="hidden" name="id" value={expense.id}/><input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="back" value={`/admin/events/${event.id}#finance`}/><label>Category<input required name="category" minLength={2} maxLength={80} defaultValue={expense.category} className={input}/></label><label>Amount (₹)<input required name="amount" inputMode="decimal" defaultValue={rupees(expense.amountPaise)} className={input}/></label><label>Date<input required type="date" name="spentOn" defaultValue={expense.spentOn.toISOString().slice(0,10)} className={input}/></label><label>Vendor booking<select name="vendorBookingId" defaultValue={expense.vendorBookingId ?? ""} className={input}><option value="" className="text-black">Other expense</option>{finance.bookings.map((b)=><option key={b.id} value={b.id} className="text-black">{b.vendor.name} · {b.service}</option>)}</select></label><label className="sm:col-span-2">Note<input name="note" maxLength={500} defaultValue={expense.note ?? ""} className={input}/></label><button className="rounded-lg border border-ailu-yellow/60 px-3 py-1 text-xs font-semibold text-ailu-yellow sm:col-span-2">Save expense</button></form></EditBox></div></div> : null}</li>) : <li className="text-ailu-cream/50">No expenses recorded.</li>}</ul></div></div>
      </section> : null}
    </div>
  );
}
