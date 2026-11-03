"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { createTask, toggleTaskDone } from "@/server/tasks";
import { z } from "zod";

function back(msg: string, view = "all"): never {
  redirect(`/admin/tasks?view=${encodeURIComponent(view)}&msg=${encodeURIComponent(msg)}`);
}

function message(error: unknown): string {
  const digest = (error as { digest?: string })?.digest ?? "";
  if (digest.startsWith("NEXT_REDIRECT")) throw error;
  return (error as Error)?.message ?? "Something went wrong.";
}

export async function createTaskPageAction(fd: FormData) {
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    await createTask(staff, fd);
  } catch (error) {
    back(message(error), String(fd.get("view") ?? "all"));
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
    back(message(error), view);
  }
  revalidatePath("/admin/tasks");
  back("Task updated.", view);
}
