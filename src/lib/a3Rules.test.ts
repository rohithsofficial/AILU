import { describe, expect, it } from "vitest";
import { canConvertApplication, canTransitionCommission, commissionEligibilityIssues, isDuplicateTeamAssignment, partnerStatusError, teamMemberConversionMode } from "./a3Rules";

const eligible = {
  partnerId: "AILU-SP-000001", eventExists: true, partnerExists: true,
  referredPartnerIds: ["AILU-SP-000001"], partnerStatus: "APPROVED", eventStatus: "COMPLETED",
  hasAcceptedQuote: true, balanceDuePaise: 0,
};

describe("A3 workflow rules", () => {
  it("reports each commission eligibility failure clearly", () => {
    expect(commissionEligibilityIssues({ ...eligible, eventExists: false })).toContain("The event was not found.");
    expect(commissionEligibilityIssues({ ...eligible, partnerExists: false })).toContain("The referred sales partner was not found.");
    expect(commissionEligibilityIssues({ ...eligible, referredPartnerIds: [] })).toContain("This event was not referred by the selected partner.");
    expect(commissionEligibilityIssues({ ...eligible, partnerStatus: "SUSPENDED" })).toContain("The sales partner must be approved.");
    expect(commissionEligibilityIssues({ ...eligible, eventStatus: "PLANNING" })).toContain("The event must be completed.");
    expect(commissionEligibilityIssues({ ...eligible, hasAcceptedQuote: false })).toContain("The event needs an accepted quotation.");
    expect(commissionEligibilityIssues({ ...eligible, balanceDuePaise: 1 })).toContain("The accepted quotation must be fully paid before proposing a commission.");
    expect(commissionEligibilityIssues(eligible)).toEqual([]);
  });

  it("allows only strict commission transitions", () => {
    expect(canTransitionCommission("PENDING_APPROVAL", "APPROVED")).toBe(true);
    expect(canTransitionCommission("PENDING_APPROVAL", "REJECTED")).toBe(true);
    expect(canTransitionCommission("APPROVED", "PAID")).toBe(true);
    expect(canTransitionCommission("APPROVED", "REJECTED")).toBe(false);
    expect(canTransitionCommission("PAID", "APPROVED")).toBe(false);
  });

  it("requires a reason for rejection or suspension", () => {
    expect(partnerStatusError("PENDING", "REJECTED", "")).toMatch(/reason/i);
    expect(partnerStatusError("APPROVED", "SUSPENDED", "Policy review")).toBeNull();
    expect(partnerStatusError("APPROVED", "APPROVED", "")).toBeNull();
  });

  it("keeps conversions from rejected applications and reuses a phone match", () => {
    expect(canConvertApplication("NOT_SELECTED")).toBe(false);
    expect(canConvertApplication("CLOSED")).toBe(false);
    expect(canConvertApplication("UNDER_REVIEW")).toBe(true);
    expect(teamMemberConversionMode(null, "AILU-TM-000004")).toBe("link_phone_match");
    expect(teamMemberConversionMode("AILU-TM-000004", "AILU-TM-000004")).toBe("already_linked");
    expect(teamMemberConversionMode(null, null)).toBe("create");
  });

  it("rejects a duplicate event, member and role assignment", () => {
    const rows = [{ eventId: "event-1", teamMemberId: "member-1", role: "Host" }];
    expect(isDuplicateTeamAssignment(rows, { eventId: "event-1", teamMemberId: "member-1", role: " host " })).toBe(true);
    expect(isDuplicateTeamAssignment(rows, { eventId: "event-1", teamMemberId: "member-1", role: "DJ" })).toBe(false);
  });
});
