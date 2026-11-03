"use client";

import { useState } from "react";
import Link from "next/link";
import { DREAM_CATEGORIES, DREAM_CATEGORY_LABELS } from "@/lib/dreams";
import { inputCls, useFormSubmit } from "./useFormSubmit";

const fieldError = (name: string, message?: string) => message ? <span id={`dream-${name}-error`} className="text-sm font-medium text-red-800">{message}</span> : null;

export default function DreamForm() {
  const [isMinor, setIsMinor] = useState(false);
  const { state, onSubmit, err } = useFormSubmit("/api/dreams", (fd) => ({
    ...Object.fromEntries(fd.entries()),
    isMinor: fd.get("isMinor") === "yes",
    guardianConsent: fd.get("guardianConsent") === "on",
    consentToContact: fd.get("consentToContact") === "on",
  }));

  if (state.status === "done") {
    return <div id="public-form-feedback" tabIndex={-1} role="status" className="rounded-2xl border border-ailu-yellow bg-white p-6 focus-visible:outline sm:p-8">
      <h2 className="font-display text-2xl font-bold">{isMinor ? "Thank you for sharing this on the dreamer’s behalf." : "Thank you for sharing your dream."}</h2>
      <p className="mt-3">Your private reference ID is <strong className="font-mono">{state.id}</strong>. Keep it safe and do not share it publicly.</p>
      <p className="mt-2">{isMinor ? "AILU will contact the parent or guardian privately if follow-up is appropriate." : "AILU will contact you privately if follow-up is appropriate."} Nothing is published. Sharing a dream is not a promise that it will be fulfilled.</p>
    </div>;
  }

  return <form onSubmit={onSubmit} noValidate className="grid gap-4 rounded-2xl border border-black/10 bg-white p-5 sm:grid-cols-2 sm:p-7">
    <fieldset className="sm:col-span-2">
      <legend className="font-semibold">Is the dreamer under 18?</legend>
      <div className="mt-2 flex flex-wrap gap-4">
        <label className="flex min-h-11 items-center gap-2"><input type="radio" name="isMinor" value="no" checked={!isMinor} onChange={() => setIsMinor(false)} />No, the dreamer is 18 or older</label>
        <label className="flex min-h-11 items-center gap-2"><input type="radio" name="isMinor" value="yes" checked={isMinor} onChange={() => setIsMinor(true)} />Yes, the dreamer is under 18</label>
      </div>
    </fieldset>

    {isMinor ? <>
      <label className="block sm:col-span-2">Dreamer’s first name or nickname (optional)<input name="displayName" maxLength={80} autoComplete="off" className={inputCls} aria-invalid={Boolean(err("displayName"))} aria-describedby={err("displayName") ? "dream-displayName-error" : undefined} />{fieldError("displayName", err("displayName"))}</label>
      <label className="block">Parent or guardian’s name<input name="guardianName" required maxLength={80} autoComplete="name" className={inputCls} aria-invalid={Boolean(err("guardianName"))} aria-describedby={err("guardianName") ? "dream-guardianName-error" : undefined} />{fieldError("guardianName", err("guardianName"))}</label>
      <label className="block">Parent or guardian’s mobile number<input name="guardianPhone" required type="tel" inputMode="tel" autoComplete="tel" className={inputCls} aria-invalid={Boolean(err("guardianPhone"))} aria-describedby={err("guardianPhone") ? "dream-guardianPhone-error" : undefined} />{fieldError("guardianPhone", err("guardianPhone"))}</label>
      <p className="text-sm text-black/65 sm:col-span-2">The child will not be asked to meet anyone through this form.</p>
      <label className="flex min-h-11 items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" name="guardianConsent" className="mt-1 h-5 w-5" aria-invalid={Boolean(err("guardianConsent"))} aria-describedby={err("guardianConsent") ? "dream-guardianConsent-error" : undefined} /><span>I am the parent or guardian, and I give permission for this private request to be sent to AILU.</span></label>
      {fieldError("guardianConsent", err("guardianConsent"))}
    </> : <>
      <label className="block">Your name or nickname<input name="displayName" required maxLength={80} autoComplete="name" className={inputCls} aria-invalid={Boolean(err("displayName"))} aria-describedby={err("displayName") ? "dream-displayName-error" : undefined} />{fieldError("displayName", err("displayName"))}</label>
      <label className="block">Mobile number (optional)<input name="contactPhone" type="tel" inputMode="tel" autoComplete="tel" className={inputCls} aria-invalid={Boolean(err("contactPhone"))} aria-describedby={err("contactPhone") ? "dream-contactPhone-error" : undefined} />{fieldError("contactPhone", err("contactPhone"))}</label>
      <label className="block sm:col-span-2">Email (optional)<input name="contactEmail" type="email" autoComplete="email" className={inputCls} aria-invalid={Boolean(err("contactEmail"))} aria-describedby={err("contactEmail") ? "dream-contactEmail-error" : undefined} />{fieldError("contactEmail", err("contactEmail"))}</label>
    </>}

    <label className="block">City<input name="city" required maxLength={80} autoComplete="address-level2" className={inputCls} aria-invalid={Boolean(err("city"))} aria-describedby={err("city") ? "dream-city-error" : undefined} />{fieldError("city", err("city"))}</label>
    <label className="block">What is this dream about?<select name="category" defaultValue="MY_DREAM" className={inputCls} aria-invalid={Boolean(err("category"))} aria-describedby={err("category") ? "dream-category-error" : undefined}>{DREAM_CATEGORIES.map((category) => <option key={category} value={category}>{DREAM_CATEGORY_LABELS[category]}</option>)}</select>{fieldError("category", err("category"))}</label>
    <label className="block sm:col-span-2">Tell us about the dream<textarea name="dream" required maxLength={2000} rows={5} className={inputCls} aria-invalid={Boolean(err("dream"))} aria-describedby={err("dream") ? "dream-dream-error" : "dream-safety-reminder"} />{fieldError("dream", err("dream"))}<span id="dream-safety-reminder" className="mt-1 block text-xs text-black/60">Up to 2,000 characters. Please do not include sensitive details listed above.</span></label>
    <label className="block sm:col-span-2">Why does it matter to you? (optional)<textarea name="whyItMatters" maxLength={1500} rows={3} className={inputCls} aria-invalid={Boolean(err("whyItMatters"))} aria-describedby={err("whyItMatters") ? "dream-whyItMatters-error" : undefined} />{fieldError("whyItMatters", err("whyItMatters"))}</label>
    <label className="block sm:col-span-2">What help would make a difference? (optional)<textarea name="helpNeeded" maxLength={1500} rows={3} className={inputCls} aria-invalid={Boolean(err("helpNeeded"))} aria-describedby={err("helpNeeded") ? "dream-helpNeeded-error" : undefined} />{fieldError("helpNeeded", err("helpNeeded"))}</label>
    <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
    <label className="flex min-h-11 items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" name="consentToContact" className="mt-1 h-5 w-5" aria-invalid={Boolean(err("consentToContact"))} aria-describedby={err("consentToContact") ? "dream-consent-error" : undefined} /><span>I agree that AILU may contact me privately about this dream, and I have read the <Link href="/privacy" className="font-semibold underline">Privacy Policy</Link>.{isMinor ? " I am the parent or guardian and am giving this consent for the request." : ""}</span></label>
    {fieldError("consentToContact", err("consentToContact"))}
    {state.status === "error" && <p id="public-form-feedback" tabIndex={-1} role="alert" className="text-red-800 focus-visible:outline sm:col-span-2">{state.message}</p>}
    <button disabled={state.status === "sending"} className="min-h-12 rounded-full bg-ailu-yellow px-7 py-3 font-semibold disabled:opacity-60 sm:col-span-2 sm:justify-self-start">{state.status === "sending" ? "Sending privately..." : "Share privately with AILU"}</button>
  </form>;
}
