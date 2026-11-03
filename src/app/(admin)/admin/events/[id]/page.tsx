"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRolePage, STAFF_ROLES, canWriteCRM, canEditEvent } from "@/lib/authz";
import { getEvent, activityForEvent, tasksForEvent } from "@/server/events";
import { listQuotations, CATEGORY_OPTIONS } from "@/server/quotations";
import { listActiveStaff } from "@/server/inbox";
import { EVENT_STATUSES, EVENT_STATUS_LABELS } from "@/lib/eventStatus";
import { formatIN } from "@/lib/format";
import { formatINR } from "@/lib/money";
import { updateEventAction, setEventStatusAction, archiveEventAction, createQuotationAction, setQuotationStatusAction, addTaskAction, toggleTaskAction } from "../actions";

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

      <div className="mt-4 border-b border-white/10" role="tablist">
        <nav className="flex gap-1" aria-label="Event tabs">
          {TABS.map((t) => (
            <Link key={t.id} href={`/admin/events/${event.id}?tab=${t.id}`} className="rounded-t-lg px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:bg-white/05 text-ailu-cream/70" aria-selected={false} role="tab">{t.label}</Link>
          ))}
        </nav>
      </div>

      {/* Overview */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
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

      {/* Quotations */}
      <div className={`mt-6 ${staff.role === "ACCOUNTS" ? "pointer-events-none opacity-50" : ""}`}>
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
                    <form action={setQuotationStatusAction}>
                      <input type="hidden" name="eventId" value={event.id} />
                      <input type="hidden" name="quotationId" value={q.id} />
                      <select name="status" defaultValue={q.status} className="text-xs rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-ailu-cream">
                        {["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"].map((s) => <option key={s} value={s} className="text-black">{s}</option>)}
                      </select>
                      <button className="text-xs text-ailu-yellow underline">Save</button>
                    </form>
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
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* New quotation form */}
        <details className="mt-4 rounded-2xl border border-white/10 bg-[#111114] p-6">
          <summary className="cursor-pointer font-semibold text-ailu-yellow">Create a new quotation version</summary>
          <form action={createQuotationAction} className="mt-4 space-y-4" id="new-quote-form">
            <input type="hidden" name="eventId" value={event.id} />
            <div className="grid gap-3 sm:grid-cols-4">
              <label className="block">Discount (INR)<input name="discount" type="number" min={0} step={100} className={input} placeholder="0" /></label>
              <label className="block">Tax (INR)<input name="tax" type="number" min={0} step={100} className={input} placeholder="0" /></label>
              <label className="block">Valid until<input name="validUntil" type="date" className={input} /></label>
            </div>
            <label className="block">Terms<textarea name="terms" rows={2} className={input} /></label>

            <div className="rounded-lg border border-white/10 p-3">
              <h3 className="font-semibold mb-2">Line items</h3>
              <div id="quote-items">
                <QuoteItemRow key={0} index={0} />
              </div>
              <button type="button" onClick={() => addQuoteItem()} className="mt-2 text-sm text-ailu-yellow underline">+ Add line item</button>
            </div>

            <button className="rounded-full bg-ailu-yellow px-5 py-2 text-sm font-semibold text-ailu-black">Create quotation</button>
          </form>
        </details>
      </div>

      {/* Tasks */}
      <div className={`mt-6 ${staff.role === "ACCOUNTS" ? "pointer-events-none opacity-50" : ""}`}>
        <div className={box}>
          <h2 className="font-display font-bold">Follow-up tasks ({tasks.length})</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {tasks.length === 0 ? <li className="text-ailu-cream/50">No tasks yet.</li> : null}
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2">
                <span className={t.doneAt ? "line-through text-ailu-cream/50" : ""}>{t.title}{t.dueAt ? <span className="ml-2 text-xs text-ailu-cream/50">due {formatIN(t.dueAt)}</span> : null}</span>
                <form action={toggleTaskAction}>
                  <input type="hidden" name="eventId" value={event.id} />
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="done" value={t.doneAt ? "no" : "yes"} />
                  <button className="text-xs text-ailu-yellow underline">{t.doneAt ? "Reopen" : "Mark done"}</button>
                </form>
              </li>
            ))}
          </ul>
          <form action={addTaskAction} className="mt-3 flex flex-wrap items-end gap-2 text-sm">
            <input type="hidden" name="eventId" value={event.id} />
            <label className="flex-1">New task<input name="title" required placeholder="Call client to discuss dates" className={input} /></label>
            <label>Due<input name="dueAt" type="date" className={`${input} w-40`} /></label>
            <label>Assignee<select name="assigneeId" className={`${input} w-48`}><option value="" className="text-black">Unassigned</option>{staffList.map((s) => <option key={s.id} value={s.id} className="text-black">{s.name || s.email}</option>)}</select></label>
            <label>Priority<select name="priority" className={`${input} w-32`}><option value="HIGH" className="text-black">HIGH</option><option value="NORMAL" className="text-black">NORMAL</option><option value="LOW" className="text-black">LOW</option></select></label>
            <button className="rounded-lg border border-ailu-yellow/60 px-4 py-2 font-semibold text-ailu-yellow">Add</button>
          </form>
        </div>
      </div>

      {/* Activity */}
      <div className="mt-6">
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

function QuoteItemRow({ index }: { index: number }) {
  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  return (
    <div className="flex gap-2" data-index={index}>
      <input type="text" name="itemDescription" defaultValue={desc} placeholder="Description" className={`${input} flex-1`} onChange={(e) => setDesc(e.target.value)} />
      <input type="number" name="itemQuantity" min={1} defaultValue={qty} className={`${input} w-24`} onChange={(e) => setQty(e.target.value)} />
      <input type="number" name="itemUnitPrice" min={0} step={100} defaultValue={price} placeholder="Unit price (INR)" className={`${input} w-40`} onChange={(e) => setPrice(e.target.value)} />
      <button type="button" className="text-ailu-yellow underline" onClick={() => document.querySelector(`[data-index="${index}"]`)?.remove()}>Remove</button>
    </div>
  );
}

function addQuoteItem() {
  const container = document.getElementById("quote-items");
  const idx = container?.children.length ?? 0;
  const div = document.createElement("div");
  div.dataset.index = String(idx);
  div.innerHTML = `
    <input type="text" name="itemDescription" placeholder="Description" class="${input} flex-1" />
    <input type="number" name="itemQuantity" min="1" defaultValue="1" class="${input} w-24" />
    <input type="number" name="itemUnitPrice" min="0" step="100" placeholder="Unit price (INR)" class="${input} w-40" />
    <button type="button" class="text-ailu-yellow underline" onclick="this.closest('[data-index]').remove()">Remove</button>
  `;
  container?.appendChild(div);
}