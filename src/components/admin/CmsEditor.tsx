"use client";

// CMS editor form. It is built from the shape of the default content, so new keys appear automatically.
// Each part of a section gets its own box with a plain heading. Photos use the photo picker.
// With `english` set it edits a translation: text fields only, each with the English line under it.
// Links, photos, switches and list order stay English (src/lib/i18n.ts overlayTranslation).
import { useEffect, useRef, useState } from "react";
import { fieldLimit, humanise, isFixedKey, isFixedList, isImageKey, listTemplate, type Json } from "@/lib/cms";
import { ConfirmButton } from "@/components/admin/RecordControls";
import MediaPicker from "@/components/admin/MediaPicker";
import type { MediaItem } from "@/components/admin/MediaUpload";
import { isSharedKey } from "@/lib/i18n";

const input = "mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-ailu-cream";
const small = "rounded-lg border border-white/20 px-2.5 py-1 text-xs text-ailu-cream/80 hover:border-ailu-yellow disabled:opacity-30";
type Change = (value: Json) => void;

function Counter({ value, limit }: { value: string; limit: number }) {
  const over = limit > 0 && value.length > limit;
  return <span className={`ml-auto shrink-0 text-xs tabular-nums ${over ? "text-red-400" : "text-ailu-cream/45"}`}>{limit ? `${value.length}/${limit}` : `${value.length} characters`}{over ? " · a bit long" : ""}</span>;
}

type FieldProps = { name: string; value: Json; sample: Json | undefined; onChange: Change; media: MediaItem[]; setMedia: (items: MediaItem[]) => void; section: string; english?: Json };

// What a translation keeps from English: switches, links, photos and fixed keys are not edited per language.
const hiddenInTranslation = (name: string, value: Json) => typeof value === "boolean" || (typeof value === "string" && (isFixedKey(name) || isSharedKey(name) || isImageKey(name)));

function Field({ name, value, sample, onChange, media, setMedia, section, english }: FieldProps) {
  const label = humanise(name);
  const translating = english !== undefined;
  if (translating && hiddenInTranslation(name, value)) return null;
  if (typeof value === "boolean") return <label className="flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} /> {label}</label>;
  if (typeof value === "string") {
    if (isFixedKey(name)) return value ? <p className="text-xs text-ailu-cream/50">{label}: <code>{value}</code></p> : null;
    if (isImageKey(name)) return <MediaPicker label={label} value={value} onChange={onChange} media={media} setMedia={setMedia} />;
    const long = value.length > 70 || /(text|body|copy|lead|answer|blurb|description|paragraphs)$/i.test(name);
    return <label className="block text-sm">
      <span className="flex items-baseline gap-3"><span>{label}</span><Counter value={value} limit={fieldLimit(section, name)} /></span>
      {long ? <textarea value={value} rows={Math.min(10, Math.max(2, Math.ceil(value.length / 80)))} onChange={(event) => onChange(event.target.value)} className={`${input} resize-y`} /> : <input value={value} onChange={(event) => onChange(event.target.value)} className={input} />}
      {translating && typeof english === "string" ? <span lang="en" className="mt-1 block text-xs text-ailu-cream/45">English: {english}</span> : null}
    </label>;
  }
  if (Array.isArray(value)) {
    const base = Array.isArray(sample) ? sample : [];
    const fixed = translating || isFixedList(base);
    const englishItems = Array.isArray(english) ? english : [];
    const one = label.replace(/s$/, "").toLowerCase();
    const move = (from: number, to: number) => { const next = [...value]; const [item] = next.splice(from, 1); next.splice(to, 0, item); onChange(next); };
    const summary = (item: Json, index: number) => {
      if (typeof item === "string") return item || `Item ${index + 1}`;
      const fields = item as Record<string, Json>;
      return String(fields.path || fields.title || fields.question || fields.label || fields.alt || `Item ${index + 1}`);
    };
    return <fieldset className="rounded-xl border border-white/10 p-3">
      <legend className="px-1 text-sm font-semibold">{label} <span className="font-normal text-ailu-cream/50">({value.length})</span></legend>
      <ol className="space-y-2">
        {value.map((item, index) => {
          const controls = !fixed && <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className={small} disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`Move ${one} ${index + 1} up`}>↑ Up</button>
            <button type="button" className={small} disabled={index === value.length - 1} onClick={() => move(index, index + 1)} aria-label={`Move ${one} ${index + 1} down`}>↓ Down</button>
            <button type="button" className={`${small} text-red-400`} onClick={() => onChange(value.filter((_, i) => i !== index))}>Remove</button>
          </div>;
          const child = <Field name={typeof item === "string" ? `${name.replace(/s$/, "")} ${index + 1}` : name} value={item} sample={base[0] ?? listTemplate(name, base)} onChange={(next) => onChange(value.map((old, i) => i === index ? next : old))} media={media} setMedia={setMedia} section={section} english={translating ? englishItems[index] ?? "" : undefined} />;
          if (typeof item === "string") return <li key={index} className="rounded-lg bg-white/[0.03] p-2">{child}{controls}</li>;
          return <li key={index}><details className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <summary className="cursor-pointer text-sm font-medium"><span className="mr-2 text-ailu-cream/45">{index + 1}.</span>{summary(item, index)}</summary>
            <div className="mt-3">{child}{controls}</div>
          </details></li>;
        })}
      </ol>
      {!fixed ? <button type="button" className="mt-3 rounded-lg border border-dashed border-white/30 px-3 py-2 text-sm text-ailu-cream/80 hover:border-ailu-yellow hover:text-ailu-yellow" onClick={() => onChange([...value, listTemplate(name, base)])}>+ Add {one}</button> : null}
    </fieldset>;
  }
  const baseFields = (sample ?? {}) as Record<string, Json>;
  const englishFields = (english ?? {}) as Record<string, Json>;
  return <div className="space-y-4">{Object.entries(value).map(([key, item]) => <Field key={key} name={key} value={item} sample={baseFields[key]} onChange={(next) => onChange({ ...value, [key]: next })} media={media} setMedia={setMedia} section={section} english={translating ? englishFields[key] ?? "" : undefined} />)}</div>;
}

