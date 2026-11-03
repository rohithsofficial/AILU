// The event pipeline, in order, plus the two dead-end states. One source of truth for UI and validation.
export const EVENT_STATUSES = ["LEAD", "QUOTED", "NEGOTIATION", "CONFIRMED", "PLANNING", "EXECUTED", "COMPLETED", "CANCELLED", "LOST"] as const;
export type EventStatusValue = (typeof EVENT_STATUSES)[number];

export const EVENT_STATUS_LABELS: Record<EventStatusValue, string> = {
  LEAD: "Lead",
  QUOTED: "Quoted",
  NEGOTIATION: "Negotiation",
  CONFIRMED: "Confirmed",
  PLANNING: "Planning",
  EXECUTED: "Executed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  LOST: "Lost",
};
