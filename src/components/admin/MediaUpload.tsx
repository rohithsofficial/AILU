"use client";
import { useRef, useState } from "react";

export type MediaItem = { id: string; url: string; alt: string };

/** Uploads one photo. It sends its own request, so it can sit inside another form. `inline` shows the fields open (photo picker). */
export default function MediaUpload({ onAdded, inline = false }: { onAdded: (item: MediaItem) => void; inline?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState("");
  const [state, setState] = useState<{ busy: boolean; error: string }>({ busy: false, error: "" });

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return setState({ busy: false, error: "Choose a photo first." });
    if (alt.trim().length < 3) return setState({ busy: false, error: "Describe the photo in a few words. Google and screen readers use this." });
    setState({ busy: true, error: "" });
    const body = new FormData();
    body.set("file", file);
    body.set("alt", alt);
    try {
      const response = await fetch("/api/admin/cms/upload", { method: "POST", body });
      const data = await response.json() as MediaItem & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "The upload failed.");
      onAdded(data);
      setAlt("");
      if (fileRef.current) fileRef.current.value = "";
      setState({ busy: false, error: "" });
    } catch (error) {
      setState({ busy: false, error: (error as Error).message });
    }
  }

  const fields = <div className="mt-2 grid gap-2">
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Photo file" className="text-xs" />
      <input value={alt} onChange={(event) => setAlt(event.target.value)} placeholder="Describe the photo, e.g. Stage lights at a wedding" aria-label="Photo description" maxLength={200} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-ailu-cream" />
      <button type="button" disabled={state.busy} onClick={upload} className="w-fit rounded-lg border border-ailu-yellow/60 px-3 py-1.5 text-xs font-semibold text-ailu-yellow disabled:opacity-50">{state.busy ? "Uploading…" : inline ? "Upload and use this photo" : "Upload"}</button>
      {state.error ? <p role="alert" className="text-xs text-red-400">{state.error}</p> : null}
      <p className="text-xs text-ailu-cream/45">JPG, PNG or WebP, up to 4 MB. Use only real photos you have permission to publish.</p>
    </div>;
  if (inline) return <div className="text-sm">{fields}</div>;
  return <details className="mt-2 rounded-lg border border-white/10 p-3 text-sm">
    <summary className="cursor-pointer text-xs text-ailu-yellow">Upload a new photo</summary>
    {fields}
  </details>;
}
