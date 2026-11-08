// CRM: partner reward (commission) proposals: approve, reject and mark paid. Owner, manager and accounts.
import Link from "next/link";
import { requireRolePage, can } from "@/lib/authz";
import { getPrisma } from "@/lib/db";
import { formatIN, formatINR } from "@/lib/format";
import { listCommissions } from "@/server/partners";
import { decideCommissionAction, payCommissionAction } from "../partners/actions";

export const dynamic = "force-dynamic";
const statuses = ["PENDING_APPROVAL", "APPROVED", "PAID", "REJECTED"];
const input = "rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-ailu-cream";
export default async function CommissionsPage({ searchParams }: { searchParams: { status?: string; partnerId?: string; page?: string; msg?: string } }) {
  const staff = await requireRolePage(["OWNER", "MANAGER", "ACCOUNTS"]);
  if (!can(staff.role, "commissions.read")) return <p>You do not have access to commissions.</p>;
  const [data, partners] = await Promise.all([
    listCommissions({ ...searchParams, page: Number(searchParams.page ?? 1) || 1 }),
    getPrisma().salesPartner.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const query = new URLSearchParams({ ...(searchParams.status ? { status: searchParams.status } : {}), ...(searchParams.partnerId ? { partnerId: searchParams.partnerId } : {}) });
  const pageHref = (page: number) => { const next = new URLSearchParams(query); next.set("page", String(page)); return `/admin/commissions?${next}`; };
  return <div className="mx-auto max-w-6xl"><h1 className="font-display text-2xl font-bold">Partner commissions</h1><p className="mt-1 text-sm text-ailu-cream/60">Manually proposed rewards; no automatic rate or earnings promise is configured.</p>
    {searchParams.msg ? <p role="status" className="mt-4 rounded-lg border border-ailu-yellow/30 bg-ailu-yellow/10 p-3 text-sm">{searchParams.msg}</p> : null}
    <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{data.totals.map((row)=><div key={row.status} className="rounded-xl border border-white/10 bg-[#111114] p-3"><div className="text-xs text-ailu-cream/50">{row.status.replaceAll("_"," ")} · {row._count._all}</div><div className="mt-1 font-semibold">{formatINR(row._sum.amountPaise ?? 0)}</div></div>)}</div>
    <form action="/admin/commissions" className="mt-5 flex flex-wrap gap-2"><select name="status" defaultValue={searchParams.status ?? ""} className={input}><option value="" className="text-black">All statuses</option>{statuses.map((status)=><option key={status} className="text-black">{status}</option>)}</select><select name="partnerId" defaultValue={searchParams.partnerId ?? ""} className={input}><option value="" className="text-black">All partners</option>{partners.map((partner)=><option key={partner.id} value={partner.id} className="text-black">{partner.name} · {partner.id}</option>)}</select><button className="rounded-lg border border-white/20 px-4 py-2 text-sm">Filter</button></form>
    {data.rows.length ? <div className="mt-5 space-y-3">{data.rows.map((commission)=><article key={commission.id} className="rounded-2xl border border-white/10 bg-[#111114] p-4"><div className="flex flex-wrap items-start gap-3"><div className="min-w-48 flex-1"><Link href={`/admin/partners/${commission.partner.id}`} className="text-ailu-yellow underline">{commission.partner.name} · {commission.partner.id}</Link><div className="mt-1"><Link href={`/admin/events/${commission.event.id}#referral`} className="text-sm hover:underline">{commission.event.title} · {commission.event.id}</Link></div><p className="mt-2 text-xs text-ailu-cream/60">Version {commission.version} · {commission.status.replaceAll("_"," ")} · proposed {formatIN(commission.createdAt)}</p><p className="mt-2 text-sm">{commission.basis}</p></div><div className="text-lg font-bold">{formatINR(commission.amountPaise)}</div></div>
        {staff.role === "OWNER" && commission.status === "PENDING_APPROVAL" ? <form action={decideCommissionAction} className="mt-3 flex flex-wrap items-end gap-2 border-t border-white/10 pt-3"><input type="hidden" name="id" value={commission.id}/><label className="min-w-56 flex-1 text-xs">Rejection reason (required to reject)<input name="reason" maxLength={500} className={`${input} mt-1 w-full`}/></label><button name="status" value="APPROVED" className="rounded-lg bg-ailu-yellow px-3 py-2 text-sm font-semibold text-ailu-black">Approve</button><button name="status" value="REJECTED" className="rounded-lg border border-white/20 px-3 py-2 text-sm">Reject</button></form> : null}
        {can(staff.role,"commissions.mark_paid") && commission.status === "APPROVED" ? <form action={payCommissionAction} className="mt-3 grid gap-2 border-t border-white/10 pt-3 sm:grid-cols-4"><input type="hidden" name="id" value={commission.id}/><label className="text-xs">Paid on<input required type="date" name="paidOn" defaultValue={new Date().toISOString().slice(0,10)} className={`${input} mt-1 w-full`}/></label><label className="text-xs">Payment mode<select name="paymentMode" className={`${input} mt-1 w-full`}>{["CASH","UPI","BANK_TRANSFER","CARD","CHEQUE","OTHER"].map((mode)=><option key={mode} className="text-black">{mode}</option>)}</select></label><label className="text-xs">UPI/cheque reference<input name="paymentReference" maxLength={120} className={`${input} mt-1 w-full`}/></label><button className="self-end rounded-lg border border-ailu-yellow/60 px-3 py-2 text-sm font-semibold text-ailu-yellow">Mark paid</button></form> : null}
      </article>)}</div> : <p className="mt-6 rounded-2xl border border-white/10 p-8 text-center text-sm text-ailu-cream/50">No commissions match these filters.</p>}
    <div className="mt-4 flex justify-between text-sm text-ailu-cream/60"><span>{data.total} total · page {data.page} of {data.pages}</span><div className="flex gap-4">{data.page > 1 ? <Link href={pageHref(data.page-1)} className="underline">← previous</Link> : null}{data.page < data.pages ? <Link href={pageHref(data.page+1)} className="underline">next →</Link> : null}</div></div>
  </div>;
}
