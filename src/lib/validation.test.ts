import { describe, expect, it } from "vitest";
import { indianPhoneSchema, normalizePhone } from "./validation";

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
