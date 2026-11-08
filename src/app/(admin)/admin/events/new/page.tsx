// CRM: form to create an event by hand, for an existing client or a new one.
import Link from "next/link";
import { requireRolePage, STAFF_ROLES } from "@/lib/authz";
import { EVENT_CATEGORIES } from "@/lib/events";
import { createEventAction } from "../actions";

export const dynamic = "force-dynamic";

const input = "mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream placeholder:text-ailu-cream/40";

export default async function NewEventPage() {
  await requireRolePage(STAFF_ROLES);
  const staff = await requireRolePage(["OWNER", "MANAGER", "STAFF"]);
  const staffList = await (await import("@/server/inbox")).listActiveStaff();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/events" className="text-sm text-ailu-cream/60 hover:underline">← Events</Link>
      <h1 className="mt-2 font-display text-2xl font-bold">New event</h1>
      <p className="mt-1 text-sm text-ailu-cream/60">Pick an existing client, or enter a new client's name and phone (a client record will be created).</p>

      <form action={createEventAction} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">Client
            <select name="clientId" className={input}>
              <option value="" className="text-black">Create new client (enter name & phone below)</option>
              {(await (await import("@/server/clients")).listClients({ page: 1, ownerId: staff.role === "STAFF" ? staff.id : undefined })).rows.map((c) => (
                <option key={c.id} value={c.id} className="text-black">{c.name} — {c.phone}</option>
              ))}
            </select>
          </label>
          <label className="block">Owner
            <select name="ownerId" defaultValue={staff.id} className={input}>
              <option value="" className="text-black">Unassigned</option>
              {staffList.map((s) => <option key={s.id} value={s.id} className="text-black">{s.name || s.email}</option>)}
            </select>
          </label>
        </div>

        <details className="rounded-2xl border border-white/10 bg-[#111114] p-4">
          <summary className="cursor-pointer font-semibold text-ailu-yellow">Or enter a new client inline</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">Name<input name="clientName" className={input} /></label>
            <label className="block">Phone<input name="clientPhone" inputMode="tel" className={input} /></label>
          </div>
        </details>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">Event title<input name="title" required className={input} placeholder="Rohit & Priya wedding, 150 guests" /></label>
          <label className="block">Category
            <select name="category" defaultValue={EVENT_CATEGORIES[0].slug} className={input}>
              {EVENT_CATEGORIES.map((c) => <option key={c.slug} value={c.slug} className="text-black">{c.title}</option>)}
            </select>
          </label>
        </div>

        <label className="block">Tradition / notes (free text, e.g. "North Indian", "South Indian — Kannada customs")<input name="tradition" className={input} /></label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">Start date<input name="startDate" type="date" className={input} /></label>
          <label className="block">End date<input name="endDate" type="date" className={input} /></label>
          <input type="hidden" name="status" value="LEAD" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">Venue name<input name="venueName" className={input} /></label>
          <label className="block">Venue city<input name="venueCity" className={input} /></label>
        </div>
        <label className="block">Venue address<textarea name="venueAddress" rows={2} className={input} /></label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">Expected guests<input name="guestCount" type="number" min={1} max={100000} className={input} /></label>
          <label className="block">Budget (INR)<input name="budget" className={input} placeholder="e.g. 1,50,000" /></label>
          <label className="block">Lost / cancelled reason (only if status is Lost or Cancelled)<input name="lostReason" className={input} /></label>
        </div>

        <label className="block">Requirements & brief<textarea name="requirements" rows={4} className={input} /></label>
        <label className="block">Internal notes (staff only)<textarea name="internalNotes" rows={3} className={input} /></label>

        <button className="rounded-full bg-ailu-yellow px-6 py-2.5 text-sm font-semibold text-ailu-black hover:brightness-105">Create event</button>
      </form>
    </div>
  );
}
