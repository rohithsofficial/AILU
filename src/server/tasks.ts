import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { logActivity } from "@/server/activity";

export async function listOpenTasks() {
  return getPrisma().task.findMany({ where: { doneAt: null }, orderBy: [{ dueAt: "asc" }, { priority: "desc" }], take: 50 });
}

const taskSchema = z.object({
  title: z.string().trim().min(2, "Describe the task").max(200),
  dueAt: z.string().trim().max(20).optional(),
  priority: z.enum(["HIGH", "NORMAL", "LOW"]).default("NORMAL"),
});

export async function createTask(actor: { id: string }, fd: FormData) {
  const db = getPrisma();
  const parsed = taskSchema.safeParse({ title: String(fd.get("title") ?? ""), dueAt: String(fd.get("dueAt") ?? "") || undefined, priority: String(fd.get("priority") ?? "NORMAL") });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the task details.");
  const due = parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;
  if (parsed.data.dueAt && (due === null || Number.isNaN(due.getTime()))) throw new Error("That due date is not valid.");

  const eventId = String(fd.get("eventId") ?? "").trim() || null;
  const clientId = String(fd.get("clientId") ?? "").trim() || null;
  const enquiryId = String(fd.get("enquiryId") ?? "").trim() || null;
  if (!eventId && !clientId && !enquiryId) throw new Error("Open a task from a client, event or enquiry page.");

  let assigneeId: string | null = String(fd.get("assigneeId") ?? "").trim() || null;
  if (assigneeId && !(await db.staffUser.findFirst({ where: { id: assigneeId, active: true } }))) assigneeId = null;

  const created = await db.task.create({ data: { title: parsed.data.title, dueAt: due, priority: parsed.data.priority, assigneeId, eventId, clientId, enquiryId } });
  await audit({ id: actor.id }, "task.created", "Task", created.id, { title: created.title });
  if (eventId) await logActivity("NOTE", `Task added: ${created.title}`, { eventId, clientId }, actor.id);
  return created;
}

export async function toggleTaskDone(actor: { id: string }, taskId: string, done: boolean) {
  const db = getPrisma();
  const existing = await db.task.findUnique({ where: { id: taskId } });
  if (!existing) throw new Error("That task does not exist.");
  const updated = await db.task.update({ where: { id: taskId }, data: { doneAt: done ? new Date() : null } });
  await audit({ id: actor.id }, done ? "task.done" : "task.reopened", "Task", taskId);
  if (existing.eventId) await logActivity("NOTE", done ? `Task done: ${updated.title}` : `Task reopened: ${updated.title}`, { eventId: existing.eventId, clientId: existing.clientId }, actor.id);
  return updated;
}
