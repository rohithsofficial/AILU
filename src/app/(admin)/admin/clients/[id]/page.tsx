import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRolePage, STAFF_ROLES, canWriteCRM, canEditClient } from "@/lib/authz";
import { getClient, enquiriesForClient, activityForClient, tasksForClient } from "@/server/clients";
import { formatIN } from "@/lib/format";
import { updateClientAction, archiveClientAction, addClientContactAction, logClientActivityAction, addClientTaskAction, updateClientContactAction, removeClientContactAction } from "../actions";
import ClientForm from "@/components/admin/ClientForm";
import { listActiveStaff } from "@/server/inbox";

export const dynamic = "force-dynamic";

const box = "border border-white/10 bg-[#111114] p-6 rounded-2xl";

export default async function ClientDetail({ searchParams, params }: { searchParams: { msg?: string }; params: { id: string } }) {
  const staff = await requireRolePage(STAFF_ROLES);
  const client = await getClient(params.id);
  if (!client) notFound();
  if (staff.role === "STAFF" && client.ownerId !== staff.id) notFound();
  const [enquiries, activity, tasks] = await Promise.all([
    enquiriesForClient(client.id), activityForClient(client.id), tasksForClient(client.id),
  ]);
  const canEdit = canWriteCRM(staff) && canEditClient(staff, client);
  const owners = staff.role === "STAFF" ? [] : await listActiveStaff();

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/clients" className="text-sm text-ailu-cream/60 hover:underline">← Clients</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-xl font-bold text-ailu-yellow">{client.id}</h1>
        <span className="text-sm text-ailu-cream/60">{formatIN(client.createdAt)}</span>
        {client.archivedAt ? <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-ailu-cream/60">archived</span> : null}
      </div>
      {searchParams?.msg ? <p className="mt-3 rounded-lg bg-ailu-yellow/10 px-4 py-2 text-sm text-ailu-yellow">{searchParams.msg}</p> : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className={box}>
          <h2 className="font-display font-bold">Details</h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            {[
              ["Name", client.name], ["Type", client.type === "INDIVIDUAL" ? "Individual" : client.type === "COMPANY" ? "Company" : "Community"],
              ["Company", client.companyName || "—"], ["Phone", client.phone], ["Alt phone", client.altPhone || "—"],
              ["Email", client.email || "—"], ["City", client.city || "—"], ["Address", client.address || "—"],
              ["GSTIN", client.gstin || "—"], ["Source", client.source], ["Partner", client.referredBySpId || "—"],
              ["Tags", client.tags.length ? client.tags.join(", ") : "—"], ["Owner", client.ownerId || "Unassigned"],
              ["Consent to contact", client.consentToContact ? "Yes" : "No"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2"><dt className="w-24 shrink-0 text-ailu-cream/50">{k}</dt><dd>{v}</dd></div>
            ))}
            <div className="flex gap-2"><dt className="w-24 shrink-0 text-ailu-cream/50">Notes</dt><dd className="whitespace-pre-wrap">{client.notes || "—"}</dd></div>
          </dl>
        </div>

        {canEdit ? <div className="space-y-4">
          <div className={box}>
            <h2 className="font-display font-bold">Edit</h2>
            <div className="mt-3"><ClientForm action={updateClientAction} client={client} ownerId={client.ownerId} owners={owners} allowOwnerChange={staff.role !== "STAFF"} /></div>
          </div>
          {staff.role === "OWNER" ? <form action={archiveClientAction} className={box}>
            <h2 className="font-display font-bold">Archive</h2>
            <input type="hidden" name="id" value={client.id} />
            <input type="hidden" name="archived" value={client.archivedAt ? "no" : "yes"} />
            <p className="mt-2 text-sm text-ailu-cream/60">{client.archivedAt ? "Restores the client to the active list." : "Hides the client from normal lists without deleting anything."}</p>
            <button className="mt-2 rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10">{client.archivedAt ? "Restore client" : "Archive client"}</button>
          </form> : null}
        </div> : null}
      </div>

      <div className="mt-6 grid gap-4">
        <div className={box}>
          <h2 className="font-display font-bold">Events ({client.events.length})</h2>
          {client.events.length === 0 ? (
            <p className="mt-3 text-sm text-ailu-cream/50">No events yet. Convert an enquiry or create an event from the Events page.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {client.events.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2">
                  <Link href={`/admin/events/${e.id}`} className="font-mono text-xs text-ailu-yellow hover:underline">{e.id} — {e.title}</Link>
                  <span className="text-xs text-ailu-cream/70">{e.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={box}>
          <h2 className="font-display font-bold">Enquiries ({enquiries.length})</h2>
          {enquiries.length === 0 ? (
            <p className="mt-3 text-sm text-ailu-cream/50">No website enquiries linked to this client.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {enquiries.map((eq) => (
                <li key={eq.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2">
                  <Link href={`/admin/inbox/${eq.id}`} className="font-mono text-xs text-ailu-yellow hover:underline">{eq.id}</Link>
                  <span className="text-xs text-ailu-cream/70">{eq.category} · {eq.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <div className={box}>
          <h2 className="font-display font-bold">Contacts</h2>
          {client.contacts.length === 0 ? (
            <p className="mt-3 text-sm text-ailu-cream/50">No extra contacts yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {client.contacts.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2">
                  {canEdit ? <form action={updateClientContactAction} className="grid flex-1 gap-2 sm:grid-cols-4"><input type="hidden" name="clientId" value={client.id} /><input type="hidden" name="id" value={c.id} /><label className="text-xs">Name<input name="name" required minLength={2} maxLength={100} defaultValue={c.name} className="mt-1 w-full rounded border border-white/20 bg-white/10 px-2 py-1 text-ailu-cream" /></label><label className="text-xs">Role<input name="role" maxLength={100} defaultValue={c.role ?? ""} className="mt-1 w-full rounded border border-white/20 bg-white/10 px-2 py-1 text-ailu-cream" /></label><label className="text-xs">Phone<input name="phone" inputMode="tel" defaultValue={c.phone ?? ""} className="mt-1 w-full rounded border border-white/20 bg-white/10 px-2 py-1 text-ailu-cream" /></label><label className="text-xs">Email<input name="email" type="email" defaultValue={c.email ?? ""} className="mt-1 w-full rounded border border-white/20 bg-white/10 px-2 py-1 text-ailu-cream" /></label><button className="text-xs text-ailu-yellow underline sm:col-span-4 sm:justify-self-start">Save contact</button></form> : <div><div className="font-medium">{c.name}</div><div className="text-xs text-ailu-cream/50">{c.role || "—"} · {c.phone || "—"} · {c.email || "—"}</div></div>}
                  {canEdit ? <form action={removeClientContactAction}><input type="hidden" name="clientId" value={client.id} /><input type="hidden" name="id" value={c.id} /><button className="text-xs text-red-400 underline">Remove</button></form> : null}
                </li>
              ))}
            </ul>
          )}
          {canEdit ? <form action={addClientContactAction} className="mt-3 flex flex-wrap items-end gap-2 text-sm">
            <input type="hidden" name="clientId" value={client.id} />
            <label className="flex-1">Name<input name="name" required className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream" /></label>
            <label>Role<input name="role" className="mt-1 w-40 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream" /></label>
            <label>Phone<input name="phone" inputMode="tel" className="mt-1 w-40 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream" /></label>
            <label>Email<input name="email" type="email" className="mt-1 w-40 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream" /></label>
            <button className="rounded-lg border border-ailu-yellow/60 px-4 py-2 font-semibold text-ailu-yellow">Add contact</button>
          </form> : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className={box}>
          <h2 className="font-display font-bold">Tasks ({tasks.length})</h2>
          {tasks.length === 0 ? <p className="mt-3 text-sm text-ailu-cream/50">No follow-up tasks for this client.</p> : <ul className="mt-3 space-y-2 text-sm">{tasks.map((task) => <li key={task.id} className="rounded-lg border border-white/10 px-3 py-2">{task.title}{task.dueAt ? <span className="ml-2 text-xs text-ailu-cream/50">due {formatIN(task.dueAt)}</span> : null}{task.doneAt ? <span className="ml-2 text-xs text-emerald-400">done</span> : null}</li>)}</ul>}
          {canEdit ? <form action={addClientTaskAction} className="mt-4 grid gap-2 sm:grid-cols-2"><input type="hidden" name="clientId" value={client.id} /><label className="sm:col-span-2">New task<input name="title" required minLength={2} maxLength={200} className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream" /></label><label>Due date<input name="dueAt" type="date" className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream" /></label><label>Priority<select name="priority" className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream"><option value="NORMAL" className="text-black">Normal</option><option value="HIGH" className="text-black">High</option><option value="LOW" className="text-black">Low</option></select></label><button className="rounded-lg border border-ailu-yellow/60 px-4 py-2 text-sm font-semibold text-ailu-yellow">Add task</button></form> : null}
          <Link href="/admin/tasks?view=all" className="mt-3 inline-block text-xs text-ailu-yellow underline">View all tasks</Link>
        </section>
        <section className={box}>
          <h2 className="font-display font-bold">Activity timeline ({activity.length})</h2>
          {activity.length === 0 ? <p className="mt-3 text-sm text-ailu-cream/50">No notes or contact history yet.</p> : <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto text-sm">{activity.map((item) => <li key={item.id} className="rounded-lg border border-white/10 px-3 py-2"><div className="flex justify-between gap-2"><span className="text-xs font-semibold text-ailu-yellow">{item.kind}</span><time className="text-xs text-ailu-cream/50">{formatIN(item.at)}</time></div><p className="mt-1 whitespace-pre-wrap">{item.body}</p></li>)}</ul>}
          {canEdit ? <form action={logClientActivityAction} className="mt-4 space-y-2"><input type="hidden" name="clientId" value={client.id} /><label className="block text-sm">Type<select name="kind" className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream"><option value="NOTE" className="text-black">Note</option><option value="CALL" className="text-black">Call</option><option value="WHATSAPP" className="text-black">WhatsApp</option><option value="MEETING" className="text-black">Meeting</option></select></label><label className="block text-sm">Details<textarea name="body" required minLength={2} maxLength={2000} rows={3} className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream" /></label><button className="rounded-lg border border-ailu-yellow/60 px-4 py-2 text-sm font-semibold text-ailu-yellow">Add to timeline</button></form> : null}
        </section>
      </div>
    </div>
  );
}
