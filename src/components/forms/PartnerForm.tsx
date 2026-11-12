"use client";

// Public sales partner form (/join/partner). Posts to /api/partners.
// Labels come from the CMS in the page language; values sent to the CRM stay English.
import { useContent } from "@/components/ContentProvider";
import { getCategory } from "@/lib/events";
import { inputCls, useFormSubmit } from "./useFormSubmit";
import { withPrivacy } from "./formText";

export default function PartnerForm() {
  const EVENT_CATEGORIES = useContent().celebrations.items;
  const { state, onSubmit, err, fieldMessage, text, locale } = useFormSubmit("/api/partners", (fd) => ({
    ...Object.fromEntries(fd.entries()),
    clientCategories: fd.getAll("clientCategories").join(", "),
    consent: fd.get("consent") === "on",
  }));
  const t = text.partner;
  const english = (slug: string, title: string) => (locale === "en" ? title : getCategory(slug)?.title ?? title);

  if (state.status === "done") {
    return (
      <div id="public-form-feedback" tabIndex={-1} role="status" className="rounded-sm border border-ailu-yellow/45 bg-white/[.04] p-6 text-ailu-cream focus-visible:outline">
        <p className="font-display text-2xl font-bold">{t.doneTitle.replace("{id}", state.id ?? "")}</p>
        <p className="mt-2">{t.doneText}</p>
        <p className="mt-2 text-sm text-ailu-cream/60">{t.doneNote}</p>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 rounded-sm border border-white/10 bg-white/[.04] p-5 text-ailu-cream sm:grid-cols-2 sm:p-6">
      <label className="block">{text.fields.fullName}<input name="name" required autoComplete="name" className={inputCls} aria-invalid={Boolean(err("name"))} aria-describedby={err("name") ? "partner-name-error" : undefined} />{err("name") && <span id="partner-name-error" className="text-sm font-medium text-red-300">{text.errors.name}</span>}</label>
      <label className="block">{text.fields.mobile}<input name="phone" required inputMode="tel" autoComplete="tel" className={inputCls} aria-invalid={Boolean(err("phone"))} aria-describedby={err("phone") ? "partner-phone-error" : undefined} />{err("phone") && <span id="partner-phone-error" className="text-sm font-medium text-red-300">{fieldMessage("phone", text.errors.mobile)}</span>}</label>
      <label className="block">{text.fields.emailOptional}<input name="email" type="email" autoComplete="email" className={inputCls} aria-invalid={Boolean(err("email"))} aria-describedby={err("email") ? "partner-email-error" : undefined} />{err("email") && <span id="partner-email-error" className="text-sm font-medium text-red-300">{text.errors.emailAddress}</span>}</label>
      <label className="block">{text.fields.city}<input name="city" required autoComplete="address-level2" className={inputCls} aria-invalid={Boolean(err("city"))} aria-describedby={err("city") ? "partner-city-error" : undefined} />{err("city") && <span id="partner-city-error" className="text-sm font-medium text-red-300">{text.errors.city}</span>}</label>
      <fieldset className="sm:col-span-2">
        <legend>{t.clientTypes}</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {EVENT_CATEGORIES.map((c) => (<label key={c.slug} className="flex min-h-11 items-center gap-2 py-2 text-sm"><input type="checkbox" name="clientCategories" value={english(c.slug, c.title)} />{c.title}</label>))}
        </div>
      </fieldset>
      <label className="block sm:col-span-2">{t.experience}<textarea name="experience" rows={3} className={inputCls} placeholder={t.experiencePlaceholder} /></label>
      <label className="block sm:col-span-2">{t.heardFrom}<input name="referralSource" className={inputCls} /></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <label className="flex min-h-11 items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" name="consent" className="mt-1 h-5 w-5" aria-invalid={Boolean(err("consent"))} aria-describedby={err("consent") ? "partner-consent-error" : undefined} /><span>{withPrivacy(t.consent, text.privacyLink)}</span></label>
      {err("consent") && <p id="partner-consent-error" className="text-sm font-medium text-red-300 sm:col-span-2">{fieldMessage("consent", text.errors.consentContact)}</p>}
      {state.status === "error" && <p id="public-form-feedback" tabIndex={-1} role="alert" className="text-red-300 focus-visible:outline sm:col-span-2">{state.message}</p>}
      <button disabled={state.status === "sending"} className="min-h-11 rounded-full bg-ailu-yellow px-7 py-3 font-semibold text-ailu-black disabled:opacity-60 sm:col-span-2 sm:justify-self-start">{state.status === "sending" ? text.sending : t.submit}</button>
      <p className="text-sm text-ailu-cream/55 sm:col-span-2">{t.footnote}</p>
    </form>
  );
}
