"use client";
import { useEffect, useState } from "react";

export type SubmitState = { status: "idle" | "sending" | "done" | "error"; message?: string; id?: string; fields?: Record<string, string[]> };
// aria-invalid is set on a field the server rejected; the red border is what "Please check the highlighted fields" points to.
export const inputCls = "mt-1 min-h-11 w-full rounded-sm border border-white/20 bg-ailu-black px-3 py-3 text-ailu-cream placeholder:text-ailu-cream/40 aria-[invalid=true]:border-red-300";

// Posts a form to an API route as JSON. `build` turns the raw FormData into the payload.
export function useFormSubmit(endpoint: string, build: (fd: FormData) => Record<string, unknown>) {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  useEffect(() => {
    if (state.status === "done" || state.status === "error") document.getElementById("public-form-feedback")?.focus();
  }, [state.status]);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.status === "sending") return;
    setState({ status: "sending" });
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(build(new FormData(e.currentTarget))) });
      const json = await res.json();
      if (!res.ok) return setState({ status: "error", message: json.error, fields: json.fields });
      setState({ status: "done", id: json.id });
    } catch { setState({ status: "error", message: "Could not reach AILU. Check your connection and try again." }); }
  }
  const err = (f: string) => state.fields?.[f]?.[0];
  return { state, onSubmit, err };
}
