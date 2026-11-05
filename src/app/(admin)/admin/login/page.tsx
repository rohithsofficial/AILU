import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, googleEnabled, signIn } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AdminLogin({ searchParams }: { searchParams: { error?: string; changed?: string } }) {
  const session = await auth();
  if (session?.user) redirect("/admin");

  async function passwordSignIn(formData: FormData) {
    "use server";
    let target = "/admin";
    try {
      await signIn("password", { redirect: false, email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? "") });
    } catch (e) {
      const digest = (e as { digest?: string })?.digest ?? "";
      if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw e;
      target = "/admin/login?error=1";
    }
    redirect(target);
  }

  const input = "mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-ailu-cream placeholder:text-ailu-cream/40";

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111111] p-8 shadow-2xl">
      <Image src="/brand/ailu-logo.png" alt="AILU" width={1400} height={468} className="mx-auto h-9 w-auto" priority />
      <h1 className="mt-6 text-center font-display text-xl font-bold">Staff sign-in</h1>
      <p className="mt-1 text-center text-sm text-ailu-cream/60">For AILU team members only.</p>

      {searchParams?.changed ? <p className="mt-4 rounded-lg bg-ailu-yellow/10 px-3 py-2 text-sm text-ailu-yellow">Password changed. Please sign in again.</p> : null}
      {searchParams?.error ? <p role="alert" className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">That email or password is not right, or there were too many tries. Please wait a few minutes and try again.</p> : null}

      <form action={passwordSignIn} className="mt-6">
        <label className="block text-sm">Email<input name="email" type="email" autoComplete="username" required className={input} /></label>
        <label className="mt-3 block text-sm">Password<input name="password" type="password" autoComplete="current-password" required className={input} /></label>
        <button className="mt-5 w-full rounded-full bg-ailu-yellow px-6 py-3 font-semibold text-ailu-black transition hover:brightness-105">Sign in</button>
      </form>

      {googleEnabled() && (
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/admin" });
          }}
          className="mt-3"
        >
          <button className="w-full rounded-full border border-ailu-yellow px-6 py-2.5 text-sm font-semibold text-ailu-yellow hover:bg-ailu-yellow/10">Continue with Google</button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-ailu-cream/45">Forgot your password? Ask the AILU owner to set a new one.</p>
    </div>
  );
}
