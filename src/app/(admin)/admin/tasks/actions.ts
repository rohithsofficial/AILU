"use server";

// Form actions for the Tasks page (add a task, mark done or reopen).
import { actionMessage } from "@/lib/actionMessage";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { createTask, toggleTaskDone } from "@/server/tasks";
import { z } from "zod";

function back(msg: string, view = "all"): never {
  redirect(`/admin/tasks?view=${encodeURIComponent(view)}&msg=${encodeURIComponent(msg)}`);
}


export async function createTaskPageAction(fd: FormData) {
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    await createTask(staff, fd);
  } catch (error) {
    back(actionMessage(error), String(fd.get("view") ?? "all"));
  }
  revalidatePath("/admin/tasks");
  back("Task created.", String(fd.get("view") ?? "all"));
}

export async function toggleTaskPageAction(fd: FormData) {
  const view = String(fd.get("view") ?? "all");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    const input = z.object({ id: z.string().min(1), done: z.enum(["yes", "no"]) }).safeParse({ id: String(fd.get("id") ?? ""), done: String(fd.get("done") ?? "") });
    if (!input.success) throw new Error("That task update was not valid.");
    await toggleTaskDone(staff, input.data.id, input.data.done === "yes");
  } catch (error) {
    back(actionMessage(error), view);
  }
  revalidatePath("/admin/tasks");
  back("Task updated.", view);
}
