"use client";
import { useEffect, useRef, useState } from "react";
import { useContent } from "@/components/ContentProvider";
import { useLocale } from "@/components/LocaleLink";
import { serverMessage, withId, withPrivacy } from "@/components/forms/formText";
import { enquiryPrefill } from "@/lib/enquiry-prefill";
import { todayInIndia } from "@/lib/validation";
import { BRAND } from "@/lib/brand";
import type { Variant } from "@/lib/experiments";

type State = { status: "idle" | "sending" | "done" | "error"; message?: string; id?: string; fields?: Record<string, string[]> };
// aria-invalid marks a field the server rejected; the red border is what "Please check the highlighted fields" points to.
const input = "mt-1 min-h-11 w-full rounded-sm border border-white/20 bg-ailu-black px-3 py-3 text-ailu-cream placeholder:text-ailu-cream/40 aria-[invalid=true]:border-red-300";

// `landing` and `submitLabel` are used only by the landing page and its A/B test (docs/AB_TESTING.md).
// Labels come from the CMS ("Buttons, forms and messages") in the page language.
export default function EnquiryForm({ defaultCategory, landing, submitLabel }: { defaultCategory?: string; landing?: Variant; submitLabel?: string }) {
  const { celebrations, ui } = useContent();
  const EVENT_CATEGORIES = celebrations.items;
  const locale = useLocale();
  const text = ui.forms;
  const t = text.enquiry;
  const [state, setState] = useState<State>({ status: "idle" });
  const [category, setCategory] = useState(defaultCategory ?? EVENT_CATEGORIES[0].slug);
  const [referralId, setReferralId] = useState("");
  const [showReferral, setShowReferral] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefill = enquiryPrefill(new URLSearchParams(window.location.search));
    if (prefill.category) setCategory(prefill.category);
    if (prefill.referralId) { setReferralId(prefill.referralId); setShowReferral(true); }
  }, []);
  useEffect(() => { if (state.status === "done" || state.status === "error") feedbackRef.current?.focus(); }, [state.status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.status === "sending") return;
    setState({ status: "sending" });
    const data: Record<string, unknown> = Object.fromEntries(new FormData(e.currentTarget).entries());
    data.consent = data.consent === "on";
    data.category = category;
    data.referralId = referralId;
    if (landing) data.landing = landing;
    try {
      const res = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) return setState({ status: "error", message: serverMessage(locale, res.status, json.error, text.server), fields: json.fields });
      setState({ status: "done", id: json.id });
    } catch { setState({ status: "error", message: text.server.network }); }
  }

  if (state.status === "done") {
    const message = t.whatsappAfterMessage.replace("{id}", state.id ?? "");
    return <div ref={feedbackRef} tabIndex={-1} role="status" className="rounded-sm border border-ailu-yellow/45 bg-white/[.04] p-6 text-ailu-cream focus-visible:outline">
      <p className="font-display text-2xl font-bold">{t.doneTitle}</p>
      <p className="mt-2">{withId(t.doneText, state.id)}</p>
      <a className="mt-5 inline-flex min-h-11 items-center rounded-sm bg-ailu-yellow px-5 font-semibold text-ailu-black" href={`${BRAND.whatsapp}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">{t.whatsappAfter}</a>
    </div>;
  }

  const err = (field: string) => state.fields?.[field]?.[0];
  // English shows the server's own words; other languages show the CMS message for that field.
  const error = (field: string, translated: string) => err(field) && <span id={`${field}-error`} className="mt-1 block text-sm font-medium text-red-300">{locale === "en" ? err(field) : translated}</span>;
  return <form onSubmit={onSubmit} className="grid gap-4 rounded-sm border border-white/10 bg-white/[.04] p-5 text-ailu-cream sm:grid-cols-2 sm:p-6" noValidate>
    <label className="block">{text.fields.name}<input name="name" required autoComplete="name" className={input} aria-invalid={Boolean(err("name"))} aria-describedby={err("name") ? "name-error" : undefined} />{error("name", text.errors.name)}</label>
    <label className="block">{text.fields.mobile}<input name="phone" required inputMode="tel" autoComplete="tel" className={input} aria-invalid={Boolean(err("phone"))} aria-describedby={err("phone") ? "phone-error" : undefined} />{error("phone", text.errors.mobile)}</label>
    <label className="block">{text.fields.emailOptional}<input name="email" type="email" autoComplete="email" className={input} aria-invalid={Boolean(err("email"))} aria-describedby={err("email") ? "email-error" : undefined} />{error("email", text.errors.emailAddress)}</label>
    <label className="block">{t.category}<select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className={input}>{EVENT_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}</select></label>
    <label className="block">{t.eventDate}<input name="eventDate" type="date" min={todayInIndia()} className={input} aria-invalid={Boolean(err("eventDate"))} aria-describedby={err("eventDate") ? "eventDate-error" : undefined} />{error("eventDate", text.errors.eventDate)}</label>
    <label className="block">{t.location}<input name="location" required autoComplete="address-level2" className={input} aria-invalid={Boolean(err("location"))} aria-describedby={err("location") ? "location-error" : undefined} />{error("location", text.errors.location)}</label>
    <label className="block">{t.guests}<input name="guests" type="number" min={1} className={input} aria-invalid={Boolean(err("guests"))} aria-describedby={err("guests") ? "guests-error" : undefined} />{error("guests", text.errors.guests)}</label>
    <label className="block">{t.budget}<input name="budget" className={input} /></label>
    <label className="block sm:col-span-2">{t.services}<input name="services" placeholder={t.servicesPlaceholder} className={input} /></label>
    <label className="block sm:col-span-2">{t.details}<textarea name="details" rows={4} className={input} /></label>
    <div className="sm:col-span-2">
      <button type="button" aria-expanded={showReferral} aria-controls="referral-fields" onClick={() => setShowReferral((value) => !value)} className="min-h-11 font-semibold underline decoration-ailu-yellow decoration-2">{t.referralToggle}</button>
      {showReferral && <div id="referral-fields" className="mt-2"><label className="block">{t.referralId}<input name="referralId" value={referralId} onChange={(e) => setReferralId(e.target.value)} placeholder="AILU-SP-000001" className={input} aria-invalid={Boolean(err("referralId"))} aria-describedby={err("referralId") ? "referralId-error" : undefined} />{error("referralId", text.errors.referralId)}</label></div>}
    </div>
    <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
    <label className="flex min-h-11 items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" name="consent" required className="mt-1 h-5 w-5 accent-[#F5C400]" aria-invalid={Boolean(err("consent"))} aria-describedby={err("consent") ? "consent-error" : undefined} />
      <span>{withPrivacy(t.consent, text.privacyLink)}</span></label>
    {error("consent", text.errors.consentEnquiry)}
    {state.status === "error" && <div ref={feedbackRef} id="form-feedback" tabIndex={-1} role="alert" className="text-red-300 focus-visible:outline sm:col-span-2">{state.message}</div>}
    <button disabled={state.status === "sending"} className="min-h-11 rounded-full bg-ailu-yellow px-7 py-3 font-semibold text-ailu-black disabled:opacity-60 sm:col-span-2 sm:justify-self-start">{state.status === "sending" ? text.sending : submitLabel || t.submit}</button>
    <p className="text-sm text-ailu-cream/55 sm:col-span-2">{t.footnote}</p>
  </form>;
}
