"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole, canWriteCRM, canEditEvent } from "@/lib/authz";
import * as events from "@/server/events";
import * as quotations from "@/server/quotations";

function back(id: string, msg: string): never {
  redirect(`/admin/events/${id}?msg=${encodeURIComponent(msg)}`);
}
function backList(msg: string): never {
  redirect(`/admin/events?msg=${encodeURIComponent(msg)}`);
}
function realMessage(e: unknown): string {
  const digest = (e as { digest?: string })?.digest ?? "";
  if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw e;
  return String((e as Error)?.message ?? "Something went wrong.");
}

export async function createEventAction(fd: FormData) {
  let id = "";
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    if (!canWriteCRM(staff)) throw new Error("Accounts is read-only.");
    const event = await events.createEvent(staff, fd);
    id = event.id;
  } catch (e) {
    backList(realMessage(e));
  }
  revalidatePath("/admin/events");
  redirect(`/admin/events/${id}?msg=${encodeURIComponent("Event created.")}`);
}

export async function updateEventAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    if (!canWriteCRM(staff)) throw new Error("Accounts is read-only.");
    const event = await events.getEvent(id);
    if (!event || !canEditEvent(staff, event)) throw new Error("You cannot edit this event.");
    await events.updateEvent(staff, id, fd);
  } catch (e) {
    back(id, realMessage(e));
  }
  revalidatePath(`/admin/events/${id}`);
  back(id, "Event updated.");
}

export async function setEventStatusAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    if (!canWriteCRM(staff)) throw new Error("Accounts is read-only.");
    const event = await events.getEvent(id);
    if (!event || !canEditEvent(staff, event)) throw new Error("You cannot change this event's status.");
    await events.setEventStatus(staff, id, String(fd.get("status") ?? ""), String(fd.get("lostReason") ?? ""));
  } catch (e) {
    back(id, realMessage(e));
  }
  revalidatePath(`/admin/events/${id}`);
  back(id, "Status updated.");
}

export async function archiveEventAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER"]);
    await events.setEventArchived(staff, id, String(fd.get("archived") ?? "") === "yes");
  } catch (e) {
    back(id, realMessage(e));
  }
  revalidatePath(`/admin/events/${id}`);
  back(id, String(fd.get("archived") ?? "") === "yes" ? "Event archived." : "Event restored.");
}

export async function createQuotationAction(fd: FormData) {
  const id = String(fd.get("eventId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    if (!canWriteCRM(staff)) throw new Error("Accounts is read-only.");
    const event = await events.getEvent(id);
    if (!event || !canEditEvent(staff, event)) throw new Error("You cannot add quotations to this event.");
    await quotations.createQuotation(staff, id, fd);
  } catch (e) {
    back(id, realMessage(e));
  }
  revalidatePath(`/admin/events/${id}`);
  back(id, "Quotation created.");
}

export async function setQuotationStatusAction(fd: FormData) {
  const id = String(fd.get("eventId") ?? "");
  const quotationId = String(fd.get("quotationId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    if (!canWriteCRM(staff)) throw new Error("Accounts is read-only.");
    await quotations.setQuotationStatus(staff, quotationId, String(fd.get("status") ?? ""));
  } catch (e) {
    back(id, realMessage(e));
  }
  revalidatePath(`/admin/events/${id}`);
  back(id, "Quotation status updated.");
}

export async function addTaskAction(fd: FormData) {
  const id = String(fd.get("eventId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    if (!canWriteCRM(staff)) throw new Error("Accounts is read-only.");
    await (await import("@/server/tasks")).createTask(staff, fd);
  } catch (e) {
    back(id, realMessage(e));
  }
  revalidatePath(`/admin/events/${id}`);
  back(id, "Follow-up task added.");
}

export async function toggleTaskAction(fd: FormData) {
  const id = String(fd.get("eventId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    await (await import("@/server/tasks")).toggleTaskDone(staff, String(fd.get("id") ?? ""), String(fd.get("done") ?? "") === "yes");
  } catch (e) {
    back(id, realMessage(e));
  }
  revalidatePath(`/admin/events/${id}`);
  back(id, "Task updated.");
}