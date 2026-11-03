// Enquiry stage list, in order (stored on every EventEnquiry row).
export const ENQUIRY_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "QUOTATION_PREPARED", "AWAITING_CUSTOMER", "PAYMENT_PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
export type EnquiryStatusValue = (typeof ENQUIRY_STATUSES)[number];
