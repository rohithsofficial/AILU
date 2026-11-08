// CRM: full results for the search box in the top bar. Results are limited by role (src/server/search).
import Link from "next/link";
import { requireRolePage, STAFF_ROLES } from "@/lib/authz";
import { globalSearch } from "@/server/search/global-search";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const staff = await requireRolePage(STAFF_ROLES);
  const query = (searchParams.q ?? "").trim().slice(0, 100);
  const results = await globalSearch(staff, query);
  return <div className="mx-auto max-w-5xl">
    <h1 className="font-display text-2xl font-bold">Search the CRM</h1>
    <p className="mt-1 text-sm text-ailu-cream/60">Results for “{results.query}” · matching groups show up to five records.</p>
    {query.length < 2 ? <p className="mt-6 rounded-2xl border border-white/10 bg-[#111114] p-6 text-sm text-ailu-cream/55">Enter at least two characters to search.</p> : results.groups.length === 0 ? <p className="mt-6 rounded-2xl border border-white/10 bg-[#111114] p-6 text-sm text-ailu-cream/55">No matching records.</p> : <div className="mt-5 grid gap-4 md:grid-cols-2">
      {results.groups.map((group) => <section key={group.key} className="rounded-2xl border border-white/10 bg-[#111114] p-5">
        <div className="flex items-center justify-between"><h2 className="font-display font-bold">{group.title}</h2><Link href={group.href} className="text-xs text-ailu-yellow hover:underline">See all</Link></div>
        {group.hits.length ? <ul className="mt-3 divide-y divide-white/10">{group.hits.map((hit) => <li key={hit.id}><Link href={hit.href} className="block py-3 hover:text-ailu-yellow"><span className="block text-sm font-medium">{hit.label}</span><span className="mt-1 block text-xs text-ailu-cream/50">{hit.detail}</span></Link></li>)}</ul> : <p className="mt-3 text-sm text-ailu-cream/45">No matches in this group.</p>}
      </section>)}
    </div>}
  </div>;
}
