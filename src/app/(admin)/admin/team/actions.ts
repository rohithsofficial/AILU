"use server";

// Form actions for the team directory and event assignments.
import { actionMessage } from "@/lib/actionMessage";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { canEditEvent, requireRole } from "@/lib/authz";
import * as team from "@/server/team";

function fail(path: string, error: unknown): never {
  redirect(`${path}?msg=${encodeURIComponent(actionMessage(error))}`);
}

export async function createTeamMemberAction(fd: FormData) {
  try {
    const staff = await requireRole(["OWNER", "MANAGER"]);
    const member = await team.createTeamMember(staff, fd);
    revalidatePath("/admin/team");
    redirect(`/admin/team/${member.id}?msg=${encodeURIComponent("Team member added.")}`);
  } catch (error) { fail("/admin/team", error); }
}

export async function updateTeamMemberAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER"]);
    await team.updateTeamMember(staff, id, fd);
    revalidatePath("/admin/team"); revalidatePath(`/admin/team/${id}`);
  } catch (error) { fail(`/admin/team/${id}`, error); }
  redirect(`/admin/team/${id}?msg=${encodeURIComponent("Team profile updated.")}`);
}

export async function assignTeamMemberAction(fd: FormData) {
  const eventId = String(fd.get("eventId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    const { getEvent } = await import("@/server/events");
    const event = await getEvent(eventId);
    if (!event || !canEditEvent(staff, event)) throw new Error("You cannot assign team members to this event.");
    const result = await team.assignTeamMember(staff, eventId, fd);
    revalidatePath(`/admin/events/${eventId}`); revalidatePath(`/admin/team/${result.assignment.teamMemberId}`);
    const msg = result.scheduleWarning ? `Assignment saved. ${result.scheduleWarning}` : "Team member assigned.";
    redirect(`/admin/events/${eventId}?msg=${encodeURIComponent(msg)}#team`);
  } catch (error) { fail(`/admin/events/${eventId}`, error); }
}

export async function setAssignmentStatusAction(fd: FormData) {
  const eventId = String(fd.get("eventId") ?? ""); const assignmentId = String(fd.get("assignmentId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    const { getEvent } = await import("@/server/events");
    const event = await getEvent(eventId);
    if (!event || !canEditEvent(staff, event)) throw new Error("You cannot update this team assignment.");
    await team.setAssignmentStatus(staff, eventId, assignmentId, String(fd.get("status") ?? ""));
    revalidatePath(`/admin/events/${eventId}`);
  } catch (error) { fail(`/admin/events/${eventId}`, error); }
  redirect(`/admin/events/${eventId}#team`);
}
