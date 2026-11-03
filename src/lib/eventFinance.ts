type PaymentRow = { direction: "IN" | "OUT"; amountPaise: number; vendorBookingId: string | null };
type ExpenseRow = { amountPaise: number; vendorBookingId: string | null };
type BookingRow = { id: string; agreedAmountPaise: number | null };

export function calculateEventFinancials(input: {
  acceptedQuotePaise: number;
  payments: PaymentRow[];
  expenses: ExpenseRow[];
  bookings: BookingRow[];
}) {
  const receivedPaise = input.payments.filter((payment) => payment.direction === "IN").reduce((sum, payment) => sum + payment.amountPaise, 0);
  const vendorCostsByBooking = new Map(input.bookings.map((booking) => [booking.id, booking.agreedAmountPaise ?? 0]));
  const vendorActuals = new Map<string, number>();
  for (const expense of input.expenses) {
    if (expense.vendorBookingId && vendorCostsByBooking.has(expense.vendorBookingId)) {
      vendorActuals.set(expense.vendorBookingId, (vendorActuals.get(expense.vendorBookingId) ?? 0) + expense.amountPaise);
    }
  }
  const vendorCostPaise = [...vendorCostsByBooking].reduce((sum, [bookingId, committed]) => sum + Math.max(committed, vendorActuals.get(bookingId) ?? 0), 0);
  const vendorPaidPaise = input.payments.filter((payment) => payment.direction === "OUT" && payment.vendorBookingId).reduce((sum, payment) => sum + payment.amountPaise, 0);
  const otherExpensePaise = input.expenses.filter((expense) => !expense.vendorBookingId || !vendorCostsByBooking.has(expense.vendorBookingId)).reduce((sum, expense) => sum + expense.amountPaise, 0);
  return {
    quotedPaise: input.acceptedQuotePaise,
    receivedPaise,
    balanceDuePaise: Math.max(0, input.acceptedQuotePaise - receivedPaise),
    vendorCostPaise,
    vendorPaidPaise,
    vendorDuePaise: Math.max(0, vendorCostPaise - vendorPaidPaise),
    otherExpensePaise,
    profitPaise: input.acceptedQuotePaise - vendorCostPaise - otherExpensePaise,
  };
}
