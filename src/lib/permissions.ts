import type { StaffRole } from "@prisma/client";

export type StaffAction =
  | "dashboard.view"
  | "inbox.read" | "inbox.write"
  | "clients.read" | "clients.write" | "clients.archive"
  | "events.read" | "events.write" | "events.archive"
  | "tasks.read" | "tasks.write"
  | "quotations.read" | "quotations.write"
  | "team.read" | "staff.manage" | "audit.read"
  | "vendors.read" | "vendors.write" | "vendors.note"
  | "finance.read" | "finance.write"
  | "applications.read" | "applications.write"
  | "team.write" | "team.assign"
  | "partners.read" | "partners.write"
  | "commissions.read" | "commissions.propose" | "commissions.approve" | "commissions.mark_paid"
  | "dream.read" | "dream.manage";

const PERMISSIONS: Record<StaffRole, readonly StaffAction[]> = {
  OWNER: ["dashboard.view", "inbox.read", "inbox.write", "clients.read", "clients.write", "clients.archive", "events.read", "events.write", "events.archive", "tasks.read", "tasks.write", "quotations.read", "quotations.write", "team.read", "staff.manage", "audit.read", "vendors.read", "vendors.write", "vendors.note", "finance.read", "finance.write", "applications.read", "applications.write", "team.write", "team.assign", "partners.read", "partners.write", "commissions.read", "commissions.propose", "commissions.approve", "commissions.mark_paid", "dream.read", "dream.manage"],
  MANAGER: ["dashboard.view", "inbox.read", "inbox.write", "clients.read", "clients.write", "events.read", "events.write", "tasks.read", "tasks.write", "quotations.read", "quotations.write", "team.read", "vendors.read", "vendors.write", "vendors.note", "finance.read", "applications.read", "applications.write", "team.write", "team.assign", "partners.read", "partners.write", "commissions.read", "commissions.propose", "dream.read", "dream.manage"],
  STAFF: ["dashboard.view", "inbox.read", "inbox.write", "clients.read", "clients.write", "events.read", "events.write", "tasks.read", "tasks.write", "quotations.read", "quotations.write", "team.read", "vendors.read", "vendors.note", "applications.read", "team.assign", "partners.read"],
  ACCOUNTS: ["dashboard.view", "clients.read", "events.read", "tasks.read", "quotations.read", "vendors.read", "finance.read", "finance.write", "team.read", "partners.read", "commissions.read", "commissions.mark_paid"],
};

export function can(role: StaffRole, action: StaffAction): boolean {
  return PERMISSIONS[role].includes(action);
}

export function canEditAssignedRecord(role: StaffRole, staffId: string, ownerId: string | null | undefined): boolean {
  if (role === "OWNER" || role === "MANAGER") return true;
  return role === "STAFF" && ownerId === staffId;
}
