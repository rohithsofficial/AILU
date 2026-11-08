import { describe, expect, it } from "vitest";
import { addDays, indiaDayStart, todayInIndia } from "./dates";

describe("India dates", () => {
  it("uses the India date, not the UTC date", () => {
    // 20:00 UTC on 7 November is 01:30 on 8 November in India.
    const now = new Date("2026-11-07T20:00:00.000Z");
    expect(todayInIndia(now)).toBe("2026-11-08");
    expect(indiaDayStart(now).toISOString()).toBe("2026-11-08T00:00:00.000Z");
  });

  it("a task due today is not before the start of today, so it is not overdue", () => {
    const now = new Date("2026-11-08T06:00:00.000Z"); // 11:30 in India
    const dueToday = new Date("2026-11-08T00:00:00.000Z");
    expect(dueToday < indiaDayStart(now)).toBe(false);
    expect(new Date("2026-11-07T00:00:00.000Z") < indiaDayStart(now)).toBe(true);
    expect(addDays(indiaDayStart(now), 1).toISOString()).toBe("2026-11-09T00:00:00.000Z");
  });
});
