"use client";
import "./globals.css";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body className="bg-ailu-cream text-ailu-black"><main className="mx-auto max-w-3xl px-4 py-24" role="alert"><p className="text-sm font-semibold uppercase tracking-widest">AILU</p><h1 className="mt-3 text-4xl font-bold">We are having trouble loading this page.</h1><p className="mt-4 text-lg">Please try again, or contact AILU if you need help.</p><button className="mt-7 min-h-11 rounded-full bg-ailu-yellow px-6 font-semibold" onClick={() => reset()}>Try again</button></main></body></html>;
}
