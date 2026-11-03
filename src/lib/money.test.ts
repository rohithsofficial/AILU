import { describe, expect, it } from "vitest";
import { formatINR, parseINRToPaise, quotationTotalPaise, toPaise, toRupees } from "./money";

describe("money helpers", () => {
  it("converts rupees and paise", () => {
    expect(toPaise(123.45)).toBe(12345);
    expect(toRupees(12345)).toBe(123.45);
    expect(parseINRToPaise("₹1,23,456.78")).toBe(12345678);
    expect(parseINRToPaise("12.345")).toBeNull();
  });

  it("formats INR and computes a server-side quotation total", () => {
    expect(formatINR(1234500)).toContain("12,345");
    expect(quotationTotalPaise([{ quantity: 2, unitPricePaise: 10000 }], 1000, 500)).toBe(19500);
  });

  it("rejects quotation totals outside the database integer range", () => {
    expect(() => quotationTotalPaise([{ quantity: 10000, unitPricePaise: 300000 }])).toThrow(/supported range/);
  });
});
