import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRolePage, STAFF_ROLES, canWriteCRM } from "@/lib/authz";
import { getClient, enquiriesForClient } from "@/server/clients";
import { formatIN } from "@/lib/format";
import { updateClientAction, archiveClientAction, addClientContactAction } from "../actions";
import ClientForm from "@/components/admin/ClientForm";

export const dynamic = "force-dynamic";

const box = "border border-white/10 bg-[#111114] p-6 rounded-2xl";

export default async function ClientDetail({ searchParams, params }: { searchParams: { msg?: string }; params: { id: string } }) {
  const staff = await requireRolePage(STAFF_ROLES);
  const client = await getClient(params.id);
  if (!client) notFound();
  const enquiries = await enquiriesForClient(client.id);

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
              ["Consent to contact", client.consentToContact ? "Yes" : "No"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2"><dt className="w-24 shrink-0 text-ailu-cream/50">{k}</dt><dd>{v}</dd></div>
            ))}
            <div className="flex gap-2"><dt className="w-24 shrink-0 text-ailu-cream/50">Notes</dt><dd className="whitespace-pre-wrap">{client.notes || "—"}</dd></div>
          </dl>
        </div>

        <div className={`space-y-4 ${staff.role === "ACCOUNTS" ? "pointer-events-none opacity-50" : ""}`}>
          <div className={box}>
            <h2 className="font-display font-bold">Edit</h2>
            <form action={updateClientAction} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={client.id} />
              <ClientForm action={updateClientAction} client={client} />
            </form>
          </div>
          <form action={archiveClientAction} className={box}>
            <h2 className="font-display font-bold">Archive</h2>
            <input type="hidden" name="id" value={client.id} />
            <input type="hidden" name="archived" value={client.archivedAt ? "no" : "yes"} />
            <p className="mt-2 text-sm text-ailu-cream/60">{client.archivedAt ? "Restores the client to the active list." : "Hides the client from normal lists without deleting anything."}</p>
            <button className="mt-2 rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10">{client.archivedAt ? "Restore client" : "Archive client"}</button>
          </form>
        </div>
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
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-ailu-cream/50">{c.role || "—"} · {c.phone || "—"} · {c.email || "—"}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <form action={addClientContactAction} className="mt-3 flex flex-wrap items-end gap-2 text-sm">
            <input type="hidden" name="clientId" value={client.id} />
            <label className="flex-1">Name<input name="name" required className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream" /></label>
            <label>Role<input name="role" className="mt-1 w-40 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream" /></label>
            <label>Phone<input name="phone" inputMode="tel" className="mt-1 w-40 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream" /></label>
            <label>Email<input name="email" type="email" className="mt-1 w-40 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream" /></label>
            <button className="rounded-lg border border-ailu-yellow/60 px-4 py-2 font-semibold text-ailu-yellow">Add contact</button>
          </form>
        </div>
      </div>
    </div>
  );
}