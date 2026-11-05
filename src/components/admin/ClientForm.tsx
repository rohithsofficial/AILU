// Create / edit form for a client. Reads values from an existing client when editing.
const input = "mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream placeholder:text-ailu-cream/40";

export default function ClientForm({
  action,
  client,
  ownerId,
  owners = [],
  allowOwnerChange = false,
}: {
  action: (fd: FormData) => Promise<void>;
  client?: {
    type: string; name: string; companyName?: string | null; phone: string; altPhone?: string | null;
    email?: string | null; city?: string | null; address?: string | null; gstin?: string | null;
    source: string; referredBySpId?: string | null; notes?: string | null; consentToContact: boolean;
    tags?: string[];
    id?: string; ownerId?: string | null;
  } | null;
  ownerId?: string | null;
  owners?: { id: string; name: string; email: string }[];
  allowOwnerChange?: boolean;
}) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {client?.id ? <input type="hidden" name="id" value={client.id} /> : null}
      {!allowOwnerChange ? <input type="hidden" name="ownerId" value={ownerId ?? client?.ownerId ?? ""} /> : null}
      <label className="block">Type
        <select name="type" defaultValue={client?.type ?? "INDIVIDUAL"} className={input}>
          {["INDIVIDUAL", "COMPANY", "COMMUNITY"].map((t) => <option key={t} value={t} className="text-black">{t === "INDIVIDUAL" ? "Individual" : t === "COMPANY" ? "Company" : "Community"}</option>)}
        </select>
      </label>
      <label className="block">Name<input name="name" required defaultValue={client?.name ?? ""} className={input} /></label>
      <label className="block">Company / institution (if any)<input name="companyName" defaultValue={client?.companyName ?? ""} className={input} /></label>
      <label className="block">Mobile number<input name="phone" required inputMode="tel" defaultValue={client?.phone ?? ""} className={input} /></label>
      <label className="block">Alternate number<input name="altPhone" inputMode="tel" defaultValue={client?.altPhone ?? ""} className={input} /></label>
      <label className="block">Email<input name="email" type="email" defaultValue={client?.email ?? ""} className={input} /></label>
      <label className="block">City<input name="city" defaultValue={client?.city ?? ""} className={input} /></label>
      <label className="block">Source
        <select name="source" defaultValue={client?.source ?? "OTHER"} className={input}>
          {["WEBSITE", "PARTNER", "REFERRAL", "WALK_IN", "SOCIAL", "OTHER"].map((s) => <option key={s} value={s} className="text-black">{s.replace(/_/g, " ")}</option>)}
        </select>
      </label>
      <label className="block">Partner ID (if introduced by a partner)<input name="referredBySpId" defaultValue={client?.referredBySpId ?? ""} placeholder="AILU-SP-000001" className={input} /></label>
      <label className="block">Tags (comma separated)<input name="tags" defaultValue={client?.tags?.join(", ") ?? ""} placeholder="wedding, repeat client" className={input} /></label>
      {allowOwnerChange ? <label>Owner<select name="ownerId" defaultValue={ownerId ?? client?.ownerId ?? ""} className={input}><option value="" className="text-black">Unassigned</option>{owners.map((person) => <option key={person.id} value={person.id} className="text-black">{person.name || person.email}</option>)}</select></label> : null}
      <label className="block">Address<input name="address" defaultValue={client?.address ?? ""} className={input} /></label>
      <label className="block">GSTIN (company clients only)<input name="gstin" defaultValue={client?.gstin ?? ""} className={input} /></label>
      <label className="block sm:col-span-2">Private notes (staff only)<textarea name="notes" rows={3} defaultValue={client?.notes ?? ""} className={input} /></label>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="consentToContact" defaultChecked={client?.consentToContact ?? false} className="h-4 w-4" />
        Client has consented to be contacted
      </label>
      <div className="sm:col-span-2">
        <button className="rounded-full bg-ailu-yellow px-6 py-2.5 text-sm font-semibold text-ailu-black hover:brightness-105">{client ? "Save changes" : "Create client"}</button>
      </div>
    </form>
  );
}
