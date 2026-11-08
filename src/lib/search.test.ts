import { describe, expect, it } from "vitest";
import { pageNumber, phoneDigits, phoneFilter } from "./search";

describe("CRM list search", () => {
  it("does not search phones for a name (that matched every row before)", () => {
    expect(phoneDigits("Rani")).toBeNull();
    expect(phoneFilter("Rani")).toEqual([]);
  });

  it("searches phones once there are at least 3 digits", () => {
    expect(phoneFilter("98765")).toEqual([{ phone: { contains: "98765" } }]);
    expect(phoneFilter("+91 98765 43210")).toEqual([{ phone: { contains: "919876543210" } }]);
    expect(phoneFilter("AILU-12")).toEqual([]);
  });

  it("makes page numbers from the address bar safe", () => {
    expect(pageNumber("3")).toBe(3);
    expect(pageNumber("-3")).toBe(1);
    expect(pageNumber("1.7")).toBe(1);
    expect(pageNumber("abc")).toBe(1);
    expect(pageNumber(undefined)).toBe(1);
    expect(pageNumber("99999999")).toBe(10000);
  });
});
