import Link from "next/link";
import { requireRolePage } from "@/lib/authz";
import ClientForm from "@/components/admin/ClientForm";
import { createClientAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  const staff = await requireRolePage(["OWNER", "MANAGER", "STAFF"]);
  if (staff.role === "ACCOUNTS") requireRolePage(["OWNER"]); // ACCOUNTS never reaches this UI; page hides nothing otherwise
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/clients" className="text-sm text-ailu-cream/60 hover:underline">← Clients</Link>
      <h1 className="mt-2 font-display text-2xl font-bold">New client</h1>
      <p className="mt-1 text-sm text-ailu-cream/60">The phone number is the dedupe key — one record per number.</p>
      <div className="mt-6 rounded-2xl border border-white/10 bg-[#111114] p-6">
        <ClientForm action={createClientAction} />
      </div>
    </div>
  );
}
