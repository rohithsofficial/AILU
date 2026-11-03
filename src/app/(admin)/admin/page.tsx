import Link from "next/link";
import { requireRolePage } from "@/lib/authz";
import { getPrisma } from "@/lib/db";
import { STAFF_ROLES } from "@/lib/authz";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const staff = await requireRolePage(STAFF_ROLES);
  const db = getPrisma();

  const [enquiriesCount, pendingEnquiries, applicationsCount, partnersCount, partnersPending] = await Promise.all([
    db.eventEnquiry.count(),
    db.eventEnquiry.count({ where: { status: "SUBMITTED" } }),
    db.application.count(),
    db.salesPartner.count(),
    db.salesPartner.count({ where: { status: "PENDING" } }),
  ]);

  const cards = [
    { label: "Event enquiries", total: enquiriesCount, note: `${pendingEnquiries} new / submitted`, href: "/admin/inbox" },
    { label: "Applications", total: applicationsCount, note: "Team applications to review", href: "/admin/team" },
    { label: "Sales partners", total: partnersCount, note: `${partnersPending} awaiting approval`, href: "/admin/partners" },
    { label: "Events", total: "—", note: "CRM module (phase A1)", href: "/admin" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-bold">Hello, {staff.name || staff.email}</h1>
      <p className="mt-1 text-sm text-ailu-cream/60">Phase A0 — the CRM modules land one by one.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const inner = (
            <>
              <div className="font-display text-3xl font-extrabold text-ailu-yellow">{c.total}</div>
              <div className="mt-1 text-sm font-semibold">{c.label}</div>
              <div className="mt-0.5 text-xs text-ailu-cream/50">{c.note}</div>
            </>
          );
          return c.href && c.href !== "/admin" ? (
            <Link key={c.label} href={c.href} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-ailu-yellow/50">{inner}</Link>
          ) : (
            <div key={c.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">{inner}</div>
          );
        })}
      </div>

      {staff.role === "OWNER" && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-[#111114] p-6">
          <h2 className="font-display text-lg font-bold">Owner shortcuts</h2>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link href="/admin/settings/staff" className="rounded-full border border-ailu-yellow/60 px-4 py-2 font-semibold text-ailu-yellow hover:bg-ailu-yellow/10">Manage staff</Link>
            <Link href="/admin/settings/audit" className="rounded-full border border-white/20 px-4 py-2 hover:bg-white/10">Audit log</Link>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-white/10 bg-[#111114] p-6 text-sm text-ailu-cream/60">
        Business rule reminder — an enquiry is never a booking. Confirmation needs availability, agreed scope and payment. Nothing ends up public from this admin without the owner saying so.
      </div>
    </div>
  );
}
