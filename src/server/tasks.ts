import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { logActivity } from "@/server/activity";
import type { StaffRole } from "@prisma/client";

export async function listTasks(actor: { id: string; role: StaffRole }, view: string) {
  const db = getPrisma();
  const now = new Date();
  const scope = actor.role === "STAFF" ? { assigneeId: actor.id } : {};
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now).map((part) => [part.type, part.value]));
  const tomorrow = new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00.000Z`);
  tomorrow.setTime(tomorrow.getTime() + 24 * 60 * 60 * 1000);
  const where = view === "due"
    ? { ...scope, doneAt: null, dueAt: { lt: tomorrow } }
    : view === "overdue"
    ? { ...scope, doneAt: null, dueAt: { lt: now } }
    : view === "my"
      ? { assigneeId: actor.id, doneAt: null }
      : scope;
  const rows = await db.task.findMany({ where, orderBy: [{ doneAt: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }], take: 100 });
  const staffIds = [...new Set(rows.map((row) => row.assigneeId).filter((id): id is string => Boolean(id)))];
  const staff = staffIds.length ? await db.staffUser.findMany({ where: { id: { in: staffIds } }, select: { id: true, name: true, email: true } }) : [];
  const names = new Map(staff.map((person) => [person.id, person.name || person.email]));
  return rows.map((row) => ({ ...row, assigneeName: row.assigneeId ? names.get(row.assigneeId) ?? "Inactive staff" : "Unassigned" }));
}

export async function listOpenTasks() {
  return getPrisma().task.findMany({ where: { doneAt: null }, orderBy: [{ dueAt: "asc" }, { priority: "desc" }], take: 50 });
}

const taskSchema = z.object({
  title: z.string().trim().min(2, "Describe the task").max(200),
  dueAt: z.string().trim().max(20).optional(),
  priority: z.enum(["HIGH", "NORMAL", "LOW"]).default("NORMAL"),
});

export async function createTask(actor: { id: string; role?: StaffRole }, fd: FormData) {
  const db = getPrisma();
  const parsed = taskSchema.safeParse({ title: String(fd.get("title") ?? ""), dueAt: String(fd.get("dueAt") ?? "") || undefined, priority: String(fd.get("priority") ?? "NORMAL") });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the task details.");
  const due = parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;
  if (parsed.data.dueAt && (due === null || Number.isNaN(due.getTime()))) throw new Error("That due date is not valid.");

  const eventId = String(fd.get("eventId") ?? "").trim() || null;
  const clientId = String(fd.get("clientId") ?? "").trim() || null;
  const enquiryId = String(fd.get("enquiryId") ?? "").trim() || null;
  let assigneeId: string | null = String(fd.get("assigneeId") ?? "").trim() || null;
  if (actor.role === "STAFF") assigneeId = actor.id;
  if (assigneeId && !(await db.staffUser.findFirst({ where: { id: assigneeId, active: true } }))) assigneeId = null;

  const created = await db.task.create({ data: { title: parsed.data.title, dueAt: due, priority: parsed.data.priority, assigneeId, eventId, clientId, enquiryId } });
  await audit({ id: actor.id }, "task.created", "Task", created.id, { title: created.title });
  await logActivity("NOTE", `Task added: ${created.title}`, { eventId, clientId, enquiryId }, actor.id);
  return created;
}

export async function toggleTaskDone(actor: { id: string; role?: StaffRole }, taskId: string, done: boolean) {
  const db = getPrisma();
  const existing = await db.task.findUnique({ where: { id: taskId } });
  if (!existing) throw new Error("That task does not exist.");
  if (actor.role === "STAFF" && existing.assigneeId !== actor.id) {
    const event = existing.eventId ? await db.event.findUnique({ where: { id: existing.eventId }, select: { ownerId: true } }) : null;
    if (event?.ownerId !== actor.id) throw new Error("This task is not assigned to you.");
  }
  const updated = await db.task.update({ where: { id: taskId }, data: { doneAt: done ? new Date() : null } });
  await audit({ id: actor.id }, done ? "task.done" : "task.reopened", "Task", taskId);
  await logActivity("NOTE", done ? `Task done: ${updated.title}` : `Task reopened: ${updated.title}`, { eventId: existing.eventId, clientId: existing.clientId, enquiryId: existing.enquiryId }, actor.id);
  return updated;
}
