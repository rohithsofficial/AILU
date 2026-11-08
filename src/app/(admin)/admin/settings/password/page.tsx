// CRM: change my own password. Changing it signs you out everywhere.
import { currentStaff } from "@/lib/authz";
import { PASSWORD_MIN_LENGTH } from "@/lib/password";
import { redirect } from "next/navigation";
import { changeOwnPasswordAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function PasswordPage({ searchParams }: { searchParams: { msg?: string } }) {
  if (!(await currentStaff())) redirect("/admin/login");
  const input = "mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream";
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-2xl font-bold">My password</h1>
      <p className="mt-1 text-sm text-ailu-cream/60">After changing it you will sign in again on every device.</p>
      {searchParams?.msg ? <p className="mt-4 rounded-lg bg-ailu-yellow/10 px-4 py-2 text-sm text-ailu-yellow">{searchParams.msg}</p> : null}
      <form action={changeOwnPasswordAction} className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-[#111114] p-6">
        <label className="block text-sm">Current password<input name="current" type="password" autoComplete="current-password" required className={input} /></label>
        <label className="block text-sm">New password<input name="next" type="password" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} required className={input} /></label>
        <label className="block text-sm">New password again<input name="confirm" type="password" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} required className={input} /></label>
        <button className="rounded-full bg-ailu-yellow px-6 py-2.5 font-semibold text-ailu-black">Change password</button>
      </form>
    </div>
  );
}
