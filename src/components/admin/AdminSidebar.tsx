"use client";
import Link from "next/link";
import { useState } from "react";
import type { StaffRole } from "@prisma/client";

const ITEMS: { href: string; label: string; ownerOnly?: boolean; roles?: StaffRole[] }[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/attention", label: "Needs attention" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/inbox", label: "Inbox", roles: ["OWNER", "MANAGER", "STAFF"] },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/tasks", label: "Tasks" },
  { href: "/admin/finance", label: "Finance", roles: ["OWNER", "MANAGER", "ACCOUNTS"] },
  { href: "/admin/vendors", label: "Vendors" },
  { href: "/admin/applications", label: "Applications", roles: ["OWNER", "MANAGER", "STAFF"] },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/partners", label: "Partners" },
  { href: "/admin/commissions", label: "Commissions", roles: ["OWNER", "MANAGER", "ACCOUNTS"] },
  { href: "/admin/dreams", label: "Private dreams", roles: ["OWNER", "MANAGER"] },
  { href: "/admin/settings/staff", label: "Staff", ownerOnly: true },
  { href: "/admin/settings/audit", label: "Audit log", ownerOnly: true },
  { href: "/admin/settings/password", label: "My password" },
];

export default function AdminSidebar({
  role,
  userName,
  signOutForm,
}: {
  role: StaffRole;
  userName: string;
  signOutForm: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const group = (
    <>
      <div className="px-4 py-5">
        <div className="text-sm font-semibold">{userName}</div>
        <div className="mt-0.5 inline-block rounded-full bg-ailu-yellow/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-ailu-yellow">
          {role}
        </div>
      </div>
      <nav aria-label="Admin" className="flex-1 space-y-1 overflow-y-auto px-2">
        {ITEMS.filter((i) => (!i.ownerOnly || role === "OWNER") && (!i.roles || i.roles.includes(role))).map((i) => (
          <Link
            key={i.href}
            href={i.href}
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-ailu-cream/85 transition hover:bg-white/10 hover:text-ailu-cream"
          >
            {i.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">{signOutForm}</div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 lg:hidden">
        <span className="text-sm font-semibold">{userName} · {role}</span>
        <button className="rounded-lg border border-white/20 px-3 py-1.5 text-sm" aria-controls="admin-mobile-menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 lg:flex">{group}</aside>
      {/* Mobile drawer */}
      {open && (
        <div id="admin-mobile-menu" className="fixed inset-0 z-40 flex flex-col bg-[#0d0d0d] lg:hidden" role="dialog" aria-label="Admin menu">
          <button className="self-end p-4 text-sm text-ailu-cream/70" onClick={() => setOpen(false)}>Close</button>
          <div className="flex min-h-0 flex-1 flex-col">{group}</div>
        </div>
      )}
    </>
  );
}
