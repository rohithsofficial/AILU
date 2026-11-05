import type { StaffRole } from "@prisma/client";

// Rules for changing or deleting CRM records. Archive (clients, events, vendors) stays the way to hide
// records with history; these rules cover entries that may be real mistakes, such as an unused vendor.

/** Status lines are history. Other notes can be changed by their author, an owner or a manager. */
export function canChangeNote(staff: { id: string; role: StaffRole }, note: { kind: string; byId: string | null }) {
  if (note.kind === "STATUS") return false;
  if (staff.role === "OWNER" || staff.role === "MANAGER") return true;
  return staff.role === "STAFF" && note.byId === staff.id;
}

/** A booking or assignment with money linked to it must be cancelled, not deleted, so finance stays right. */
export function linkedMoneyError(what: string, links: { payments: number; expenses?: number }) {
  if (links.payments + (links.expenses ?? 0) === 0) return null;
  return `This ${what} has payments or expenses linked to it. Delete those first, or cancel it instead.`;
}

/** A vendor used on any event is part of that event's history, so it can only be archived. */
export function vendorDeleteError(bookings: number) {
  if (bookings === 0) return null;
  return "This vendor is linked to event bookings. Remove those bookings first, or archive the vendor instead.";
}

/** Quotations that were sent or decided on are records of what the client saw. */
export function quotationDeleteError(status: string) {
  return status === "DRAFT" ? null : "Only draft quotations can be deleted.";
}

/** Only local admin paths may be used as the return page after a form. */
export function safeAdminPath(path: string) {
  return /^\/admin(\/[\w\-/]*)?(\?[\w\-=&%]*)?(#[\w-]*)?$/.test(path) ? path : "/admin";
}
