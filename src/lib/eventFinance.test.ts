import { describe, expect, it } from "vitest";
import { calculateEventFinancials } from "./eventFinance";

describe("event finance totals", () => {
  it("uses integer paise and counts vendor commitments only once in margin", () => {
    const totals = calculateEventFinancials({
      acceptedQuotePaise: 100_000,
      payments: [
        { direction: "IN", amountPaise: 40_000, vendorBookingId: null },
        { direction: "OUT", amountPaise: 10_000, vendorBookingId: "booking-1" },
      ],
      bookings: [{ id: "booking-1", agreedAmountPaise: 25_000 }],
      expenses: [
        { amountPaise: 25_000, vendorBookingId: "booking-1" },
        { amountPaise: 5_000, vendorBookingId: null },
      ],
    });
    expect(totals).toEqual({ quotedPaise: 100_000, receivedPaise: 40_000, balanceDuePaise: 60_000, vendorCostPaise: 25_000, vendorPaidPaise: 10_000, vendorDuePaise: 15_000, otherExpensePaise: 5_000, profitPaise: 70_000 });
  });

  it("does not show negative balances due or vendor dues", () => {
    const totals = calculateEventFinancials({
      acceptedQuotePaise: 10_000,
      payments: [{ direction: "IN", amountPaise: 12_000, vendorBookingId: null }, { direction: "OUT", amountPaise: 8_000, vendorBookingId: "booking-1" }],
      bookings: [{ id: "booking-1", agreedAmountPaise: 5_000 }], expenses: [],
    });
    expect(totals.balanceDuePaise).toBe(0);
    expect(totals.vendorDuePaise).toBe(0);
    expect(totals.profitPaise).toBe(5_000);
  });

  it("uses actual vendor-linked expenses when no committed amount is available", () => {
    const totals = calculateEventFinancials({
      acceptedQuotePaise: 50_000, payments: [], bookings: [{ id: "booking-1", agreedAmountPaise: null }],
      expenses: [{ amountPaise: 8_000, vendorBookingId: "booking-1" }],
    });
    expect(totals.vendorCostPaise).toBe(8_000);
    expect(totals.otherExpensePaise).toBe(0);
    expect(totals.profitPaise).toBe(42_000);
  });
});
