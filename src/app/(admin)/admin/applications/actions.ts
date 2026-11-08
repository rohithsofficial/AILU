"use server";

// Form actions for team applications. Each one checks the role first, then calls src/server/applications.ts.
import { actionMessage } from "@/lib/actionMessage";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import * as applications from "@/server/applications";

function fail(id: string, error: unknown): never {
  redirect(`${id ? `/admin/applications/${id}` : "/admin/applications"}?msg=${encodeURIComponent(actionMessage(error))}`);
}

export async function updateApplicationAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER"]);
    await applications.updateApplication(staff, id, fd);
    revalidatePath("/admin/applications"); revalidatePath(`/admin/applications/${id}`);
  } catch (error) { fail(id, error); }
  redirect(`/admin/applications/${id}?msg=${encodeURIComponent("Application updated.")}`);
}

export async function convertApplicationAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER"]);
    const { member, mode } = await applications.convertApplicationToTeamMember(staff, id);
    revalidatePath("/admin/applications"); revalidatePath(`/admin/applications/${id}`); revalidatePath("/admin/team"); revalidatePath(`/admin/team/${member.id}`);
    redirect(`/admin/applications/${id}?msg=${encodeURIComponent(mode === "create" ? "Application converted to a team member." : "Application linked to the existing team member.")}`);
  } catch (error) { fail(id, error); }
}
