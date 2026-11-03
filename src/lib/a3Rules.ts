export type CommissionEligibility = {
  partnerId: string;
  eventExists: boolean;
  partnerExists: boolean;
  referredPartnerIds: string[];
  partnerStatus: string | null;
  eventStatus: string | null;
  hasAcceptedQuote: boolean;
  balanceDuePaise: number;
};

export function commissionEligibilityIssues(input: CommissionEligibility): string[] {
  const issues: string[] = [];
  if (!input.eventExists) issues.push("The event was not found.");
  if (!input.partnerExists) issues.push("The referred sales partner was not found.");
  if (input.eventExists && input.partnerExists && !input.referredPartnerIds.includes(input.partnerId)) issues.push("This event was not referred by the selected partner.");
  if (input.partnerExists && input.partnerStatus !== "APPROVED") issues.push("The sales partner must be approved.");
  if (input.eventExists && input.eventStatus !== "COMPLETED") issues.push("The event must be completed.");
  if (input.eventExists && !input.hasAcceptedQuote) issues.push("The event needs an accepted quotation.");
  if (input.eventExists && input.balanceDuePaise > 0) issues.push("The accepted quotation must be fully paid before proposing a commission.");
  return issues;
}

const COMMISSION_TRANSITIONS: Record<string, readonly string[]> = {
  PENDING_APPROVAL: ["APPROVED", "REJECTED"],
  APPROVED: ["PAID"],
  PAID: [],
  REJECTED: [],
};

export function canTransitionCommission(from: string, to: string) {
  return COMMISSION_TRANSITIONS[from]?.includes(to) ?? false;
}

export function partnerStatusError(current: string, next: string, reason: string) {
  const allowed = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];
  if (!allowed.includes(next)) return "Choose a valid partner status.";
  if (current !== next && (next === "REJECTED" || next === "SUSPENDED") && reason.trim().length < 3) return "Add a reason when rejecting or suspending a partner.";
  return null;
}

export function canConvertApplication(status: string) {
  return status !== "NOT_SELECTED" && status !== "CLOSED";
}

export function teamMemberConversionMode(applicationTeamMemberId: string | null, phoneMatchId: string | null): "already_linked" | "link_phone_match" | "create" {
  if (applicationTeamMemberId) return "already_linked";
  if (phoneMatchId) return "link_phone_match";
  return "create";
}

export function isDuplicateTeamAssignment(
  rows: Array<{ eventId: string; teamMemberId: string; role: string }>,
  target: { eventId: string; teamMemberId: string; role: string },
) {
  const key = (value: string) => value.trim().toLocaleLowerCase();
  return rows.some((row) => row.eventId === target.eventId && row.teamMemberId === target.teamMemberId && key(row.role) === key(target.role));
}
