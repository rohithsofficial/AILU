"use client";
import { useFormStatus } from "react-dom";

// Checking a password takes a few seconds, so the button must show that something is happening.
export default function SignInButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} aria-busy={pending} className="mt-5 w-full rounded-full bg-ailu-yellow px-6 py-3 font-semibold text-ailu-black transition hover:brightness-105 disabled:cursor-wait disabled:opacity-70">
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}
