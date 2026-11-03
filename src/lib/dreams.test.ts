import { describe, expect, it } from "vitest";
import { DREAM_CATEGORIES, DREAM_STATUSES, allowedDreamStatuses, dreamStatusNeedsReason, dreamSubmissionAuditDiff, isDreamTransitionAllowed, isRecentDuplicateDream, isNearDuplicateDream, containsSensitiveDreamPattern } from "./dreams";
import { dreamSubmissionSchema } from "./validation";

const adultSubmission = {
  isMinor: false,
  displayName: "Riya",
  contactPhone: "98765 43210",
  contactEmail: "",
  city: "Udupi",
  category: "MY_DREAM",
  dream: "I would love to learn classical dance.",
  whyItMatters: "",
  helpNeeded: "",
  consentToContact: true,
  website: "",
};

describe("private dream submission validation", () => {
  it("accepts an adult with at least one contact method", () => {
    expect(dreamSubmissionSchema.safeParse(adultSubmission).success).toBe(true);
    expect(dreamSubmissionSchema.safeParse({ ...adultSubmission, contactPhone: "", contactEmail: "riya@example.in" }).success).toBe(true);
    expect(dreamSubmissionSchema.safeParse({ ...adultSubmission, contactPhone: "", contactEmail: "" }).success).toBe(false);
  });

  it("requires guardian name, phone and consent for a minor while allowing no child contact fields", () => {
    const minor = { ...adultSubmission, isMinor: true, displayName: "", contactPhone: undefined, contactEmail: undefined, guardianName: "Parent Name", guardianPhone: "98765 43210", guardianConsent: true };
    expect(dreamSubmissionSchema.safeParse(minor).success).toBe(true);
    expect(dreamSubmissionSchema.safeParse({ ...minor, guardianConsent: false }).success).toBe(false);
    expect(dreamSubmissionSchema.safeParse({ ...minor, guardianPhone: "" }).success).toBe(false);
    expect(dreamSubmissionSchema.safeParse({ ...minor, contactPhone: "98765 43210" }).success).toBe(false);
    expect(dreamSubmissionSchema.safeParse({ ...minor, childPhone: "98765 43210" }).success).toBe(false);
  });

  it("enforces categories and text length limits", () => {
    expect(DREAM_CATEGORIES).toHaveLength(7);
    expect(DREAM_STATUSES).toHaveLength(8);
    expect(dreamSubmissionSchema.safeParse({ ...adultSubmission, category: "UNKNOWN" }).success).toBe(false);
    expect(dreamSubmissionSchema.safeParse({ ...adultSubmission, dream: "x".repeat(2001) }).success).toBe(false);
    expect(dreamSubmissionSchema.safeParse({ ...adultSubmission, whyItMatters: "x".repeat(1501) }).success).toBe(false);
    expect(dreamSubmissionSchema.safeParse({ ...adultSubmission, helpNeeded: "x".repeat(1501) }).success).toBe(false);
  });

  it("rejects Aadhaar-like, PAN-like and card-like text while allowing ordinary numbers", () => {
    expect(containsSensitiveDreamPattern("Aadhaar 1234 5678 9012")).toBe(true);
    expect(containsSensitiveDreamPattern("PAN ABCDE1234F")).toBe(true);
    expect(containsSensitiveDreamPattern("Card 4111 1111 1111 1111")).toBe(true);
    expect(containsSensitiveDreamPattern("I need 2 chairs for 3 people in 2027")).toBe(false);
    expect(dreamSubmissionSchema.safeParse({ ...adultSubmission, dream: "My number is 1234 5678 9012" }).success).toBe(false);
  });
});

describe("dream review rules", () => {
  it("only allows the specified status transitions and requires reasons for final decisions", () => {
    expect(allowedDreamStatuses("SUBMITTED")).toEqual(["UNDER_REVIEW", "CLOSED"]);
    expect(isDreamTransitionAllowed("UNDER_REVIEW", "SHORTLISTED")).toBe(true);
    expect(isDreamTransitionAllowed("SHORTLISTED", "IN_PROGRESS")).toBe(true);
    expect(isDreamTransitionAllowed("IN_PROGRESS", "FULFILLED")).toBe(true);
    expect(isDreamTransitionAllowed("SUBMITTED", "FULFILLED")).toBe(false);
    expect(dreamStatusNeedsReason("NOT_POSSIBLE")).toBe(true);
    expect(dreamStatusNeedsReason("CLOSED")).toBe(true);
    expect(dreamStatusNeedsReason("UNDER_REVIEW")).toBe(false);
  });

  it("detects normalized and near-identical repeats within a contact window", () => {
    expect(isNearDuplicateDream("I want to visit my grandmother in Mysuru!", "  i want to visit my grandmother, in Mysuru ")).toBe(true);
    expect(isNearDuplicateDream("I want to visit my grandmother who lives in Mysuru", "I want to visit my grandmother who lives in Mysuru this year")).toBe(true);
    expect(isNearDuplicateDream("I want to learn to dance", "I want to build a garden")).toBe(false);
    const now = new Date("2026-11-03T10:00:00Z");
    const incoming = "I want to visit my grandmother in Mysuru!";
    expect(isRecentDuplicateDream([{ dream: "i want to visit my grandmother, in Mysuru", createdAt: new Date(now.getTime() - 23 * 60 * 60 * 1000) }], incoming, now)).toBe(true);
    expect(isRecentDuplicateDream([{ dream: "i want to visit my grandmother, in Mysuru", createdAt: new Date(now.getTime() - 25 * 60 * 60 * 1000) }], incoming, now)).toBe(false);
  });

  it("keeps submitted text and contact details out of the submission audit payload", () => {
    const diff = dreamSubmissionAuditDiff("MY_DREAM", false);
    expect(diff).toEqual({ status: "SUBMITTED", category: "MY_DREAM", isMinor: false });
    expect(JSON.stringify(diff)).not.toContain(adultSubmission.dream);
    expect(JSON.stringify(diff)).not.toContain(adultSubmission.contactPhone);
  });
});
