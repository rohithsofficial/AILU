import type { StaffRole } from "@prisma/client";

export type StaffAction =
  | "dashboard.view"
  | "inbox.read" | "inbox.write"
  | "clients.read" | "clients.write" | "clients.archive"
  | "events.read" | "events.write" | "events.archive"
  | "tasks.read" | "tasks.write"
  | "quotations.read" | "quotations.write"
  | "team.read" | "staff.manage" | "audit.read";

const PERMISSIONS: Record<StaffRole, readonly StaffAction[]> = {
  OWNER: ["dashboard.view", "inbox.read", "inbox.write", "clients.read", "clients.write", "clients.archive", "events.read", "events.write", "events.archive", "tasks.read", "tasks.write", "quotations.read", "quotations.write", "team.read", "staff.manage", "audit.read"],
  MANAGER: ["dashboard.view", "inbox.read", "inbox.write", "clients.read", "clients.write", "events.read", "events.write", "tasks.read", "tasks.write", "quotations.read", "quotations.write", "team.read"],
  STAFF: ["dashboard.view", "inbox.read", "inbox.write", "clients.read", "clients.write", "events.read", "events.write", "tasks.read", "tasks.write", "quotations.read", "quotations.write", "team.read"],
  ACCOUNTS: ["dashboard.view", "clients.read", "events.read", "tasks.read", "quotations.read"],
};

export function can(role: StaffRole, action: StaffAction): boolean {
  return PERMISSIONS[role].includes(action);
}

export function canEditAssignedRecord(role: StaffRole, staffId: string, ownerId: string | null | undefined): boolean {
  if (role === "OWNER" || role === "MANAGER") return true;
  return role === "STAFF" && ownerId === staffId;
}
