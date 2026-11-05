"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import * as applications from "@/server/applications";

function fail(id: string, error: unknown): never {
  const digest = (error as { digest?: string })?.digest ?? "";
  if (digest.startsWith("NEXT_REDIRECT")) throw error;
  redirect(`${id ? `/admin/applications/${id}` : "/admin/applications"}?msg=${encodeURIComponent(String((error as Error)?.message ?? "Something went wrong."))}`);
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
