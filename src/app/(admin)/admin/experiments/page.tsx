import Link from "next/link";
import { requireRolePage } from "@/lib/authz";
import { LANDING_TEST, compareVariants } from "@/lib/experiments";
import { LANDING_VARIANTS } from "@/content/landing";
import { formatIN } from "@/lib/format";
import { landingResults } from "@/server/experiments";

export const dynamic = "force-dynamic";

// Results of the landing page A/B test. How it works: docs/AB_TESTING.md.
export default async function ExperimentsPage() {
  await requireRolePage(["OWNER", "MANAGER"]);
  const { counts, recent, firstAt } = await landingResults();
  const verdict = compareVariants(counts.a, counts.b);
  const total = counts.a + counts.b;
  return <div className="mx-auto max-w-4xl">
    <h1 className="font-display text-2xl font-bold">Landing page test</h1>
    <p className="mt-1 text-sm text-ailu-cream/60">
      Test <code className="text-ailu-yellow">{LANDING_TEST.id}</code> on <Link href={LANDING_TEST.path} className="text-ailu-yellow hover:underline">{LANDING_TEST.path}</Link>.
      Visitors are split half and half, so the version with more enquiries is doing better.{firstAt ? ` First result ${formatIN(firstAt)}.` : ""}
    </p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      {(["a", "b"] as const).map((v) => {
        const share = total ? Math.round((counts[v] / total) * 100) : 0;
        return <section key={v} className={`rounded-2xl border p-5 ${verdict.leader === v ? "border-ailu-yellow/60 bg-ailu-yellow/[.06]" : "border-white/10 bg-[#111114]"}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-ailu-cream/50">Version {v.toUpperCase()} · {LANDING_VARIANTS[v].name}</p>
          <p className="mt-2 font-display text-lg font-semibold">{LANDING_VARIANTS[v].title} {LANDING_VARIANTS[v].em}</p>
          <p className="mt-1 text-sm text-ailu-cream/60">Button: “{LANDING_VARIANTS[v].cta}”</p>
          <p className="mt-4 font-display text-4xl font-bold">{counts[v]}</p>
          <p className="text-sm text-ailu-cream/60">enquiries · {share}% of the total</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-ailu-yellow" style={{ width: `${share}%` }} /></div>
          <Link href={`${LANDING_TEST.path}?v=${v}`} className="mt-4 inline-block text-sm text-ailu-yellow hover:underline">See version {v.toUpperCase()}</Link>
        </section>;
      })}
    </div>
    <p className={`mt-5 rounded-2xl border p-4 text-sm ${verdict.confident ? "border-ailu-yellow/60 text-ailu-yellow" : "border-white/10 text-ailu-cream/75"}`} role="status">{verdict.message}</p>
    {recent.length ? <section className="mt-6 rounded-2xl border border-white/10 bg-[#111114] p-5">
      <h2 className="font-display font-bold">Latest landing page enquiries</h2>
      <ul className="mt-3 divide-y divide-white/10 text-sm">{recent.map((row, i) => <li key={`${row.enquiryId}-${i}`} className="flex flex-wrap items-center gap-3 py-2">
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold">{row.variant.toUpperCase()}</span>
        {row.enquiryId ? <Link href={`/admin/inbox/${row.enquiryId}`} className="text-ailu-yellow hover:underline">{row.enquiryId}</Link> : <span className="text-ailu-cream/50">Deleted enquiry</span>}
        <span className="ml-auto text-xs text-ailu-cream/45">{formatIN(row.at)}</span>
      </li>)}</ul>
    </section> : null}
  </div>;
}
