import { describe, expect, it } from "vitest";
import { enquirySchema, indianPhoneSchema, normalizePhone } from "./validation";

describe("phone validation and normalization", () => {
  it.each(["9876543210", "98765 43210", "+91 98765-43210"]) ("accepts and normalizes %s", (phone) => {
    expect(indianPhoneSchema.safeParse(phone).success).toBe(true);
    expect(normalizePhone(phone)).toBe("+919876543210");
  });

  it("rejects non-Indian or invalid mobile numbers", () => {
    expect(indianPhoneSchema.safeParse("1234567890").success).toBe(false);
    expect(indianPhoneSchema.safeParse("987654321").success).toBe(false);
  });
});

describe("enquiry guests field", () => {
  const base = { name: "Rani", phone: "9876543210", category: "wedding-celebrations", location: "Udupi", consent: true };
  it("accepts an empty guests box (it is optional)", () => {
    const parsed = enquirySchema.safeParse({ ...base, guests: "" });
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.guests).toBeUndefined();
  });
  it("still checks a number that was typed", () => {
    expect(enquirySchema.safeParse({ ...base, guests: "120" }).success).toBe(true);
    expect(enquirySchema.safeParse({ ...base, guests: "0" }).success).toBe(false);
  });
});
