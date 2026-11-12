"use client";

// CMS editor form. It is built from the shape of the default content, so new keys appear automatically.
// With `english` set it edits a translation: text fields only, each with the English line under it.
// Links, photos, switches and list order stay English (src/lib/i18n.ts overlayTranslation).
import { useState } from "react";
import { humanise, isFixedKey, isFixedList, isImageKey, listTemplate, type Json } from "@/lib/cms";
import { ConfirmButton } from "@/components/admin/RecordControls";
import MediaUpload, { type MediaItem } from "@/components/admin/MediaUpload";
import { isSharedKey } from "@/lib/i18n";

const input = "mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-ailu-cream";
const small = "rounded-lg border border-white/20 px-2.5 py-1 text-xs text-ailu-cream/80 hover:border-ailu-yellow disabled:opacity-30";
type Change = (value: Json) => void;

function Counter({ value, limit }: { value: string; limit: number }) {
  return <span className={`ml-2 text-xs ${value.length > limit ? "text-red-400" : "text-ailu-cream/45"}`}>{value.length}/{limit}</span>;
}

function ImageField({ label, value, onChange, media, setMedia }: { label: string; value: string; onChange: (value: string) => void; media: MediaItem[]; setMedia: (items: MediaItem[]) => void }) {
  return <div className="text-sm">
    <span>{label}</span>
    <div className="mt-1 flex flex-wrap items-center gap-3">
      {value ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={value} alt="" className="h-16 w-24 rounded-md object-cover" /> : null}
      <select value={value} onChange={(event) => onChange(event.target.value)} className={`${input} mt-0 max-w-xs`} aria-label={`${label}: choose from the photo library`}>
        <option value="" className="text-black">No image</option>
        {value && !media.some((item) => item.url === value) ? <option value={value} className="text-black">Current image</option> : null}
        {media.map((item) => <option key={item.id} value={item.url} className="text-black">{item.alt}</option>)}
      </select>
    </div>
    <MediaUpload onAdded={(item) => { setMedia([item, ...media]); onChange(item.url); }} />
  </div>;
}

type FieldProps = { name: string; value: Json; sample: Json | undefined; onChange: Change; media: MediaItem[]; setMedia: (items: MediaItem[]) => void; section: string; english?: Json };

function Field({ name, value, sample, onChange, media, setMedia, section, english }: FieldProps) {
  const label = humanise(name);
  const translating = english !== undefined;
  if (translating && (typeof value === "boolean" || (typeof value === "string" && (isFixedKey(name) || isSharedKey(name) || isImageKey(name))))) return null;
  if (typeof value === "boolean") return <label className="flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} /> {label}</label>;
  if (typeof value === "string") {
    if (isFixedKey(name)) return value ? <p className="text-xs text-ailu-cream/50">{label}: <code>{value}</code></p> : null;
    if (isImageKey(name)) return <ImageField label={label} value={value} onChange={onChange} media={media} setMedia={setMedia} />;
    const limit = section === "seo" || name.startsWith("seo") ? (/title/i.test(name) ? 60 : /description/i.test(name) ? 160 : 0) : 0;
    const long = value.length > 70 || /(text|body|copy|lead|answer|blurb|description|paragraphs)$/i.test(name);
    return <label className="block text-sm">{label}{limit ? <Counter value={value} limit={limit} /> : null}
      {long ? <textarea value={value} rows={Math.min(10, Math.max(2, Math.ceil(value.length / 80)))} onChange={(event) => onChange(event.target.value)} className={input} /> : <input value={value} onChange={(event) => onChange(event.target.value)} className={input} />}
      {translating && typeof english === "string" ? <span lang="en" className="mt-1 block text-xs text-ailu-cream/45">English: {english}</span> : null}
    </label>;
  }
  if (Array.isArray(value)) {
    const base = Array.isArray(sample) ? sample : [];
    const fixed = translating || isFixedList(base);
    const englishItems = Array.isArray(english) ? english : [];
    const move = (from: number, to: number) => { const next = [...value]; const [item] = next.splice(from, 1); next.splice(to, 0, item); onChange(next); };
    const summary = (item: Json, index: number) => {
      if (typeof item === "string") return item || `Item ${index + 1}`;
      const fields = item as Record<string, Json>;
      return String(fields.path || fields.title || fields.question || fields.label || fields.alt || `Item ${index + 1}`);
    };
    return <fieldset className="rounded-xl border border-white/10 p-3">
      <legend className="px-1 text-sm font-semibold">{label}</legend>
      <div className="space-y-2">
        {value.map((item, index) => {
          const controls = !fixed && <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className={small} disabled={index === 0} onClick={() => move(index, index - 1)}>Move up</button>
            <button type="button" className={small} disabled={index === value.length - 1} onClick={() => move(index, index + 1)}>Move down</button>
            <button type="button" className={`${small} text-red-400`} onClick={() => onChange(value.filter((_, i) => i !== index))}>Remove</button>
          </div>;
          const child = <Field name={typeof item === "string" ? `${name.replace(/s$/, "")} ${index + 1}` : name} value={item} sample={base[0] ?? listTemplate(name, base)} onChange={(next) => onChange(value.map((old, i) => i === index ? next : old))} media={media} setMedia={setMedia} section={section} english={translating ? englishItems[index] ?? "" : undefined} />;
          if (typeof item === "string") return <div key={index}>{child}{controls}</div>;
          return <details key={index} className="rounded-lg border border-white/10 p-3">
            <summary className="cursor-pointer text-sm font-medium">{summary(item, index)}</summary>
            <div className="mt-3">{child}{controls}</div>
          </details>;
        })}
      </div>
      {!fixed ? <button type="button" className={`${small} mt-3`} onClick={() => onChange([...value, listTemplate(name, base)])}>Add</button> : null}
    </fieldset>;
  }
  const baseFields = (sample ?? {}) as Record<string, Json>;
  const englishFields = (english ?? {}) as Record<string, Json>;
  return <div className="space-y-3">{Object.entries(value).map(([key, item]) => <Field key={key} name={key} value={item} sample={baseFields[key]} onChange={(next) => onChange({ ...value, [key]: next })} media={media} setMedia={setMedia} section={section} english={translating ? englishFields[key] ?? "" : undefined} />)}</div>;
}

