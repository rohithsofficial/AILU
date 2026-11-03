"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole, canWriteCRM } from "@/lib/authz";
import * as inbox from "@/server/inbox";

function back(id: string, msg: string): never {
  redirect(`/admin/inbox/${id}?msg=${encodeURIComponent(msg)}`);
}

// redirect() throws; keep its special error flowing while surfacing real failures to the URL.
function realMessage(e: unknown): string {
  const digest = (e as { digest?: string })?.digest ?? "";
  if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw e;
  return String((e as Error)?.message ?? "Something went wrong.");
}

export async function toggleSpamAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    const spam = String(fd.get("spam") ?? "") === "yes";
    await inbox.setEnquirySpam(staff, id, spam);
  } catch (e) {
    back(id, realMessage(e));
  }
  revalidatePath("/admin/inbox");
  back(id, "Done — spam status updated.");
}

export async function assignOwnerAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    await inbox.setEnquiryOwner(staff, id, String(fd.get("ownerId") ?? ""));
  } catch (e) {
    back(id, realMessage(e));
  }
  revalidatePath(`/admin/inbox/${id}`);
  back(id, "Owner updated.");
}

export async function setEnquiryStatusAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    await inbox.setEnquiryStatus(staff, id, String(fd.get("status") ?? ""));
  } catch (e) {
    back(id, realMessage(e));
  }
  revalidatePath(`/admin/inbox/${id}`);
  back(id, "Status updated.");
}

export async function convertEnquiryAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  let eventId = "";
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    if (!canWriteCRM(staff)) throw new Error("Accounts is read-only.");
    const { event } = await import("@/server/events").then((m) => m.convertEnquiry(staff, id, fd));
    eventId = event.id;
  } catch (e) {
    back(id, realMessage(e));
  }
  revalidatePath("/admin/inbox");
  redirect(`/admin/events/${eventId}?msg=${encodeURIComponent("Enquiry converted into a client and this event.")}`);
}

export async function addTaskAction(fd: FormData) {
  const enquiryId = String(fd.get("enquiryId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    const { createTask } = await import("@/server/tasks");
    await createTask(staff, fd);
  } catch (e) {
    back(enquiryId, realMessage(e));
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
    back(enquiryId, realMessage(e));
  }
  revalidatePath(`/admin/inbox/${enquiryId}`);
  back(enquiryId, "Task updated.");
}
