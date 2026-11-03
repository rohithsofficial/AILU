import { describe, expect, it } from "vitest";
import { enquiryPrefill } from "./enquiry-prefill";
import { enquirySchema, todayInIndia } from "./validation";

describe("event enquiry input", () => {
  it("prefills a valid category and partner reference, while quietly ignoring invalid values", () => {
    expect(enquiryPrefill(new URLSearchParams("category=wedding-celebrations&ref=AILU-SP-000123"))).toEqual({ category: "wedding-celebrations", referralId: "AILU-SP-000123" });
    expect(enquiryPrefill(new URLSearchParams("category=not-a-category&ref=bad"))).toEqual({ category: undefined, referralId: undefined });
  });

  it("requires contact consent and rejects past event dates using India local date", () => {
    const valid = { name: "Rani", phone: "9876543210", category: "personal-celebrations", location: "Udupi", consent: true };
    expect(enquirySchema.safeParse(valid).success).toBe(true);
    expect(enquirySchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    const yesterday = new Date(`${todayInIndia()}T00:00:00.000Z`);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    expect(enquirySchema.safeParse({ ...valid, eventDate: yesterday.toISOString().slice(0, 10) }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...valid, eventDate: todayInIndia() }).success).toBe(true);
  });
});