/**
 * Splits a section into boxes: the simple fields together under "Main text", then one box for each list or group,
 * in the same order as the website. A section that is a single list gets one box.
 */
function boxesFor(value: Json): { title: string; keys: string[] }[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return [{ title: "", keys: [] }];
  const boxes: { title: string; keys: string[] }[] = [];
  for (const [key, item] of Object.entries(value)) {
    const simple = typeof item === "string" || typeof item === "boolean";
    const last = boxes[boxes.length - 1];
    if (simple && last && last.title === "Main text") last.keys.push(key);
    else boxes.push(simple ? { title: "Main text", keys: [key] } : { title: humanise(key), keys: [key] });
  }
  return boxes;
}

function GooglePreview({ value }: { value: Json }) {
  const pages = (value as { pages?: { path: string; title: string; description: string }[] }).pages ?? [];
  const [path, setPath] = useState(pages[0]?.path ?? "/");
  const page = pages.find((item) => item.path === path);
  if (!page) return null;
  return <section className="mt-5 rounded-2xl border border-white/10 bg-[#111114] p-5">
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
// `canPreview` shows "Save and preview" when the section belongs to one page.
export default function CmsEditor({ sectionKey, english, initial, defaults, media: startMedia, action, canPublish, canUndo, hasDraft, canPreview = false }: { sectionKey: string; english?: Json | null; initial: Json; defaults: Json; media: MediaItem[]; action: (fd: FormData) => Promise<void>; canPublish: boolean; canUndo: boolean; hasDraft: boolean; canPreview?: boolean }) {
  const key = sectionKey.split(":")[0];
  const [value, setValue] = useState<Json>(initial);
  const [media, setMedia] = useState(startMedia);
  const saved = useRef(JSON.stringify(initial));
  const submitting = useRef(false);
  const changed = JSON.stringify(value) !== saved.current;
  // Warn before leaving the page with changes that are not saved.
  useEffect(() => {
    if (!changed) return;
    const warn = (event: BeforeUnloadEvent) => { if (!submitting.current) event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changed]);
  const button = "rounded-lg px-4 py-2 text-sm font-semibold";
  const translating = english != null;
  const record = (typeof value === "object" && !Array.isArray(value) ? value : {}) as Record<string, Json>;
  const sample = (typeof defaults === "object" && !Array.isArray(defaults) ? defaults : {}) as Record<string, Json>;
  const englishFields = (english ?? {}) as Record<string, Json>;
  const boxes = boxesFor(value).filter((box) => !translating || box.keys.some((name) => !hiddenInTranslation(name, record[name])));
  return <form action={action} onSubmit={() => { submitting.current = true; }} className="mt-5">
    <input type="hidden" name="key" value={sectionKey} />
    <input type="hidden" name="value" value={JSON.stringify(value)} />
    {key === "seo" ? <GooglePreview value={value} /> : null}
    <div className="mt-5 space-y-4">
      {boxes.map((box) => <section key={box.title + box.keys[0]} className="rounded-2xl border border-white/10 bg-[#111114] p-5">
        {box.title && boxes.length > 1 ? <h2 className="mb-4 font-display text-lg font-bold text-ailu-yellow">{box.title}</h2> : null}
        {box.keys.length
          ? <div className="space-y-4">{box.keys.map((name) => <Field key={name} name={name} value={record[name]} sample={sample[name]} onChange={(next) => setValue({ ...record, [name]: next })} media={media} setMedia={setMedia} section={key} english={translating ? englishFields[name] ?? "" : undefined} />)}</div>
          : <Field name={key} value={value} sample={defaults} onChange={setValue} media={media} setMedia={setMedia} section={key} english={english ?? undefined} />}
      </section>)}
    </div>
    <div className="sticky bottom-0 z-10 mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 bg-[#0b0b0d] py-3">
      <button name="intent" value="save" className={`${button} border border-ailu-yellow/60 text-ailu-yellow`}>Save draft</button>
      {canPreview ? <button name="intent" value="preview" className={`${button} border border-white/25 text-ailu-cream hover:border-ailu-yellow`}>Save and preview</button> : null}
      {canPublish ? <ConfirmButton label="Publish" message="Publish these changes? Visitors will see them straight away." className={`${button} bg-ailu-yellow text-ailu-black`} name="intent" value="publish" /> : <span className="text-xs text-ailu-cream/55">An owner or manager will publish this.</span>}
      {changed ? <span role="status" className="text-xs font-semibold text-amber-300">Unsaved changes</span> : null}
      {hasDraft ? <button name="intent" value="discard" className="text-sm text-ailu-cream/60 underline">Discard draft</button> : null}
      {canPublish && canUndo ? <button name="intent" value="undo" className="text-sm text-ailu-cream/60 underline">Undo last publish</button> : null}
      {canPublish ? <span className="ml-auto"><ConfirmButton label="Restore original" message={english ? "Go back to the draft translation for this section? Your published changes in this language will be replaced." : "Go back to the original wording for this section? Your published changes will be replaced."} className="text-sm text-red-400 underline" name="intent" value="restore" /></span> : null}
    </div>
  </form>;
}
