// CRM top bar: logo, search box and the "My tasks" count.
import Link from "next/link";
import Image from "next/image";
import type { Staff } from "@/lib/authz";
import GlobalSearch from "./GlobalSearch";

export default function AdminTopBar({ staff, myTasksCount }: { staff: Staff; myTasksCount: number }) {
  return <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#0d0d0d]/95 px-4 py-3 backdrop-blur lg:px-8">
    <Link href="/admin" className="hidden shrink-0 sm:flex" aria-label="AILU dashboard"><Image src="/brand/ailu-logo.png" alt="AILU" width={1400} height={468} className="h-7 w-auto" priority /></Link>
    <GlobalSearch />
    <Link href="/admin/tasks?view=my" className="shrink-0 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold hover:border-ailu-yellow/50" aria-label={`My tasks, ${myTasksCount} due or overdue`}>
      My tasks <span className="ml-1 rounded-full bg-ailu-yellow/15 px-1.5 py-0.5 text-ailu-yellow">{myTasksCount}</span>
    </Link>
    <span className="hidden shrink-0 text-xs text-ailu-cream/60 xl:inline">{staff.name || staff.email}</span>
  </div>;
}
