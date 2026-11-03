import { currentStaff } from "@/lib/authz";
import { signOut } from "@/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { myTasksDueCount } from "@/server/dashboard/topbar";

// Admin shell. Signed-out visitors (the login page) get a plain dark screen without the public site chrome.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const staff = await currentStaff();
  const dueCount = staff ? await myTasksDueCount(staff) : 0;
  return (
    <div className="min-h-[100svh] bg-[#0d0d0d] font-body text-ailu-cream antialiased">
      {staff ? (
        <div className="flex min-h-[100svh] flex-col lg:flex-row">
          <AdminSidebar role={staff.role} userName={staff.name || staff.email} signOutForm={
            /* sign out stays a server action: no client JS needed */
            <form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}>
              <button className="w-full rounded-lg border border-white/15 px-3 py-2 text-sm text-ailu-cream/80 transition hover:bg-white/10">Sign out</button>
            </form>
          } />
          <div className="min-w-0 flex-1">
            <AdminTopBar staff={staff} myTasksCount={dueCount} />
            <main className="px-4 py-6 lg:px-8">{children}</main>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[100svh] items-center justify-center px-4">{children}</div>
      )}
    </div>
  );
}
