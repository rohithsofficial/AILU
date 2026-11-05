"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requireRole } from "@/lib/authz";
import { hashPassword, passwordProblem } from "@/lib/password";

const addSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  name: z.string().trim().min(1, "Enter a name").max(80),
  role: z.enum(["OWNER", "MANAGER", "STAFF", "ACCOUNTS"]),
});

const detailsSchema = z.object({ id: z.string().min(1), name: z.string().trim().min(1, "Enter a name").max(80) });
const roleSchema = z.object({ id: z.string().min(1), role: z.enum(["OWNER", "MANAGER", "STAFF", "ACCOUNTS"]) });
const activeSchema = z.object({ id: z.string().min(1), active: z.enum(["yes", "no"]) });

// Guards against locking the team out of the admin.
async function lastOwnerGuard(db: ReturnType<typeof getPrisma>, targetId: string, change: { demote?: boolean; deactivate?: boolean }) {
  const owners = await db.staffUser.findMany({ where: { role: "OWNER", active: true } });
  const isLast = owners.length === 1 && owners[0].id === targetId;
  if (isLast && (change.demote || change.deactivate)) return false;
  return true;
}

function backWith(msg: string) {
  redirect(`/admin/settings/staff?msg=${encodeURIComponent(msg)}`);
}

// redirect() throws a NEXT_REDIRECT error; re-throw it untouched and only surface real failures.
function realMessage(e: unknown): string {
  const digest = (e as { digest?: string })?.digest ?? "";
  if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw e;
  return String((e as Error)?.message ?? "Something went wrong.");
}

export async function addStaffAction(formData: FormData) {
  try {
    const staff = await requireRole(["OWNER"]);
    const parsed = addSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) return backWith(parsed.error.issues[0]?.message ?? "Check the details.");
    const db = getPrisma();
    const exists = await db.staffUser.findUnique({ where: { email: parsed.data.email } });
    if (exists) return backWith("That email is already in the staff list.");
    const password = String(formData.get("password") ?? "");
    const problem = passwordProblem(password);
    if (problem) return backWith(problem);
    await db.staffUser.create({ data: { ...parsed.data, passwordHash: await hashPassword(password), passwordChangedAt: new Date() } });
    await audit(staff, "staff.added", "StaffUser", parsed.data.email, { role: parsed.data.role });
    revalidatePath("/admin/settings/staff");
    backWith(`${parsed.data.email} can now sign in. Share the password privately and ask them to change it.`);
  } catch (e) {
    backWith(realMessage(e));
  }
}

export async function updateStaffNameAction(formData: FormData) {
  try {
    const actor = await requireRole(["OWNER"]);
    const parsed = detailsSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) return backWith(parsed.error.issues[0]?.message ?? "Check the name.");
    const target = await getPrisma().staffUser.update({ where: { id: parsed.data.id }, data: { name: parsed.data.name } });
    await audit(actor, "staff.renamed", "StaffUser", target.email, { name: parsed.data.name });
    revalidatePath("/admin/settings/staff");
    backWith(`Name saved for ${target.email}.`);
  } catch (e) {
    backWith(realMessage(e));
  }
}

// Resetting a password signs that person out everywhere.
export async function setStaffPasswordAction(formData: FormData) {
  try {
    const actor = await requireRole(["OWNER"]);
    const id = String(formData.get("id") ?? "");
    const password = String(formData.get("password") ?? "");
    const problem = passwordProblem(password);
    if (problem) return backWith(problem);
    const target = await getPrisma().staffUser.update({ where: { id }, data: { passwordHash: await hashPassword(password), passwordChangedAt: new Date() } });
    await audit(actor, "staff.password_reset", "StaffUser", target.email);
    revalidatePath("/admin/settings/staff");
    if (target.id === actor.id) redirect("/admin/login?changed=1");
    backWith(`New password set for ${target.email}. Share it privately.`);
  } catch (e) {
    backWith(realMessage(e));
  }
}

export async function changeRoleAction(formData: FormData) {
  try {
    const actor = await requireRole(["OWNER"]);
    const parsed = roleSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) return backWith("Pick a valid role.");
    const db = getPrisma();
    const target = await db.staffUser.findUnique({ where: { id: parsed.data.id } });
    if (!target) return backWith("That staff member no longer exists.");
    if (target.role === "OWNER" && parsed.data.role !== "OWNER" && !(await lastOwnerGuard(db, target.id, { demote: true }))) {
      return backWith("You are the only owner. Promote another owner before demoting this one.");
    }
    await db.staffUser.update({ where: { id: parsed.data.id }, data: { role: parsed.data.role } });
    await audit(actor, "staff.role_changed", "StaffUser", target.email, { role: parsed.data.role });
    revalidatePath("/admin/settings/staff");
    backWith(`${target.email} is now ${parsed.data.role}.`);
  } catch (e) {
    backWith(realMessage(e));
  }
}

export async function setActiveAction(formData: FormData) {
  try {
    const actor = await requireRole(["OWNER"]);
    const parsed = activeSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) return backWith("Could not read that request.");
    const db = getPrisma();
    const target = await db.staffUser.findUnique({ where: { id: parsed.data.id } });
    if (!target) return backWith("That staff member no longer exists.");
    const active = parsed.data.active === "yes";
    if (!active && target.id === actor.id) {
      // Own account: allowed only if another active owner exists (so the system never loses all owners).
      const others = await db.staffUser.count({ where: { role: "OWNER", active: true, id: { not: target.id } } });
      if (others === 0) return backWith("Promote another owner before deactivating your own account.");
    }
    await db.staffUser.update({ where: { id: parsed.data.id }, data: { active } });
    await audit(actor, active ? "staff.activated" : "staff.deactivated", "StaffUser", target.email, { active });
    revalidatePath("/admin/settings/staff");
    backWith(active ? `${target.email} can sign in again.` : `${target.email} no longer has admin access.`);
  } catch (e) {
    backWith(realMessage(e));
  }
}
