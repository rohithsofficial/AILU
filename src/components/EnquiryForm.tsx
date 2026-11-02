"use client";
import { useState } from "react";
import { EVENT_CATEGORIES } from "@/lib/events";

type State = { status: "idle" | "sending" | "done" | "error"; message?: string; id?: string; fields?: Record<string, string[]> };

export default function EnquiryForm({ defaultCategory }: { defaultCategory?: string }) {
  const [state, setState] = useState<State>({ status: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.status === "sending") return;
    setState({ status: "sending" });
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) return setState({ status: "error", message: json.error, fields: json.fields });
      setState({ status: "done", id: json.id });
    } catch { setState({ status: "error", message: "Could not reach AILU. Check your connection and try again." }); }
  }

  if (state.status === "done") {
    return (
      <div role="status" className="rounded-2xl border border-ailu-yellow bg-white p-8">
        <p className="font-display text-2xl font-bold">Thank you for choosing AILU.</p>
        <p className="mt-2">Your enquiry ID is <strong>{state.id}</strong>. Our team will review your requirements and contact you. This is an enquiry, not a confirmed booking.</p>
      </div>
    );
  }

  const err = (f: string) => state.fields?.[f]?.[0];
  const input = "mt-1 w-full rounded-lg border border-black/20 bg-white px-3 py-3";
  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-black/10 bg-white p-6 sm:grid-cols-2" noValidate>
      <label className="block">Your name<input name="name" required autoComplete="name" className={input} />{err("name") && <span className="text-sm text-red-700">Enter your name</span>}</label>
      <label className="block">Mobile number<input name="phone" required inputMode="tel" autoComplete="tel" className={input} />{err("phone") && <span className="text-sm text-red-700">{err("phone")}</span>}</label>
      <label className="block">Email (optional)<input name="email" type="email" autoComplete="email" className={input} /></label>
      <label className="block">Event category
        <select name="category" defaultValue={defaultCategory ?? EVENT_CATEGORIES[0].slug} className={input}>{EVENT_CATEGORIES.map((c) => (<option key={c.slug} value={c.slug}>{c.title}</option>))}</select>
      </label>
      <label className="block">Event date (if known)<input name="eventDate" type="date" className={input} /></label>
      <label className="block">Event location<input name="location" required className={input} />{err("location") && <span className="text-sm text-red-700">Enter the event location</span>}</label>
      <label className="block">Expected guests<input name="guests" type="number" min={1} className={input} /></label>
      <label className="block">Estimated budget<input name="budget" placeholder="Optional" className={input} /></label>
      <label className="block sm:col-span-2">Services you need<input name="services" placeholder="Decor, hosting, performances..." className={input} /></label>
      <label className="block sm:col-span-2">Anything else we should know<textarea name="details" rows={4} className={input} /></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {state.status === "error" && <p role="alert" className="text-red-700 sm:col-span-2">{state.message}</p>}
      <button disabled={state.status === "sending"} className="rounded-full bg-ailu-yellow px-7 py-3 font-semibold disabled:opacity-60 sm:col-span-2 sm:justify-self-start">{state.status === "sending" ? "Sending..." : "Send enquiry"}</button>
      <p className="text-sm text-black/60 sm:col-span-2">No payment is needed to enquire. Please don&apos;t include identity documents or financial details.</p>
    </form>
  );
}
