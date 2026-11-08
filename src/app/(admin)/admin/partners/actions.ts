"use server";

// Form actions for sales partners and partner rewards (propose, approve or reject, mark paid).
import { actionMessage } from "@/lib/actionMessage";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import * as partners from "@/server/partners";

function fail(path: string, error: unknown): never {
  redirect(`${path}?msg=${encodeURIComponent(actionMessage(error))}`);
}

export async function updatePartnerAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER"]);
    await partners.updatePartnerStatus(staff, id, fd);
    revalidatePath("/admin/partners"); revalidatePath(`/admin/partners/${id}`);
  } catch (error) { fail(`/admin/partners/${id}`, error); }
  redirect(`/admin/partners/${id}?msg=${encodeURIComponent("Partner updated.")}`);
}

export async function proposeCommissionAction(fd: FormData) {
  const eventId = String(fd.get("eventId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER"]);
    await partners.proposeCommission(staff, eventId, fd);
    revalidatePath(`/admin/events/${eventId}`); revalidatePath("/admin/commissions");
  } catch (error) { fail(`/admin/events/${eventId}`, error); }
  redirect(`/admin/events/${eventId}?msg=${encodeURIComponent("Reward proposal sent for owner review.")}#referral`);
}

export async function decideCommissionAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER"]);
    const status = String(fd.get("status") ?? "");
    if (status !== "APPROVED" && status !== "REJECTED") throw new Error("Choose approve or reject.");
    await partners.decideCommission(staff, id, status, String(fd.get("reason") ?? ""));
    revalidatePath("/admin/commissions");
  } catch (error) { fail("/admin/commissions", error); }
  redirect(`/admin/commissions?msg=${encodeURIComponent("Commission decision recorded.")}`);
}

export async function payCommissionAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER", "ACCOUNTS"]);
    await partners.payCommission(staff, id, fd);
    revalidatePath("/admin/commissions");
  } catch (error) { fail("/admin/commissions", error); }
  redirect(`/admin/commissions?msg=${encodeURIComponent("Approved reward marked as paid.")}`);
}
