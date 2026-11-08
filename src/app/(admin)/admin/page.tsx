// CRM dashboard (/admin): today's tasks and events, new enquiries, the pipeline, needs attention and money widgets.
// The data and every role limit come from src/server/dashboard/index.ts.
import Link from "next/link";
import { requireRolePage, STAFF_ROLES, can } from "@/lib/authz";
import { EVENT_STATUS_LABELS, type EventStatusValue } from "@/lib/eventStatus";
import { formatIN, formatINR, formatRelative, humanize } from "@/lib/format";
import { dashboardData } from "@/server/dashboard";

export const dynamic = "force-dynamic";

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-sm text-ailu-cream/45">{children}</p>;
}

function EventRows({ rows }: { rows: { id: string; title: string; status: string; startDate: Date | null; venueCity?: string | null }[] }) {
  return rows.length ? <ul className="mt-3 divide-y divide-white/10">{rows.map((event) => <li key={event.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><Link href={"/admin/events/" + event.id} className="text-ailu-yellow hover:underline">{event.title}</Link><span className="text-xs text-ailu-cream/55">{event.startDate ? formatIN(event.startDate) : "Date not set"}{event.venueCity ? " · " + event.venueCity : ""} · {EVENT_STATUS_LABELS[event.status as EventStatusValue]}</span></li>)}</ul> : <Empty>No events in this period.</Empty>;
}

export default async function AdminDashboard() {
  const staff = await requireRolePage(STAFF_ROLES);
  const data = await dashboardData(staff);
  const isStaff = staff.role === "STAFF";
  const summaryCards = [
    ...(can(staff.role, "inbox.read") ? [{ label: "New enquiries", value: data.newEnquiries.count, detail: "Unconverted, non-spam", href: "/admin/inbox?conversion=unconverted" }] : []),
    { label: "Upcoming events", value: data.upcoming.count, detail: "Next 30 days", href: data.upcoming.href },
    { label: "My overdue tasks", value: data.today.overdueMineCount, detail: "Open tasks assigned to you", href: "/admin/tasks?view=my" },
    ...(data.counts.applications !== null ? [{ label: "Applications to review", value: data.counts.applications, detail: "Submitted applications", href: "/admin/applications?status=SUBMITTED" }] : []),
    ...(data.counts.partners !== null ? [{ label: "Partners awaiting review", value: data.counts.partners, detail: "Registration pending", href: "/admin/partners?status=PENDING" }] : []),
    ...(data.counts.commissionsPending !== null ? [{ label: "Commissions to approve", value: data.counts.commissionsPending, detail: "Owner approval required", href: "/admin/commissions?status=PENDING_APPROVAL" }] : []),
    ...(data.counts.commissionsPayable !== null ? [{ label: "Approved commissions to pay", value: data.counts.commissionsPayable, detail: "Payment not recorded", href: "/admin/commissions?status=APPROVED" }] : []),
    ...(data.counts.dreams !== null ? [{ label: "Dreams waiting for review", value: data.counts.dreams, detail: "Private submissions", href: "/admin/dreams?status=SUBMITTED" }] : []),
  ];
  const attentionGroups = [...new Set(data.attention.map((item) => item.rule))];
  return <div className="mx-auto max-w-7xl">
    <div><h1 className="font-display text-2xl font-bold">Hello, {staff.name || staff.email}</h1><p className="mt-1 text-sm text-ailu-cream/60">{isStaff ? "Your assigned CRM work." : "Current CRM activity."} Dashboard data follows your role permissions.</p></div>

    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{summaryCards.map((card) => <Link key={card.label} href={card.href} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-ailu-yellow/40"><div className="font-display text-3xl font-extrabold text-ailu-yellow">{card.value}</div><div className="mt-1 text-sm font-semibold">{card.label}</div><div className="mt-0.5 text-xs text-ailu-cream/50">{card.detail}</div></Link>)}</div>

    <section className="mt-5 rounded-2xl border border-white/10 bg-[#111114] p-5"><h2 className="font-display text-lg font-bold">Today</h2><div className="mt-4 grid gap-5 lg:grid-cols-3">
      <div><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Tasks due today or overdue</h3><Link href="/admin/tasks?view=due" className="text-xs text-ailu-yellow hover:underline">View due tasks</Link></div>{data.today.tasks.length ? <ul className="mt-2 space-y-2">{data.today.tasks.map((task) => <li key={task.id} className="rounded-lg border border-white/10 px-3 py-2"><p className="text-sm">{task.title}</p><p className="mt-1 text-xs text-ailu-cream/45">{task.dueAt ? formatRelative(task.dueAt) : "No due date"}</p></li>)}</ul> : <Empty>No tasks due today or overdue.</Empty>}</div>
      <div><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Events starting in 7 days</h3><Link href={data.today.eventsHref} className="text-xs text-ailu-yellow hover:underline">See all</Link></div><EventRows rows={data.today.events} /></div>
      {can(staff.role, "inbox.read") ? <div><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Unassigned enquiries</h3><Link href={data.today.unassignedHref} className="text-xs text-ailu-yellow hover:underline">See all</Link></div>{data.today.unassignedEnquiries.length ? <ul className="mt-2 space-y-2">{data.today.unassignedEnquiries.map((enquiry) => <li key={enquiry.id} className="rounded-lg border border-white/10 px-3 py-2"><Link href={"/admin/inbox/" + enquiry.id} className="text-sm text-ailu-yellow hover:underline">{enquiry.name}</Link><p className="mt-1 text-xs text-ailu-cream/45">{enquiry.id} · {humanize(enquiry.category)} · {formatRelative(enquiry.createdAt)}</p></li>)}</ul> : <Empty>No unassigned enquiries.</Empty>}</div> : null}
    </div></section>

    <div className="mt-5 grid gap-5 xl:grid-cols-2">
      <section className="rounded-2xl border border-white/10 bg-[#111114] p-5"><div className="flex items-center justify-between"><h2 className="font-display text-lg font-bold">New enquiries</h2><Link href="/admin/inbox?conversion=unconverted" className="text-xs text-ailu-yellow hover:underline">Open inbox · {data.newEnquiries.count}</Link></div>{data.newEnquiries.rows.length ? <ul className="mt-3 divide-y divide-white/10">{data.newEnquiries.rows.map((row) => <li key={row.id} className="flex items-center justify-between gap-3 py-3"><div><Link href={"/admin/inbox/" + row.id} className="text-sm text-ailu-yellow hover:underline">{row.name}</Link><p className="mt-1 text-xs text-ailu-cream/45">{row.id} · {humanize(row.category)}</p></div><span className="text-right text-xs text-ailu-cream/50">{formatRelative(row.createdAt)}<br />{formatIN(row.createdAt)}</span></li>)}</ul> : <Empty>No unconverted non-spam enquiries.</Empty>}</section>
      <section className="rounded-2xl border border-white/10 bg-[#111114] p-5"><h2 className="font-display text-lg font-bold">Events by pipeline stage</h2><ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{data.pipeline.map((stage) => <li key={stage.status}><Link href={"/admin/events?status=" + stage.status} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 hover:border-ailu-yellow/40"><span className="text-xs text-ailu-cream/65">{EVENT_STATUS_LABELS[stage.status]}</span><strong className="ml-2 text-ailu-yellow">{stage.count}</strong></Link></li>)}</ul></section>
    </div>

    <section className="mt-5 rounded-2xl border border-white/10 bg-[#111114] p-5"><div className="flex items-center justify-between"><h2 className="font-display text-lg font-bold">Upcoming events</h2><Link href={data.upcoming.href} className="text-xs text-ailu-yellow hover:underline">See all in next 30 days</Link></div><p className="mt-1 text-xs text-ailu-cream/45">Next 30 days · {data.upcoming.count} total</p><EventRows rows={data.upcoming.rows} /></section>

    <section className="mt-5 rounded-2xl border border-white/10 bg-[#111114] p-5"><div className="flex items-center justify-between"><h2 className="font-display text-lg font-bold">Needs attention</h2><Link href="/admin/attention" className="text-xs text-ailu-yellow hover:underline">Show all</Link></div>{!data.attention.length ? <Empty>Nothing needs attention right now.</Empty> : <div className="mt-3 grid gap-4 lg:grid-cols-2">{attentionGroups.map((group) => <div key={group} className="rounded-xl border border-white/10 p-4"><h3 className="text-sm font-semibold">{group}</h3><ul className="mt-2 space-y-2">{data.attention.filter((item) => item.rule === group).map((item) => <li key={item.rule + ":" + item.recordId}><Link href={item.href} className="text-sm text-ailu-yellow hover:underline">{item.label}</Link><p className="text-xs text-ailu-cream/50">{item.message} · {formatRelative(item.at)}</p></li>)}</ul></div>)}</div>}</section>

    {data.money ? <section className="mt-5 rounded-2xl border border-white/10 bg-[#111114] p-5"><h2 className="font-display text-lg font-bold">Finance overview</h2><p className="mt-1 text-xs text-ailu-cream/45">Operational tracking in INR; margin is an estimate, not an accounting statement.</p><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MoneyWidget title="Client balances due" total={data.money.clientBalances.totalPaise} href="/admin/finance?type=client" rows={data.money.clientBalances.rows.slice(0, 8).map((row) => ({ id: row.id, eventId: row.id, title: row.title, duePaise: row.duePaise, startDate: row.startDate, warning: row.withinSevenDays ? "Event within 7 days" : null }))} empty="No client balances due." />
      <MoneyWidget title="Vendor payments due" total={data.money.vendorPayments.totalPaise} href="/admin/finance?type=vendor" rows={data.money.vendorPayments.rows.slice(0, 8).map((row) => ({ ...row, warning: null }))} empty="No vendor payments due for near or completed events." />
      <MoneyWidget title="Team fees due" total={data.money.teamFees.totalPaise} href="/admin/finance?type=team" rows={data.money.teamFees.rows.slice(0, 8).map((row) => ({ ...row, warning: null }))} empty="No recorded team fees due for near or completed events." />
      <div className="rounded-xl border border-white/10 p-4"><h3 className="text-sm font-semibold">Estimated margin this month</h3><p className="mt-2 font-display text-2xl font-bold text-ailu-yellow">{formatINR(data.money.monthMarginPaise)}</p><p className="mt-1 text-xs text-ailu-cream/45">Completed events with accepted quotes dated this month</p><Link href={"/admin/events?status=COMPLETED&dateFrom=" + data.money.monthDateFrom + "&dateTo=" + data.money.monthDateTo} className="mt-3 inline-block text-xs text-ailu-yellow hover:underline">Completed events this month</Link></div>
    </div></section> : null}

    {staff.role === "OWNER" ? <div className="mt-5 flex flex-wrap gap-3 text-sm"><Link href="/admin/settings/staff" className="rounded-full border border-ailu-yellow/60 px-4 py-2 font-semibold text-ailu-yellow hover:bg-ailu-yellow/10">Manage staff</Link><Link href="/admin/settings/audit" className="rounded-full border border-white/20 px-4 py-2 hover:bg-white/10">Audit log</Link></div> : null}
    <p className="mt-6 rounded-xl border border-white/10 bg-[#111114] p-4 text-xs text-ailu-cream/50">An enquiry is not a booking. Event confirmation requires availability, agreed scope and terms, and payment.</p>
  </div>;
}

function MoneyWidget({ title, total, href, rows, empty }: { title: string; total: number; href: string; rows: { id: string; eventId: string; title: string; resourceName?: string; duePaise: number; startDate: Date | null; warning: string | null }[]; empty: string }) {
  return <div className="rounded-xl border border-white/10 p-4"><div className="flex items-start justify-between gap-2"><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 font-display text-xl font-bold text-ailu-yellow">{formatINR(total)}</p></div><Link href={href} className="text-xs text-ailu-yellow hover:underline">View due</Link></div>{rows.length ? <ul className="mt-2 space-y-2">{rows.map((row) => <li key={row.id} className="border-t border-white/10 pt-2 text-xs"><Link href={"/admin/events/" + row.eventId} className="text-ailu-yellow hover:underline">{row.title}</Link><span className="ml-2">{formatINR(row.duePaise)}</span>{row.resourceName ? <span className="block text-ailu-cream/60">{row.resourceName}</span> : null}{row.startDate ? <span className="block text-ailu-cream/45">{formatIN(row.startDate)}{row.warning ? <strong className="ml-2 text-ailu-yellow">{row.warning}</strong> : null}</span> : null}</li>)}</ul> : <Empty>{empty}</Empty>}</div>;
}
