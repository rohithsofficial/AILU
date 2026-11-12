"use client";

// Shown when a Normal World page fails. "Try again" re-renders the page. Wording from the CMS, in the page language.
import { useEffect } from "react";
import { useContent } from "@/components/ContentProvider";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { ui, settings } = useContent();
  const t = ui.error;
  useEffect(() => { /* Keep technical details out of the visitor-facing page. */ }, []);
  return <div className="mx-auto max-w-3xl px-4 py-24" role="alert"><p className="text-sm font-semibold uppercase tracking-widest">AILU</p><h1 className="mt-3 text-4xl font-bold">{t.title}</h1><p className="mt-4 text-lg">{t.text}</p><button className="mt-7 min-h-11 rounded-full bg-ailu-yellow px-6 font-semibold text-ailu-black" onClick={() => reset()}>{t.retry}</button><a className="ml-4 underline decoration-ailu-yellow decoration-2" href={settings.whatsapp}>{t.contact}</a></div>;
}
