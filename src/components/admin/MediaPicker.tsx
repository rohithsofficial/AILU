"use client";

// CMS photo field: shows the chosen photo, then "Change photo" opens a window to search the photo library
// or upload a new photo with its description, without leaving the page. Saves the photo's address.
import { useId, useRef, useState } from "react";
import MediaUpload, { type MediaItem } from "@/components/admin/MediaUpload";

const button = "rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-ailu-cream hover:border-ailu-yellow";

export default function MediaPicker({ label, value, onChange, media, setMedia }: { label: string; value: string; onChange: (value: string) => void; media: MediaItem[]; setMedia: (items: MediaItem[]) => void }) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const current = media.find((item) => item.url === value);
  const choose = (url: string) => { onChange(url); dialog.current?.close(); };
  return <div className="text-sm">
    <span id={`${id}-label`} className="block">{label}</span>
    <div className="mt-1 flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 p-2.5">
      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {value ? <img src={value} alt={current?.alt ?? ""} className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-[11px] text-ailu-cream/45">No photo</span>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-ailu-cream/65">{value ? current?.alt || "Photo from the website" : "No photo chosen"}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" aria-describedby={`${id}-label`} className={button} onClick={() => { setOpen(true); dialog.current?.showModal(); }}>{value ? "Change photo" : "Choose photo"}</button>
          {value ? <button type="button" className="px-2 text-xs text-ailu-cream/55 hover:text-red-400" onClick={() => onChange("")}>Remove</button> : null}
        </div>
      </div>
    </div>
    <dialog ref={dialog} aria-labelledby={`${id}-title`} onClose={() => setOpen(false)}
      onClick={(event) => { if (event.target === dialog.current) dialog.current.close(); }}
      className="m-auto w-[min(52rem,calc(100vw-1.5rem))] rounded-2xl border border-white/15 bg-[#111114] p-0 text-ailu-cream shadow-2xl backdrop:bg-black/70">
      {open ? <PickerBody titleId={`${id}-title`} media={media} selected={value} onPick={choose} onUploaded={(item) => { setMedia([item, ...media]); choose(item.url); }} onClose={() => dialog.current?.close()} /> : null}
    </dialog>
  </div>;
}

function PickerBody({ titleId, media, selected, onPick, onUploaded, onClose }: { titleId: string; media: MediaItem[]; selected: string; onPick: (url: string) => void; onUploaded: (item: MediaItem) => void; onClose: () => void }) {
  const [tab, setTab] = useState<"library" | "upload">(media.length ? "library" : "upload");
  const [query, setQuery] = useState("");
  const words = query.trim().toLowerCase();
  const found = words ? media.filter((item) => item.alt.toLowerCase().includes(words)) : media;
  return <div className="flex max-h-[85vh] flex-col">
    <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
      <h2 id={titleId} className="font-display text-xl font-bold">Choose a photo</h2>
      <button type="button" onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm text-ailu-cream/70 hover:bg-white/10">Close</button>
    </div>
    <div role="tablist" className="flex gap-1 border-b border-white/10 px-5">
      {(["library", "upload"] as const).map((item) => <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)}
        className={`border-b-2 px-3 py-2.5 text-sm ${tab === item ? "border-ailu-yellow font-semibold text-ailu-yellow" : "border-transparent text-ailu-cream/60"}`}>
        {item === "library" ? `Photo library (${media.length})` : "Upload new"}
      </button>)}
    </div>
    <div className="overflow-y-auto p-5">
      {tab === "library" ? <>
        <label className="block"><span className="sr-only">Search photos</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by description…" className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm" />
        </label>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {found.map((item) => <li key={item.id}>
            <button type="button" onClick={() => onPick(item.url)} className="group block w-full text-left">
              <span className={`block aspect-[4/3] overflow-hidden rounded-lg bg-white/10 ring-ailu-yellow group-hover:ring-2 group-focus-visible:ring-2 ${item.url === selected ? "ring-2" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.alt} loading="lazy" className="h-full w-full object-cover" />
              </span>
              <span className="mt-1 line-clamp-2 block text-xs text-ailu-cream/65">{item.alt}</span>
            </button>
          </li>)}
        </ul>
        {!found.length ? <p className="py-10 text-center text-sm text-ailu-cream/55">{media.length ? "No photo matches that search." : "The photo library is empty. Upload the first photo."}</p> : null}
      </> : <MediaUpload inline onAdded={onUploaded} />}
    </div>
  </div>;
}
