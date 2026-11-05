import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, authConfigured, bootstrapEmail, devLoginEnabled, signIn } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AdminLogin({ searchParams }: { searchParams: { error?: string } }) {
  const session = await auth();
  if (session?.user) redirect("/admin");

  const hasBootstrap = Boolean(bootstrapEmail());
  async function devSignIn(formData: FormData) {
    "use server";
    let target = "/admin";
    try {
      await signIn("dev", { redirect: false, email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? "") });
    } catch (e) {
      const reason = (e as { type?: string; digest?: string })?.type ?? (e as Error)?.message ?? "unknown";
      if (typeof reason === "string" && reason.startsWith("NEXT_REDIRECT")) throw e;
      target = `/admin/login?error=${encodeURIComponent(String(reason).slice(0, 200))}`;
    }
    redirect(target);
  }

  const input = "mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-ailu-cream placeholder:text-ailu-cream/40";

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111111] p-8 shadow-2xl">
      <Image src="/brand/ailu-logo.png" alt="AILU" width={1400} height={468} className="mx-auto h-9 w-auto" priority />
      <h1 className="mt-6 text-center font-display text-xl font-bold">Staff sign-in</h1>
      <p className="mt-1 text-center text-sm text-ailu-cream/60">For AILU team members only.</p>

      {authConfigured() ? (
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/admin" });
          }}
          className="mt-6"
        >
          <button className="w-full rounded-full bg-ailu-yellow px-6 py-3 font-semibold text-ailu-black transition hover:brightness-105">
            Continue with Google
          </button>
        </form>
      ) : (
        <div className="mt-6 rounded-lg bg-ailu-yellow/10 p-4 text-sm text-ailu-cream/80">
          Staff sign-in is not switched on yet. Add Google OAuth credentials to finish setup.
        </div>
      )}

      {devLoginEnabled && (
        <form action={devSignIn} className="mt-4 border-t border-white/10 pt-4">
          <label className="block text-sm">Email<input name="email" type="email" required className={input} /></label>
          <label className="mt-2 block text-sm">Password<input name="password" type="password" required className={input} /></label>
          <button className="mt-3 w-full rounded-full border border-ailu-yellow px-6 py-2.5 text-sm font-semibold text-ailu-yellow hover:bg-ailu-yellow/10">
            Dev sign-in
          </button>
          {searchParams?.error ? <p className="mt-2 text-sm text-red-400">Sign-in failed ({decodeURIComponent(searchParams.error)})</p> : null}
        </form>
      )}

      {!hasBootstrap && (
        <p className="mt-4 text-center text-xs text-ailu-cream/45">
          No owner allowlist configured. Set STAFF_OWNER_EMAILS in the environment.
        </p>
      )}
      <p className="mt-6 text-center text-xs text-ailu-cream/40">Site not launched yet? This page stays open when the site is in coming-soon mode.</p>
    </div>
  );
}
