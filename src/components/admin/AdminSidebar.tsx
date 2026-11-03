"use client";
import Link from "next/link";
import { useState } from "react";
import type { StaffRole } from "@prisma/client";

const ITEMS: { href: string; label: string; soon?: boolean; ownerOnly?: boolean }[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/inbox", label: "Inbox (enquiries)", soon: true },
  { href: "/admin/clients", label: "Clients", soon: true },
  { href: "/admin/events", label: "Events", soon: true },
  { href: "/admin/vendors", label: "Vendors", soon: true },
  { href: "/admin/team", label: "Team", soon: true },
  { href: "/admin/partners", label: "Partners", soon: true },
  { href: "/admin/tasks", label: "Tasks", soon: true },
  { href: "/admin/settings/staff", label: "Staff", ownerOnly: true },
  { href: "/admin/settings/audit", label: "Audit log", ownerOnly: true },
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
        {ITEMS.filter((i) => !i.ownerOnly || role === "OWNER").map((i) => (
          <Link
            key={i.href}
            href={i.soon ? "/admin" : i.href}
            aria-disabled={i.soon}
            title={i.soon ? "Coming in a later phase" : undefined}
            className={`block rounded-lg px-3 py-2 text-sm transition ${
              i.soon
                ? "cursor-not-allowed text-ailu-cream/35"
                : "text-ailu-cream/85 hover:bg-white/10 hover:text-ailu-cream"
            }`}
          >
            {i.label}
            {i.soon ? <span className="ml-1.5 text-[10px] uppercase tracking-wider text-ailu-cream/30">soon</span> : null}
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
        <button className="rounded-lg border border-white/20 px-3 py-1.5 text-sm" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 lg:flex">{group}</aside>
      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-[#0d0d0d] lg:hidden" role="dialog" aria-label="Admin menu">
          <button className="self-end p-4 text-sm text-ailu-cream/70" onClick={() => setOpen(false)}>Close</button>
          <div className="flex min-h-0 flex-1 flex-col">{group}</div>
        </div>
      )}
    </>
  );
}
