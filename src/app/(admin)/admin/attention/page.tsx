import Link from "next/link";
import { requireRolePage, STAFF_ROLES } from "@/lib/authz";
import { formatIN, formatRelative } from "@/lib/format";
import { attentionData } from "@/server/dashboard";

export const dynamic = "force-dynamic";

export default async function AttentionPage() {
  const staff = await requireRolePage(STAFF_ROLES);
  const rows = await attentionData(staff, 1000);
  const groups = [...new Set(rows.map((row) => row.rule))];
  return <div className="mx-auto max-w-5xl">
    <h1 className="font-display text-2xl font-bold">Needs attention</h1>
    <p className="mt-1 text-sm text-ailu-cream/60">Follow-ups selected by the A4 age and event-preparation rules.</p>
    {!rows.length ? <p className="mt-6 rounded-2xl border border-white/10 bg-[#111114] p-8 text-center text-sm text-ailu-cream/55">Nothing needs attention right now.</p> : <div className="mt-5 space-y-5">{groups.map((group) => <section key={group} className="rounded-2xl border border-white/10 bg-[#111114] p-5"><h2 className="font-display font-bold">{group}</h2><ul className="mt-3 divide-y divide-white/10">{rows.filter((row) => row.rule === group).map((row) => <li key={`${row.rule}:${row.recordId}`} className="flex flex-wrap items-center gap-3 py-3"><div className="min-w-48 flex-1"><Link href={row.href} className="font-medium text-ailu-yellow hover:underline">{row.label}</Link><p className="mt-1 text-xs text-ailu-cream/60">{row.message} · {row.recordId}</p></div><span className="text-xs text-ailu-cream/45" title={formatIN(row.at)}>{formatRelative(row.at)}</span></li>)}</ul></section>)}</div>}
  </div>;
}
