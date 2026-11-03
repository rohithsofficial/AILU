"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole, canWriteCRM, canEditEvent } from "@/lib/authz";
import * as events from "@/server/events";
import * as quotations from "@/server/quotations";
import { z } from "zod";

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
    const requestedOwner = String(fd.get("ownerId") ?? "").trim();
    if (staff.role === "STAFF" && requestedOwner && requestedOwner !== staff.id) throw new Error("Staff can assign a new event only to themselves.");
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
    if (staff.role === "STAFF" && String(fd.get("ownerId") ?? "").trim() !== (event.ownerId ?? "")) throw new Error("Only a manager can reassign an event.");
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
  const input = z.object({ id: z.string().min(1), archived: z.enum(["yes", "no"]) }).safeParse({ id: String(fd.get("id") ?? ""), archived: String(fd.get("archived") ?? "") });
  if (!input.success) backList("That archive request was not valid.");
  const { id, archived } = input.data;
  try {
    const staff = await requireRole(["OWNER"]);
    await events.setEventArchived(staff, id, archived === "yes");
  } catch (e) {
    back(id, realMessage(e));
  }
  revalidatePath(`/admin/events/${id}`);
  back(id, archived === "yes" ? "Event archived." : "Event restored.");
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

export async function updateQuotationAction(fd: FormData) {
  const id = String(fd.get("eventId") ?? "");
  const quotationId = String(fd.get("quotationId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    const quotation = await quotations.getQuotation(quotationId);
    if (!quotation || quotation.eventId !== id || quotation.status !== "DRAFT") throw new Error("That draft quotation does not belong to this event.");
    const event = await events.getEvent(id);
    if (!event || !canEditEvent(staff, event)) throw new Error("You cannot edit this quotation.");
    await quotations.updateQuotation(staff, id, quotationId, fd);
  } catch (e) {
    back(id, realMessage(e));
  }
  revalidatePath(`/admin/events/${id}`);
  back(id, "Draft quotation updated.");
}

export async function setQuotationStatusAction(fd: FormData) {
  const id = String(fd.get("eventId") ?? "");
  const quotationId = String(fd.get("quotationId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    if (!canWriteCRM(staff)) throw new Error("Accounts is read-only.");
    const quotation = await quotations.getQuotation(quotationId);
    if (!quotation || quotation.eventId !== id) throw new Error("That quotation does not belong to this event.");
    const event = await events.getEvent(quotation.eventId);
    if (!event || !canEditEvent(staff, event)) throw new Error("You cannot change this quotation.");
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
    if (id) {
      const event = await events.getEvent(id);
      if (!event || !canEditEvent(staff, event)) throw new Error("You cannot add a task to this event.");
    }
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
    const input = z.object({ id: z.string().min(1), done: z.enum(["yes", "no"]) }).safeParse({ id: String(fd.get("id") ?? ""), done: String(fd.get("done") ?? "") });
    if (!input.success) throw new Error("That task update was not valid.");
    if (staff.role === "STAFF") {
      const task = await (await import("@/lib/db")).getPrisma().task.findUnique({ where: { id: input.data.id } });
      if (!task) throw new Error("That task does not exist.");
      if (task.assigneeId !== staff.id) {
        const event = task.eventId ? await events.getEvent(task.eventId) : null;
        if (event?.ownerId !== staff.id) throw new Error("This task is not assigned to you.");
      }
    }
    await (await import("@/server/tasks")).toggleTaskDone(staff, input.data.id, input.data.done === "yes");
  } catch (e) {
    back(id, realMessage(e));
  }
  revalidatePath(`/admin/events/${id}`);
  back(id, "Task updated.");
}
