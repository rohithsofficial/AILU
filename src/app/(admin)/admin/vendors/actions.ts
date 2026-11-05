"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import * as vendors from "@/server/vendors";

function fail(path: string, error: unknown): never {
  const digest = (error as { digest?: string })?.digest ?? "";
  if (digest.startsWith("NEXT_REDIRECT")) throw error;
  redirect(`${path}?msg=${encodeURIComponent(String((error as Error)?.message ?? "Something went wrong."))}`);
}

export async function createVendorAction(fd: FormData) {
  try {
    const staff = await requireRole(["OWNER", "MANAGER"]);
    const vendor = await vendors.createVendor(staff, fd);
    revalidatePath("/admin/vendors");
    redirect(`/admin/vendors/${vendor.id}?msg=${encodeURIComponent("Vendor added.")}`);
  } catch (error) { fail("/admin/vendors", error); }
}

export async function updateVendorAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER"]);
    await vendors.updateVendor(staff, id, fd);
    revalidatePath("/admin/vendors"); revalidatePath(`/admin/vendors/${id}`);
  } catch (error) { fail(`/admin/vendors/${id}`, error); }
  redirect(`/admin/vendors/${id}?msg=${encodeURIComponent("Vendor updated.")}`);
}

export async function archiveVendorAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER"]);
    await vendors.setVendorArchived(staff, id, String(fd.get("archived") ?? "") === "yes");
    revalidatePath("/admin/vendors"); revalidatePath(`/admin/vendors/${id}`);
  } catch (error) { fail(`/admin/vendors/${id}`, error); }
  redirect("/admin/vendors");
}

export async function deleteVendorAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER"]);
    await vendors.deleteVendor(staff, id);
    revalidatePath("/admin/vendors");
  } catch (error) { fail(`/admin/vendors/${id}`, error); }
  redirect(`/admin/vendors?msg=${encodeURIComponent("Vendor deleted.")}`);
}

export async function addVendorNoteAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const { requireRole, can } = await import("@/lib/authz");
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    if (!can(staff.role, "vendors.note")) throw new Error("Your role cannot add vendor notes.");
    await vendors.addVendorNote(staff, id, String(fd.get("note") ?? ""));
    revalidatePath(`/admin/vendors/${id}`);
  } catch (error) { fail(`/admin/vendors/${id}`, error); }
  redirect(`/admin/vendors/${id}?msg=${encodeURIComponent("Note added.")}#notes`);
}

export async function createVendorBookingAction(fd: FormData) {
  const eventId = String(fd.get("eventId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    const { getEvent } = await import("@/server/events");
    const { canEditEvent } = await import("@/lib/authz");
    const event = await getEvent(eventId);
    if (!event || !canEditEvent(staff, event)) throw new Error("You cannot update this event.");
    await vendors.createVendorBooking(staff, eventId, fd);
    revalidatePath(`/admin/events/${eventId}`);
  } catch (error) { fail(`/admin/events/${eventId}`, error); }
  redirect(`/admin/events/${eventId}?msg=${encodeURIComponent("Vendor booking added.")}#vendors`);
}

export async function setVendorBookingStatusAction(fd: FormData) {
  const eventId = String(fd.get("eventId") ?? ""); const bookingId = String(fd.get("bookingId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    const { getEvent } = await import("@/server/events"); const { canEditEvent } = await import("@/lib/authz");
    const event = await getEvent(eventId);
    if (!event || !canEditEvent(staff, event)) throw new Error("You cannot update this event.");
    await vendors.setVendorBookingStatus(staff, eventId, bookingId, String(fd.get("status") ?? ""));
    revalidatePath(`/admin/events/${eventId}`);
  } catch (error) { fail(`/admin/events/${eventId}`, error); }
  redirect(`/admin/events/${eventId}#vendors`);
}

export async function createPaymentAction(fd: FormData) {
  const eventId = String(fd.get("eventId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "ACCOUNTS"]);
    await vendors.createPayment(staff, eventId, fd);
    revalidatePath(`/admin/events/${eventId}`);
  } catch (error) { fail(`/admin/events/${eventId}`, error); }
  redirect(`/admin/events/${eventId}?msg=${encodeURIComponent("Payment recorded.")}#finance`);
}

export async function createExpenseAction(fd: FormData) {
  const eventId = String(fd.get("eventId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "ACCOUNTS"]);
    await vendors.createExpense(staff, eventId, fd);
    revalidatePath(`/admin/events/${eventId}`);
  } catch (error) { fail(`/admin/events/${eventId}`, error); }
  redirect(`/admin/events/${eventId}?msg=${encodeURIComponent("Expense recorded.")}#finance`);
}
