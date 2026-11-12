"use client";
// After "Save and preview": opens the preview with a full page load, so the browser keeps the preview cookie.
import { useEffect } from "react";

export default function OpenPreview({ href }: { href: string }) {
  useEffect(() => {
    window.history.replaceState(null, "", window.location.pathname + window.location.search.replace(/[?&]preview=1/, "").replace(/^&/, "?"));
    window.location.assign(href);
  }, [href]);
  return <p role="status" className="mt-4 rounded-lg border border-ailu-yellow/30 bg-ailu-yellow/10 p-3 text-sm">Draft saved. Opening the preview… <a href={href} className="underline">Open it now</a></p>;
}
