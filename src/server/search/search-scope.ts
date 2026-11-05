import type { StaffRole } from "@prisma/client";
import { can } from "@/lib/permissions";
import { normalizePhone } from "@/lib/validation";

export const SEARCH_GROUPS = ["clients", "events", "enquiries", "vendors", "partners", "applications", "team"] as const;
export type SearchGroup = (typeof SEARCH_GROUPS)[number];

export function allowedSearchGroups(role: StaffRole): SearchGroup[] {
  return SEARCH_GROUPS.filter((group) => {
    if (group === "clients") return can(role, "clients.read");
    if (group === "events") return can(role, "events.read");
    if (group === "enquiries") return can(role, "inbox.read");
    if (group === "vendors") return can(role, "vendors.read");
    if (group === "partners") return can(role, "partners.read");
    if (group === "applications") return can(role, "applications.read");
    return can(role, "team.read");
  });
}

export function phoneSearchTerm(query: string): string | null {
  const digits = query.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return normalizePhone(digits);
}

export function dashboardSectionAccess(role: StaffRole) {
  return {
    events: can(role, "events.read"),
    tasks: can(role, "tasks.read"),
    enquiries: can(role, "inbox.read"),
    finance: can(role, "finance.read"),
    applications: can(role, "applications.read"),
    partners: can(role, "partners.read"),
    commissions: can(role, "commissions.read"),
  };
}
