"use client";
import { EVENT_CATEGORIES } from "@/lib/events";
import { inputCls, useFormSubmit } from "./useFormSubmit";

export default function PartnerForm() {
  const { state, onSubmit, err } = useFormSubmit("/api/partners", (fd) => ({
    ...Object.fromEntries(fd.entries()),
    clientCategories: fd.getAll("clientCategories").join(", "),
    consent: fd.get("consent") === "on",
  }));

  if (state.status === "done") {
    return (
      <div role="status" className="rounded-2xl border border-ailu-yellow bg-white p-8">
        <p className="font-display text-2xl font-bold">Welcome. Your partner ID is {state.id}.</p>
        <p className="mt-2">Our team will review your registration and contact you with the partner terms. When someone you introduce sends an enquiry, they can enter this ID in the form so the referral is recorded.</p>
        <p className="mt-2 text-sm text-black/65">A reward is considered only for a verified, completed booking and follows the terms AILU confirms with you. Earnings are not guaranteed.</p>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 rounded-2xl border border-black/10 bg-white p-6 sm:grid-cols-2">
      <label className="block">Full name<input name="name" required autoComplete="name" className={inputCls} />{err("name") && <span className="text-sm text-red-700">Enter your name</span>}</label>
      <label className="block">Mobile number<input name="phone" required inputMode="tel" autoComplete="tel" className={inputCls} />{err("phone") && <span className="text-sm text-red-700">{err("phone")}</span>}</label>
      <label className="block">Email (optional)<input name="email" type="email" autoComplete="email" className={inputCls} />{err("email") && <span className="text-sm text-red-700">Enter a valid email</span>}</label>
      <label className="block">City<input name="city" required autoComplete="address-level2" className={inputCls} />{err("city") && <span className="text-sm text-red-700">Enter your city</span>}</label>
      <fieldset className="sm:col-span-2">
        <legend>Kinds of clients you can introduce</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {EVENT_CATEGORIES.map((c) => (<label key={c.slug} className="flex items-center gap-2 text-sm"><input type="checkbox" name="clientCategories" value={c.title} />{c.title}</label>))}
        </div>
      </fieldset>
      <label className="block sm:col-span-2">Relevant experience (optional)<textarea name="experience" rows={3} className={inputCls} placeholder="Sales, events, wedding planning, community network..." /></label>
      <label className="block sm:col-span-2">How did you hear about AILU? (optional)<input name="referralSource" className={inputCls} /></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <label className="flex items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" name="consent" className="mt-1" />I agree that AILU may contact me about partner terms using the details above.</label>
      {err("consent") && <p className="text-sm text-red-700 sm:col-span-2">{err("consent")}</p>}
      {state.status === "error" && <p role="alert" className="text-red-700 sm:col-span-2">{state.message}</p>}
      <button disabled={state.status === "sending"} className="rounded-full bg-ailu-yellow px-7 py-3 font-semibold disabled:opacity-60 sm:col-span-2 sm:justify-self-start">{state.status === "sending" ? "Sending..." : "Register as a partner"}</button>
      <p className="text-sm text-black/60 sm:col-span-2">Please don&apos;t include identity documents or bank details. We will ask for payment details only after a reward is approved.</p>
    </form>
  );
}
