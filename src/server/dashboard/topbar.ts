import type { Staff } from "@/lib/authz";
import { getPrisma } from "@/lib/db";
import { addDays, indiaDayStart } from "@/lib/dates";

/** The number on the "My tasks" button in the top bar: my open tasks due today or earlier. */
export async function myTasksDueCount(staff: Staff, now = new Date()) {
  const tomorrow = addDays(indiaDayStart(now), 1);
  return getPrisma().task.count({ where: { assigneeId: staff.id, doneAt: null, dueAt: { lt: tomorrow } } });
}
