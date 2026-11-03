"use client";
import { useEffect } from "react";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { /* Keep technical details out of the visitor-facing page. */ }, []);
  return <div className="mx-auto max-w-3xl px-4 py-24" role="alert"><p className="text-sm font-semibold uppercase tracking-widest">AILU</p><h1 className="mt-3 text-4xl font-bold">That did not work as expected.</h1><p className="mt-4 text-lg">Please try again. If the problem continues, contact AILU by phone or WhatsApp.</p><button className="mt-7 min-h-11 rounded-full bg-ailu-yellow px-6 font-semibold" onClick={() => reset()}>Try again</button><a className="ml-4 underline decoration-ailu-yellow decoration-2" href="https://wa.me/917448811611">Contact AILU</a></div>;
}
