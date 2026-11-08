"use server";

// Form actions for website enquiries: spam, owner, status, convert to client + event, and tasks.
import { actionMessage } from "@/lib/actionMessage";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole, canWriteCRM } from "@/lib/authz";
import * as inbox from "@/server/inbox";
import { z } from "zod";

async function assertCanEditEnquiry(staff: { id: string; role: string }, id: string, allowClaim = false) {
  const data = await inbox.getEnquiry(id);
  if (!data) throw new Error("That enquiry does not exist.");
  if (staff.role === "OWNER" || staff.role === "MANAGER") return data.enquiry;
  if (staff.role !== "STAFF") throw new Error("Your role does not allow this action.");
  if (data.enquiry.ownerId === staff.id || (allowClaim && !data.enquiry.ownerId)) return data.enquiry;
  throw new Error("Assign this enquiry to yourself before changing it.");
}

function back(id: string, msg: string): never {
  redirect(`/admin/inbox/${id}?msg=${encodeURIComponent(msg)}`);
}


export async function toggleSpamAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    await assertCanEditEnquiry(staff, id);
    const input = z.object({ spam: z.enum(["yes", "no"]) }).safeParse({ spam: String(fd.get("spam") ?? "") });
    if (!input.success) throw new Error("Choose a valid spam action.");
    const spam = input.data.spam === "yes";
    await inbox.setEnquirySpam(staff, id, spam);
  } catch (e) {
    back(id, actionMessage(e));
  }
  revalidatePath("/admin/inbox");
  back(id, "Done — spam status updated.");
}

export async function assignOwnerAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    const current = await assertCanEditEnquiry(staff, id, true);
    const owner = z.string().max(100).safeParse(String(fd.get("ownerId") ?? ""));
    if (!owner.success) throw new Error("Choose a valid staff member.");
    const requestedOwner = owner.data;
    if (staff.role === "STAFF" && requestedOwner !== staff.id) throw new Error("Staff can assign an enquiry only to themselves.");
    if (staff.role === "STAFF" && current.ownerId && current.ownerId !== staff.id) throw new Error("This enquiry is assigned to another staff member.");
    await inbox.setEnquiryOwner(staff, id, requestedOwner);
  } catch (e) {
    back(id, actionMessage(e));
  }
  revalidatePath(`/admin/inbox/${id}`);
  back(id, "Owner updated.");
}

export async function setEnquiryStatusAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    await assertCanEditEnquiry(staff, id);
    await inbox.setEnquiryStatus(staff, id, String(fd.get("status") ?? ""));
  } catch (e) {
    back(id, actionMessage(e));
  }
  revalidatePath(`/admin/inbox/${id}`);
  back(id, "Status updated.");
}

export async function convertEnquiryAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  let eventId = "";
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    await assertCanEditEnquiry(staff, id);
    if (!canWriteCRM(staff)) throw new Error("Accounts is read-only.");
    if (staff.role === "STAFF") fd.set("ownerId", staff.id);
    const { event } = await import("@/server/events").then((m) => m.convertEnquiry(staff, id, fd));
    eventId = event.id;
  } catch (e) {
    back(id, actionMessage(e));
  }
  revalidatePath("/admin/inbox");
  redirect(`/admin/events/${eventId}?msg=${encodeURIComponent("Enquiry converted into a client and this event.")}`);
}

export async function addTaskAction(fd: FormData) {
  const enquiryId = String(fd.get("enquiryId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    await assertCanEditEnquiry(staff, enquiryId, true);
    const { createTask } = await import("@/server/tasks");
    await createTask(staff, fd);
  } catch (e) {
    back(enquiryId, actionMessage(e));
  }
  revalidatePath(`/admin/inbox/${enquiryId}`);
  back(enquiryId, "Follow-up task added.");
}

export async function toggleTaskAction(fd: FormData) {
  const enquiryId = String(fd.get("enquiryId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    const { toggleTaskDone } = await import("@/server/tasks");
    await toggleTaskDone(staff, String(fd.get("id") ?? ""), String(fd.get("done") ?? "") === "yes");
  } catch (e) {
    back(enquiryId, actionMessage(e));
  }
  revalidatePath(`/admin/inbox/${enquiryId}`);
  back(enquiryId, "Task updated.");
}
