import { describe, expect, it } from "vitest";
import { headingChange, phoneHeading } from "./phoneTurn";

describe("phone turning", () => {
  it("follows the phone as it turns, flat or upright", () => {
    for (const beta of [0, 45, 90]) {
      const turn = headingChange(phoneHeading(0, beta, 0), phoneHeading(350, beta, 0));
      expect(turn).toBeCloseTo((10 * Math.PI) / 180, 5);
    }
  });

  it("stays steady while the phone only tilts", () => {
    expect(headingChange(phoneHeading(40, 10, 0), phoneHeading(40, 85, 0))).toBeCloseTo(0, 5);
  });

  it("takes the short way round", () => {
    expect(headingChange(3.1, -3.1)).toBeCloseTo(2 * Math.PI - 6.2, 5);
    expect(headingChange(-3.1, 3.1)).toBeCloseTo(6.2 - 2 * Math.PI, 5);
  });
});
