import { requireRolePage } from "@/lib/authz";
import { getPrisma } from "@/lib/db";
import { addStaffAction, changeRoleAction, setActiveAction, setStaffPasswordAction, updateStaffNameAction } from "./actions";

export const dynamic = "force-dynamic";

const ROLES = ["OWNER", "MANAGER", "STAFF", "ACCOUNTS"] as const;

export default async function StaffPage({ searchParams }: { searchParams: { msg?: string } }) {
  await requireRolePage(["OWNER"]);
  const db = getPrisma();
  const list = await db.staffUser.findMany({ orderBy: [{ active: "desc" }, { role: "asc" }, { email: "asc" }] });

  const input = "mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream placeholder:text-ailu-cream/40";

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-bold">Staff users</h1>
      <p className="mt-1 text-sm text-ailu-cream/60">Only people listed here with an active status can sign in to /admin. Deactivation takes effect on the next click anywhere in the admin.</p>

      {searchParams?.msg ? <p className="mt-4 rounded-lg bg-ailu-yellow/10 px-4 py-2 text-sm text-ailu-yellow">{searchParams.msg}</p> : null}

      <form action={addStaffAction} className="mt-6 rounded-2xl border border-white/10 bg-[#111114] p-6">
        <h2 className="font-display text-lg font-bold">Add a team member</h2>
        <p className="mt-1 text-sm text-ailu-cream/60">They sign in with this email and the password you set. Share it privately and ask them to change it under My password.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <label className="block sm:col-span-2">Email<input name="email" type="email" required className={input} placeholder="name@ailu…" /></label>
          <label className="block sm:col-span-2">First password<input name="password" type="text" autoComplete="off" minLength={10} required className={input} placeholder="At least 10 characters" /></label>
          <label className="block">Name<input name="name" required className={input} /></label>
          <label className="block">Role
            <select name="role" defaultValue="STAFF" className={input}>
              {ROLES.map((r) => <option key={r} value={r} className="text-black">{r}</option>)}
            </select>
          </label>
        </div>
        <button className="mt-4 rounded-full bg-ailu-yellow px-5 py-2 text-sm font-semibold text-ailu-black hover:brightness-105">Add staff member</button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.06] text-left text-xs uppercase tracking-wider text-ailu-cream/50">
            <tr><th className="px-4 py-3">Email</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="border-t border-white/10">
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3">
                  <form action={updateStaffNameAction} className="flex gap-2">
                    <input type="hidden" name="id" value={s.id} />
                    <input name="name" defaultValue={s.name} aria-label={`Name of ${s.email}`} required className="w-32 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-ailu-cream" />
                    <button className="rounded-lg border border-ailu-yellow/60 px-2 py-1 text-xs font-semibold text-ailu-yellow">Save</button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={changeRoleAction} className="flex gap-2">
                    <input type="hidden" name="id" value={s.id} />
                    <select name="role" defaultValue={s.role} className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-ailu-cream">
                      {ROLES.map((r) => <option key={r} value={r} className="text-black">{r}</option>)}
                    </select>
                    <button className="rounded-lg border border-ailu-yellow/60 px-2 py-1 text-xs font-semibold text-ailu-yellow">Save</button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.active ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                    {s.active ? "Active" : "Off"}
                  </span>
                </td>
                <td className="space-y-2 px-4 py-3">
                  <form action={setStaffPasswordAction} className="flex gap-2">
                    <input type="hidden" name="id" value={s.id} />
                    <input name="password" type="text" autoComplete="off" minLength={10} required aria-label={`New password for ${s.email}`} placeholder={s.passwordHash ? "New password" : "No password yet"} className="w-36 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-ailu-cream placeholder:text-ailu-cream/40" />
                    <button className="rounded-lg border border-ailu-yellow/60 px-2 py-1 text-xs font-semibold text-ailu-yellow">Set</button>
                  </form>
                  <form action={setActiveAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="active" value={s.active ? "no" : "yes"} />
                    <button className="rounded-lg border border-white/20 px-2 py-1 text-xs hover:bg-white/10">
                      {s.active ? "Deactivate" : "Reactivate"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
