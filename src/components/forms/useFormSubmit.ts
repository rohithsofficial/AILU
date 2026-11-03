"use client";
import { useEffect, useState } from "react";

export type SubmitState = { status: "idle" | "sending" | "done" | "error"; message?: string; id?: string; fields?: Record<string, string[]> };
export const inputCls = "mt-1 w-full rounded-lg border border-black/20 bg-white px-3 py-3";

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
