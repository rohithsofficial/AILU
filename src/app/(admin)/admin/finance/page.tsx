import Link from "next/link";
import { requireRolePage } from "@/lib/authz";
import { formatIN, formatINR } from "@/lib/format";
import { financeDashboardData } from "@/server/dashboard";

export const dynamic = "force-dynamic";
type Kind = "client" | "vendor" | "team";

export default async function FinanceDuePage({ searchParams }: { searchParams: { type?: string } }) {
  const staff = await requireRolePage(["OWNER", "MANAGER", "ACCOUNTS"]);
  const data = await financeDashboardData(staff);
  if (!data) return null;
  const kind: Kind = ["client", "vendor", "team"].includes(searchParams.type ?? "") ? searchParams.type as Kind : "client";
  const title = kind === "client" ? "Client balances due" : kind === "vendor" ? "Vendor payments due" : "Team fees due";
  const rows = kind === "client" ? data.clientBalances.rows : kind === "vendor" ? data.vendorPayments.rows : data.teamFees.rows;
  const total = kind === "client" ? data.clientBalances.totalPaise : kind === "vendor" ? data.vendorPayments.totalPaise : data.teamFees.totalPaise;
  return <div className="mx-auto max-w-5xl">
    <h1 className="font-display text-2xl font-bold">Finance due</h1>
    <p className="mt-1 text-sm text-ailu-cream/60">Operational payment tracking. Totals use recorded client receipts, vendor payments, and team fee payments.</p>
    <nav aria-label="Finance due type" className="mt-4 flex flex-wrap gap-2 text-sm">{([["client", "Client balances"], ["vendor", "Vendor payments"], ["team", "Team fees"]] as const).map(([value, label]) => <Link key={value} href={"/admin/finance?type=" + value} aria-current={kind === value ? "page" : undefined} className={"rounded-full border px-4 py-2 " + (kind === value ? "border-ailu-yellow text-ailu-yellow" : "border-white/15 text-ailu-cream/65")}>{label}</Link>)}</nav>
    <section className="mt-5 rounded-2xl border border-white/10 bg-[#111114] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-display text-lg font-bold">{title}</h2><p className="font-display text-xl font-bold text-ailu-yellow">{formatINR(total)} total due</p></div>
      {rows.length ? <ul className="mt-3 divide-y divide-white/10">{rows.map((row) => { const eventId = kind === "client" ? row.id : "eventId" in row ? row.eventId : row.id; return <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><div><Link href={"/admin/events/" + eventId} className="font-medium text-ailu-yellow hover:underline">{row.title}</Link>{"resourceName" in row && row.resourceName ? <p className="mt-1 text-xs text-ailu-cream/60">{row.resourceName}</p> : null}<p className="mt-1 text-xs text-ailu-cream/45">{row.startDate ? formatIN(row.startDate) : "Event date not set"}{kind === "client" && "withinSevenDays" in row && row.withinSevenDays ? <strong className="ml-2 text-ailu-yellow">Event within 7 days</strong> : null}</p></div><strong>{formatINR(row.duePaise)} due</strong></li>; })}</ul> : <p className="mt-4 rounded-xl border border-white/10 p-5 text-sm text-ailu-cream/50">No {kind === "client" ? "client balances" : kind === "vendor" ? "vendor payments" : "recorded team fees"} due in this view.</p>}
    </section>
  </div>;
}
