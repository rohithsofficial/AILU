// CRM: task list with views: all, due (today or earlier), overdue (before today) and my tasks.
import { ConfirmButton, EditBox } from "@/components/admin/RecordControls";
import { deleteTaskAction, updateTaskAction } from "../records/actions";
import Link from "next/link";
import { requireRolePage, STAFF_ROLES } from "@/lib/authz";
import { listTasks } from "@/server/tasks";
import { listActiveStaff } from "@/server/inbox";
import { formatIN } from "@/lib/format";
import { createTaskPageAction, toggleTaskPageAction } from "./actions";

export const dynamic = "force-dynamic";

const input = "mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream placeholder:text-ailu-cream/40";

export default async function TasksPage({ searchParams }: { searchParams: { view?: string; msg?: string } }) {
  const staff = await requireRolePage(STAFF_ROLES);
  const view = ["all", "my", "overdue", "due"].includes(searchParams.view ?? "") ? searchParams.view! : "all";
  const [tasks, people] = await Promise.all([listTasks(staff, view), listActiveStaff()]);
  const canEdit = staff.role !== "ACCOUNTS";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="font-display text-2xl font-bold">Tasks</h1><p className="mt-1 text-sm text-ailu-cream/60">Follow-ups across enquiries, clients and events.</p></div>
        <nav aria-label="Task views" className="flex gap-2 text-sm">
          {["my", "due", "overdue", "all"].map((key) => <Link key={key} href={`/admin/tasks?view=${key}`} aria-current={view === key ? "page" : undefined} className={`rounded-full border px-3 py-1.5 ${view === key ? "border-ailu-yellow text-ailu-yellow" : "border-white/15 text-ailu-cream/70"}`}>{key === "my" ? "My tasks" : key === "due" ? "Due today / overdue" : key === "overdue" ? "Overdue" : "All"}</Link>)}
        </nav>
      </div>
      {searchParams.msg ? <p className="mt-4 rounded-lg bg-ailu-yellow/10 px-4 py-2 text-sm text-ailu-yellow">{searchParams.msg}</p> : null}

      {canEdit ? <form action={createTaskPageAction} className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-[#111114] p-5 sm:grid-cols-2 lg:grid-cols-5">
        <input type="hidden" name="view" value={view} />
        <label className="lg:col-span-2">Task<input name="title" required minLength={2} maxLength={200} className={input} placeholder="Follow up with the client" /></label>
        <label>Due date<input name="dueAt" type="date" className={input} /></label>
        <label>Priority<select name="priority" className={input}><option value="NORMAL" className="text-black">Normal</option><option value="HIGH" className="text-black">High</option><option value="LOW" className="text-black">Low</option></select></label>
        {staff.role !== "STAFF" ? <label>Assignee<select name="assigneeId" className={input}><option value="" className="text-black">Unassigned</option>{people.map((person) => <option key={person.id} value={person.id} className="text-black">{person.name || person.email}</option>)}</select></label> : null}
        <button className="self-end rounded-lg bg-ailu-yellow px-4 py-2 font-semibold text-ailu-black">Add task</button>
      </form> : null}

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
        {tasks.length === 0 ? <p className="p-6 text-sm text-ailu-cream/50">No tasks in this view.</p> : <ul className="divide-y divide-white/10">
          {tasks.map((task) => <li key={task.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            {canEdit ? <form action={toggleTaskPageAction}><input type="hidden" name="id" value={task.id} /><input type="hidden" name="done" value={task.doneAt ? "no" : "yes"} /><input type="hidden" name="view" value={view} /><button className="rounded border border-white/20 px-2 py-1 text-xs" aria-label={task.doneAt ? "Reopen task" : "Mark task done"}>{task.doneAt ? "Reopen" : "Done"}</button></form> : null}
            <div className="min-w-48 flex-1"><p className={task.doneAt ? "line-through text-ailu-cream/50" : "font-medium"}>{task.title}</p><p className="mt-1 flex flex-wrap gap-x-3 text-xs text-ailu-cream/50">
              {task.eventId ? <Link className="text-ailu-yellow hover:underline" href={`/admin/events/${task.eventId}`}>Event {task.eventId}</Link> : null}
              {task.clientId ? <Link className="text-ailu-yellow hover:underline" href={`/admin/clients/${task.clientId}`}>Client {task.clientId}</Link> : null}
              {task.enquiryId ? <Link className="text-ailu-yellow hover:underline" href={`/admin/inbox/${task.enquiryId}`}>Enquiry {task.enquiryId}</Link> : null}
            </p></div>
            <span className="text-xs text-ailu-cream/60">{task.assigneeName}</span>
            <span className={`text-xs ${!task.doneAt && task.dueAt && task.dueAt < new Date() ? "text-red-400" : "text-ailu-cream/60"}`}>{task.dueAt ? formatIN(task.dueAt) : "No due date"}</span>
            <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase">{task.priority}</span>
            {canEdit ? <form action={deleteTaskAction}><input type="hidden" name="id" value={task.id} /><input type="hidden" name="back" value={`/admin/tasks?view=${view}`} /><ConfirmButton label="Delete" message="Delete this task? This cannot be undone." /></form> : null}
            {canEdit ? <EditBox><form action={updateTaskAction} className="grid gap-2 sm:grid-cols-4"><input type="hidden" name="id" value={task.id} /><input type="hidden" name="back" value={`/admin/tasks?view=${view}`} />
              <label className="sm:col-span-2">Task<input name="title" required minLength={2} maxLength={200} defaultValue={task.title} className={input} /></label>
              <label>Due date<input name="dueAt" type="date" defaultValue={task.dueAt ? task.dueAt.toISOString().slice(0, 10) : ""} className={input} /></label>
              <label>Priority<select name="priority" defaultValue={task.priority} className={input}><option value="NORMAL" className="text-black">Normal</option><option value="HIGH" className="text-black">High</option><option value="LOW" className="text-black">Low</option></select></label>
              {staff.role !== "STAFF" ? <label>Assignee<select name="assigneeId" defaultValue={task.assigneeId ?? ""} className={input}><option value="" className="text-black">Unassigned</option>{people.map((person) => <option key={person.id} value={person.id} className="text-black">{person.name || person.email}</option>)}</select></label> : null}
              <button className="self-end rounded-lg border border-ailu-yellow/60 px-3 py-2 text-xs font-semibold text-ailu-yellow">Save task</button>
            </form></EditBox> : null}
          </li>)}
        </ul>}
      </div>
    </div>
  );
}
