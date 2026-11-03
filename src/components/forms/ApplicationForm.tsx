"use client";
import { EVENT_CATEGORIES } from "@/lib/events";
import { ROLES } from "@/lib/roles";
import { inputCls, useFormSubmit } from "./useFormSubmit";

export default function ApplicationForm() {
  const { state, onSubmit, err } = useFormSubmit("/api/applications", (fd) => ({
    ...Object.fromEntries(fd.entries()),
    eventCategories: fd.getAll("eventCategories").join(", "),
    beginner: fd.get("beginner") === "on",
    consent: fd.get("consent") === "on",
  }));

  if (state.status === "done") {
    return (
      <div role="status" className="rounded-2xl border border-ailu-yellow bg-white p-8">
        <p className="font-display text-2xl font-bold">Thank you for applying to AILU.</p>
        <p className="mt-2">Your application ID is <strong>{state.id}</strong>. Keep it safe. Our team will review your details and contact you if there is a fit.</p>
        <p className="mt-2 text-sm text-black/65">Applying does not guarantee work or a paid assignment. Assignments depend on suitability, availability, event requirements and agreed terms.</p>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 rounded-2xl border border-black/10 bg-white p-6 sm:grid-cols-2">
      <label className="block">Full name<input name="name" required autoComplete="name" className={inputCls} />{err("name") && <span className="text-sm text-red-700">Enter your name</span>}</label>
      <label className="block">Mobile number<input name="phone" required inputMode="tel" autoComplete="tel" className={inputCls} />{err("phone") && <span className="text-sm text-red-700">{err("phone")}</span>}</label>
      <label className="block">Email (optional)<input name="email" type="email" autoComplete="email" className={inputCls} />{err("email") && <span className="text-sm text-red-700">Enter a valid email</span>}</label>
      <label className="block">City<input name="city" required autoComplete="address-level2" className={inputCls} />{err("city") && <span className="text-sm text-red-700">Enter your city</span>}</label>
      <label className="block sm:col-span-2">Role you are interested in<select name="role" defaultValue={ROLES[0]} className={inputCls}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></label>
      <label className="block sm:col-span-2">Your skills<textarea name="skills" rows={3} required className={inputCls} placeholder="What can you do well?" />{err("skills") && <span className="text-sm text-red-700">Tell us a little about your skills</span>}</label>
      <label className="block sm:col-span-2">Experience (optional)<textarea name="experience" rows={3} className={inputCls} placeholder="Events, performances, work you have done" /></label>
      <label className="block">Portfolio link (optional)<input name="portfolioUrl" type="url" placeholder="https://" className={inputCls} />{err("portfolioUrl") && <span className="text-sm text-red-700">Enter a full link starting with https://</span>}</label>
      <label className="block">Availability (optional)<input name="availability" placeholder="Weekends, evenings, full time..." className={inputCls} /></label>
      <fieldset className="sm:col-span-2">
        <legend>Event types you would like to work on</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {EVENT_CATEGORIES.map((c) => (<label key={c.slug} className="flex items-center gap-2 text-sm"><input type="checkbox" name="eventCategories" value={c.title} />{c.title}</label>))}
        </div>
      </fieldset>
      <label className="flex items-center gap-2 sm:col-span-2"><input type="checkbox" name="beginner" />I am a beginner and want to learn</label>
      <label className="block sm:col-span-2">Anything else (optional)<textarea name="notes" rows={3} className={inputCls} /></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <label className="flex items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" name="consent" className="mt-1" />I agree that AILU may contact me about this application using the details above.</label>
      {err("consent") && <p className="text-sm text-red-700 sm:col-span-2">{err("consent")}</p>}
      {state.status === "error" && <p role="alert" className="text-red-700 sm:col-span-2">{state.message}</p>}
      <button disabled={state.status === "sending"} className="rounded-full bg-ailu-yellow px-7 py-3 font-semibold disabled:opacity-60 sm:col-span-2 sm:justify-self-start">{state.status === "sending" ? "Sending..." : "Submit application"}</button>
      <p className="text-sm text-black/60 sm:col-span-2">Please don&apos;t include identity documents or bank details.</p>
    </form>
  );
}
