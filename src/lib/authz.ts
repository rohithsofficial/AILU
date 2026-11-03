import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import type { StaffRole } from "@prisma/client";

// The one place authorisation is enforced (CRM_CMS_PLAN.md section 2).
// Hiding a button is never security: every page / action / route must call one of these helpers.

export type Staff = { id: string; email: string; name: string; role: StaffRole; active: boolean };

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

/** For server actions / route handlers: throws when not the right role. */
export async function requireRole(roles: StaffRole[]): Promise<Staff> {
  const staff = await currentStaff();
  if (!staff) throw new Error("You are not signed in. Sign in again at /admin/login.");
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

// Permission table (CRM_CMS_PLAN.md section 3): ACCOUNTS is read-only for CRM data; everyone else may write.
export const canWriteCRM = (staff: Staff) => staff.role !== "ACCOUNTS";

// STAFF may only edit events assigned to them; OWNER and MANAGER edit anything; ACCOUNTS edits nothing.
export function canEditEvent(staff: Staff, event: { ownerId?: string | null }): boolean {
  if (staff.role === "OWNER" || staff.role === "MANAGER") return true;
  if (staff.role === "STAFF") return event.ownerId === staff.id;
  return false; // ACCOUNTS is read-only
}

export const STAFF_ROLES: StaffRole[] = ["OWNER", "MANAGER", "STAFF", "ACCOUNTS"];
