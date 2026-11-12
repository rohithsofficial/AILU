// Tests when the intro plays: first visit, then again after INTRO_REPEAT_DAYS.
import { describe, expect, it } from "vitest";
import { INTRO_REPEAT_DAYS, introDue } from "@/lib/worldStart";

const day = 24 * 60 * 60 * 1000;
const now = Date.UTC(2026, 10, 12);

describe("introDue", () => {
  it("plays on a first visit or with an unreadable date", () => {
    expect(introDue(null, now)).toBe(true);
    expect(introDue(Number.NaN, now)).toBe(true);
  });
  it("does not play again soon", () => {
    expect(introDue(now - 1 * day, now)).toBe(false);
    expect(introDue(now - (INTRO_REPEAT_DAYS - 1) * day, now)).toBe(false);
  });
  it("plays again after the repeat time", () => {
    expect(introDue(now - INTRO_REPEAT_DAYS * day, now)).toBe(true);
  });
});