function GooglePreview({ value }: { value: Json }) {
  const pages = (value as { pages?: { path: string; title: string; description: string }[] }).pages ?? [];
  const [path, setPath] = useState(pages[0]?.path ?? "/");
  const page = pages.find((item) => item.path === path);
  if (!page) return null;
  return <section className="mt-5 rounded-xl border border-white/10 p-4">
    <label className="block text-sm font-semibold">Google preview
      <select value={path} onChange={(event) => setPath(event.target.value)} className={input}>{pages.map((item) => <option key={item.path} value={item.path} className="text-black">{item.path}</option>)}</select>
    </label>
    <div className="mt-3 rounded-lg bg-white p-4 text-left">
      <p className="text-xs text-[#202124]">worldofailu.com{page.path === "/" ? "" : page.path}</p>
      <p className="mt-1 truncate text-lg text-[#1a0dab]">{page.title}{page.path === "/" ? "" : " | AILU"}</p>
      <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">{page.description}</p>
    </div>
  </section>;
}

// `sectionKey` is "hero" for English or "hero:kn" for a translation. `english` is given only for a translation.
export default function CmsEditor({ sectionKey, english, initial, defaults, media: startMedia, action, canPublish, canUndo, hasDraft }: { sectionKey: string; english?: Json | null; initial: Json; defaults: Json; media: MediaItem[]; action: (fd: FormData) => Promise<void>; canPublish: boolean; canUndo: boolean; hasDraft: boolean }) {
  const key = sectionKey.split(":")[0];
  const [value, setValue] = useState<Json>(initial);
  const [media, setMedia] = useState(startMedia);
  const button = "rounded-lg px-4 py-2 text-sm font-semibold";
  return <form action={action} className="mt-5">
    <input type="hidden" name="key" value={sectionKey} />
    <input type="hidden" name="value" value={JSON.stringify(value)} />
    {key === "seo" ? <GooglePreview value={value} /> : null}
    <div className="mt-5 rounded-2xl border border-white/10 bg-[#111114] p-5"><Field name={key} value={value} sample={defaults} onChange={setValue} media={media} setMedia={setMedia} section={key} english={english ?? undefined} /></div>
    <div className="sticky bottom-0 z-10 mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 bg-[#0b0b0d] py-3">
      <button name="intent" value="save" className={`${button} border border-ailu-yellow/60 text-ailu-yellow`}>Save draft</button>
      {canPublish ? <button name="intent" value="publish" className={`${button} bg-ailu-yellow text-ailu-black`}>Publish</button> : <span className="text-xs text-ailu-cream/55">An owner or manager will publish this.</span>}
      {hasDraft ? <button name="intent" value="discard" className="text-sm text-ailu-cream/60 underline">Discard draft</button> : null}
      {canPublish && canUndo ? <button name="intent" value="undo" className="text-sm text-ailu-cream/60 underline">Undo last publish</button> : null}
      {canPublish ? <span className="ml-auto"><ConfirmButton label="Restore original" message={english ? "Go back to the draft translation for this section? Your published changes in this language will be replaced." : "Go back to the original wording for this section? Your published changes will be replaced."} className="text-sm text-red-400 underline" name="intent" value="restore" /></span> : null}
    </div>
  </form>;
}
