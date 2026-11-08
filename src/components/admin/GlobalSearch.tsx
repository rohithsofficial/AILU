"use client";

// CRM search box in the top bar. Calls /api/admin/search as you type.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { SearchResults } from "@/server/search/global-search";

export default function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) { setResults(null); setLoading(false); return; }
    setResults(null);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(term)}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("Search unavailable");
        setResults(await response.json() as SearchResults);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setResults(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim().length >= 2) {
      setOpen(false);
      router.push(`/admin/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative min-w-0 flex-1 max-w-xl">
      <form onSubmit={submit} role="search">
        <label className="sr-only" htmlFor="admin-global-search">Search CRM</label>
        <input ref={inputRef} id="admin-global-search" value={query} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => window.setTimeout(() => setOpen(false), 150)} placeholder="Search records… (press /)" autoComplete="off" className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-ailu-cream placeholder:text-ailu-cream/40 focus:border-ailu-yellow/60 focus:outline-none" />
      </form>
      {open && query.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-white/15 bg-[#111114] p-2 shadow-2xl" role="region" aria-label="Search results">
          {loading && !results ? <p className="p-3 text-sm text-ailu-cream/60">Searching…</p> : null}
          {results?.groups.length === 0 && !loading ? <p className="p-3 text-sm text-ailu-cream/60">No matching records.</p> : null}
          {results?.groups.map((group) => <section key={group.key} className="py-1">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-ailu-cream/45"><span>{group.title}</span><Link href={group.href} onMouseDown={() => setOpen(false)} className="text-ailu-yellow hover:underline">See all</Link></div>
            {group.hits.length ? group.hits.map((hit) => <Link key={hit.id} href={hit.href} onMouseDown={() => setOpen(false)} className="block rounded-lg px-2 py-2 hover:bg-white/10"><span className="block truncate text-sm">{hit.label}</span><span className="block truncate text-xs text-ailu-cream/50">{hit.detail}</span></Link>) : <p className="px-2 py-1 text-xs text-ailu-cream/40">No matches</p>}
          </section>)}
          <p className="border-t border-white/10 px-2 pt-2 text-xs text-ailu-cream/40">Press Enter to open all matching groups · Esc to close</p>
        </div>
      ) : null}
    </div>
  );
}
