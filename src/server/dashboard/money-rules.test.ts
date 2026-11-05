import { describe, expect, it } from "vitest";
import { isDueWithinDays, marginForCompletedEvents, outstandingPaise, summarizeDue } from "./money-rules";

describe("A4 dashboard money rules", () => {
  const now = new Date("2026-11-03T12:00:00Z");
  it("calculates client, vendor and team outstanding amounts from agreed and paid paise", () => {
    expect(outstandingPaise(12000, 2500)).toBe(9500);
    expect(outstandingPaise(1000, 2000)).toBe(0);
    expect(outstandingPaise(null, 0)).toBe(0);
  });
  it("totals due balances and sorts events by date", () => {
    const result = summarizeDue([
      { id: "later", duePaise: 500, startDate: new Date("2026-11-18T00:00:00Z") },
      { id: "none", duePaise: 0, startDate: now },
      { id: "soon", duePaise: 250, startDate: new Date("2026-11-06T00:00:00Z") },
      { id: "completed", status: "COMPLETED", duePaise: 50, startDate: new Date("2026-10-20T00:00:00Z") },
    ], now);
    expect(result.totalPaise).toBe(800);
    expect(result.rows.map((row) => row.id)).toEqual(["completed", "soon", "later"]);
    expect(result.withinSevenDays(result.rows[0])).toBe(false);
    expect(result.withinSevenDays(result.rows[1])).toBe(true);
    expect(isDueWithinDays(new Date("2026-11-10T12:00:00Z"), now)).toBe(true);
  });
  it("sums estimates for completed events without floating point currency", () => {
    expect(marginForCompletedEvents([{ acceptedQuotePaise: 10000, vendorCostsPaise: 3000, teamCostsPaise: 1000, commissionCostsPaise: 500, otherExpensesPaise: 250 }])).toBe(5250);
  });
});
