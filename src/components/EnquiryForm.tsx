"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useContent } from "@/components/ContentProvider";
import { enquiryPrefill } from "@/lib/enquiry-prefill";
import { todayInIndia } from "@/lib/validation";
import { BRAND } from "@/lib/brand";
import type { Variant } from "@/lib/experiments";

type State = { status: "idle" | "sending" | "done" | "error"; message?: string; id?: string; fields?: Record<string, string[]> };
const input = "mt-1 min-h-11 w-full rounded-sm border border-white/20 bg-ailu-black px-3 py-3 text-ailu-cream placeholder:text-ailu-cream/40";

// `landing` and `submitLabel` are used only by the landing page and its A/B test (docs/AB_TESTING.md).
export default function EnquiryForm({ defaultCategory, landing, submitLabel = "Send enquiry" }: { defaultCategory?: string; landing?: Variant; submitLabel?: string }) {
  const EVENT_CATEGORIES = useContent().celebrations.items;
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
      if (!res.ok) return setState({ status: "error", message: json.error, fields: json.fields });
      setState({ status: "done", id: json.id });
    } catch { setState({ status: "error", message: "Could not reach AILU. Check your connection and try again." }); }
  }

  if (state.status === "done") {
    const message = `Hi AILU, I sent an event enquiry (${state.id}). Please contact me about it.`;
    return <div ref={feedbackRef} tabIndex={-1} role="status" className="rounded-sm border border-ailu-yellow/45 bg-white/[.04] p-6 text-ailu-cream focus-visible:outline">
      <p className="font-display text-2xl font-bold">Thank you for choosing AILU.</p>
      <p className="mt-2">Your enquiry ID is <strong>{state.id}</strong>. Our team will review your requirements and contact you. This is an enquiry, not a confirmed booking.</p>
      <a className="mt-5 inline-flex min-h-11 items-center rounded-sm bg-ailu-yellow px-5 font-semibold text-ailu-black" href={`${BRAND.whatsapp}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">Continue on WhatsApp</a>
    </div>;
  }

  const err = (field: string) => state.fields?.[field]?.[0];
  const error = (field: string, fallback: string) => err(field) && <span id={`${field}-error`} className="mt-1 block text-sm font-medium text-red-800">{err(field) || fallback}</span>;
  return <form onSubmit={onSubmit} className="grid gap-4 rounded-sm border border-white/10 bg-white/[.04] p-5 text-ailu-cream sm:grid-cols-2 sm:p-6" noValidate>
    <label className="block">Your name<input name="name" required autoComplete="name" className={input} aria-invalid={Boolean(err("name"))} aria-describedby={err("name") ? "name-error" : undefined} />{error("name", "Enter your name")}</label>
    <label className="block">Mobile number<input name="phone" required inputMode="tel" autoComplete="tel" className={input} aria-invalid={Boolean(err("phone"))} aria-describedby={err("phone") ? "phone-error" : undefined} />{error("phone", "Enter a valid mobile number")}</label>
    <label className="block">Email (optional)<input name="email" type="email" autoComplete="email" className={input} aria-invalid={Boolean(err("email"))} aria-describedby={err("email") ? "email-error" : undefined} />{error("email", "Enter a valid email")}</label>
    <label className="block">Event category<select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className={input}>{EVENT_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}</select></label>
    <label className="block">Event date (if known)<input name="eventDate" type="date" min={todayInIndia()} className={input} aria-invalid={Boolean(err("eventDate"))} aria-describedby={err("eventDate") ? "eventDate-error" : undefined} />{error("eventDate", "Choose today or a future date")}</label>
    <label className="block">Event location<input name="location" required autoComplete="address-level2" className={input} aria-invalid={Boolean(err("location"))} aria-describedby={err("location") ? "location-error" : undefined} />{error("location", "Enter the event location")}</label>
    <label className="block">Expected guests<input name="guests" type="number" min={1} className={input} aria-invalid={Boolean(err("guests"))} aria-describedby={err("guests") ? "guests-error" : undefined} />{error("guests", "Enter a valid guest count")}</label>
    <label className="block">Estimated budget (optional)<input name="budget" className={input} /></label>
    <label className="block sm:col-span-2">Services you need<input name="services" placeholder="Decor, hosting, performances..." className={input} /></label>
    <label className="block sm:col-span-2">Anything else we should know<textarea name="details" rows={4} className={input} /></label>
    <div className="sm:col-span-2">
      <button type="button" aria-expanded={showReferral} aria-controls="referral-fields" onClick={() => setShowReferral((value) => !value)} className="min-h-11 font-semibold underline decoration-ailu-yellow decoration-2">Referred by an AILU partner?</button>
      {showReferral && <div id="referral-fields" className="mt-2"><label className="block">Partner ID (optional)<input name="referralId" value={referralId} onChange={(e) => setReferralId(e.target.value)} placeholder="AILU-SP-000001" className={input} aria-invalid={Boolean(err("referralId"))} aria-describedby={err("referralId") ? "referralId-error" : undefined} />{error("referralId", "Check the partner ID")}</label></div>}
    </div>
    <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
    <label className="flex min-h-11 items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" name="consent" required className="mt-1 h-5 w-5 accent-[#F5C400]" aria-invalid={Boolean(err("consent"))} aria-describedby={err("consent") ? "consent-error" : undefined} />
      <span>By sending this, you agree AILU may contact you about your event. See our <Link href="/privacy" className="font-semibold underline">Privacy Policy</Link>.</span></label>
    {error("consent", "Please agree before sending your enquiry")}
    {state.status === "error" && <div ref={feedbackRef} id="form-feedback" tabIndex={-1} role="alert" className="text-red-800 focus-visible:outline sm:col-span-2">{state.message}</div>}
    <button disabled={state.status === "sending"} className="min-h-11 rounded-full bg-ailu-yellow px-7 py-3 font-semibold text-ailu-black disabled:opacity-60 sm:col-span-2 sm:justify-self-start">{state.status === "sending" ? "Sending..." : submitLabel}</button>
    <p className="text-sm text-ailu-cream/55 sm:col-span-2">No payment is taken to enquire. Please don&apos;t include identity documents or financial details.</p>
  </form>;
}
