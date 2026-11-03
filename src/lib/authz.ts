import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import type { StaffRole } from "@prisma/client";
import { can, canEditAssignedRecord } from "@/lib/permissions";
export { can, canEditAssignedRecord } from "@/lib/permissions";
export type { StaffAction } from "@/lib/permissions";

// The one place authorisation is enforced (CRM_CMS_PLAN.md section 2).
// Hiding a button is never security: every page / action / route must call one of these helpers.

export type Staff = { id: string; email: string; name: string; role: StaffRole; active: boolean };

export const canWriteCRM = (staff: Staff) => can(staff.role, "clients.write");

/** Reads the session and re-checks the staff record on every call, so deactivating a user cuts access immediately. */
export async function currentStaff(): Promise<Staff | null> {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) return null;
  const db = getPrisma();
  const staff = await db.staffUser.findUnique({ where: { email } });
  if (!staff || !staff.active) return null;
  return { id: staff.id, email: staff.email, name: staff.name, role: staff.role, active: staff.active };
}

/** For server actions / route handlers that allow any active staff member. */
export async function requireStaff(): Promise<Staff> {
  const staff = await currentStaff();
  if (!staff) throw new Error("You are not signed in. Sign in again at /admin/login.");
  return staff;
}

/** For server actions / route handlers: throws when not the right role. */
export async function requireRole(roles: StaffRole[]): Promise<Staff> {
  const staff = await requireStaff();
  if (!roles.includes(staff.role)) throw new Error("Your role does not allow this action.");
  return staff;
}

/** For server components / pages: redirects instead of throwing. */
export async function requireRolePage(roles: StaffRole[]): Promise<Staff> {
  const staff = await currentStaff();
  if (!staff) redirect("/admin/login");
  if (!roles.includes(staff.role)) redirect("/admin/not-allowed");
  return staff;
}

export const isOwner = (staff: Staff) => staff.role === "OWNER";

// STAFF may only edit events assigned to them; OWNER and MANAGER edit anything; ACCOUNTS edits nothing.
export function canEditEvent(staff: Staff, event: { ownerId?: string | null }): boolean {
  return canEditAssignedRecord(staff.role, staff.id, event.ownerId);
}

export function canEditClient(staff: Staff, client: { ownerId?: string | null }): boolean {
  return canEditAssignedRecord(staff.role, staff.id, client.ownerId);
}

export const STAFF_ROLES: StaffRole[] = ["OWNER", "MANAGER", "STAFF", "ACCOUNTS"];
