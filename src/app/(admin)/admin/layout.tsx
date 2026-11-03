import Link from "next/link";
import Image from "next/image";
import { currentStaff } from "@/lib/authz";
import { signOut } from "@/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

// Admin shell. Signed-out visitors (the login page) get a plain dark screen without the public site chrome.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const staff = await currentStaff();
  return (
    <div className="min-h-[100svh] bg-[#0d0d0d] font-body text-ailu-cream antialiased">
      {staff ? (
        <div className="flex min-h-[100svh]">
          <AdminSidebar role={staff.role} userName={staff.name || staff.email} signOutForm={
            /* sign out stays a server action: no client JS needed */
            <form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}>
              <button className="w-full rounded-lg border border-white/15 px-3 py-2 text-sm text-ailu-cream/80 transition hover:bg-white/10">Sign out</button>
            </form>
          } />
          <div className="min-w-0 flex-1">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-[#0d0d0d]/90 px-4 py-3 backdrop-blur lg:px-8">
              <Link href="/admin" className="flex items-center gap-3">
                <Image src="/brand/ailu-logo.png" alt="AILU" width={1400} height={468} className="h-7 w-auto" priority />
              </Link>
              <span className="text-xs uppercase tracking-widest text-ailu-cream/50">Admin · CRM</span>
            </div>
            <main className="px-4 py-6 lg:px-8">{children}</main>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[100svh] items-center justify-center px-4">{children}</div>
      )}
    </div>
  );
}
