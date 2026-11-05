"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { canEditEvent, requireRole, requireStaff } from "@/lib/authz";
import { safeAdminPath } from "@/lib/recordRules";
import { deleteNote, updateNote } from "@/server/activity";
import { deleteQuotation } from "@/server/quotations";
import { deleteTask, updateTask } from "@/server/tasks";
import { deleteAssignment, updateAssignment } from "@/server/team";
import { deleteExpense, deletePayment, deleteVendorBooking, updateExpense, updatePayment, updateVendorBooking } from "@/server/vendors";

// Edit and delete actions shared by the CRM screens. Each form sends a "back" path to return to.
async function run(fd: FormData, done: string, work: () => Promise<unknown>): Promise<never> {
  const back = safeAdminPath(String(fd.get("back") ?? "/admin"));
  const [path, hash] = back.split("#");
  const join = path.includes("?") ? "&" : "?";
  let message = done;
  try {
    await work();
    revalidatePath(path.split("?")[0]);
  } catch (error) {
    const digest = (error as { digest?: string })?.digest ?? "";
    if (digest.startsWith("NEXT_REDIRECT")) throw error;
    message = (error as Error)?.message ?? "Something went wrong.";
  }
  redirect(`${path}${join}msg=${encodeURIComponent(message)}${hash ? `#${hash}` : ""}`);
}

const id = (fd: FormData, key = "id") => String(fd.get(key) ?? "");

async function eventEditor(eventId: string) {
  const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
  const { getEvent } = await import("@/server/events");
  const event = await getEvent(eventId);
  if (!event || !canEditEvent(staff, event)) throw new Error("You cannot change this event.");
  return staff;
}

export async function updateTaskAction(fd: FormData) {
  await run(fd, "Task updated.", async () => updateTask(await requireRole(["OWNER", "MANAGER", "STAFF"]), id(fd), fd));
}
export async function deleteTaskAction(fd: FormData) {
  await run(fd, "Task deleted.", async () => deleteTask(await requireRole(["OWNER", "MANAGER", "STAFF"]), id(fd)));
}

export async function updatePaymentAction(fd: FormData) {
  await run(fd, "Payment updated.", async () => updatePayment(await requireRole(["OWNER", "ACCOUNTS"]), id(fd, "eventId"), id(fd), fd));
}
export async function deletePaymentAction(fd: FormData) {
  await run(fd, "Payment deleted.", async () => deletePayment(await requireRole(["OWNER", "ACCOUNTS"]), id(fd, "eventId"), id(fd)));
}
export async function updateExpenseAction(fd: FormData) {
  await run(fd, "Expense updated.", async () => updateExpense(await requireRole(["OWNER", "ACCOUNTS"]), id(fd, "eventId"), id(fd), fd));
}
export async function deleteExpenseAction(fd: FormData) {
  await run(fd, "Expense deleted.", async () => deleteExpense(await requireRole(["OWNER", "ACCOUNTS"]), id(fd, "eventId"), id(fd)));
}

export async function updateVendorBookingAction(fd: FormData) {
  await run(fd, "Vendor booking updated.", async () => updateVendorBooking(await eventEditor(id(fd, "eventId")), id(fd, "eventId"), id(fd), fd));
}
export async function deleteVendorBookingAction(fd: FormData) {
  await run(fd, "Vendor booking deleted.", async () => deleteVendorBooking(await eventEditor(id(fd, "eventId")), id(fd, "eventId"), id(fd)));
}

export async function updateAssignmentAction(fd: FormData) {
  await run(fd, "Assignment updated.", async () => updateAssignment(await eventEditor(id(fd, "eventId")), id(fd, "eventId"), id(fd), fd));
}
export async function deleteAssignmentAction(fd: FormData) {
  await run(fd, "Assignment deleted.", async () => deleteAssignment(await eventEditor(id(fd, "eventId")), id(fd, "eventId"), id(fd)));
}

export async function deleteQuotationAction(fd: FormData) {
  await run(fd, "Draft quotation deleted.", async () => deleteQuotation(await eventEditor(id(fd, "eventId")), id(fd, "eventId"), id(fd)));
}

export async function updateNoteAction(fd: FormData) {
  await run(fd, "Note updated.", async () => updateNote(await requireStaff(), id(fd), String(fd.get("body") ?? "")));
}
export async function deleteNoteAction(fd: FormData) {
  await run(fd, "Note deleted.", async () => deleteNote(await requireStaff(), id(fd)));
}
