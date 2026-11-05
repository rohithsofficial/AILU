import { describe, expect, it } from "vitest";
import { ATTENTION_THRESHOLDS, buildAttentionItems, calendarMonthGrid, calendarMonthRange, eventOccursOnDay } from "./attention-rules";

const now = new Date("2026-11-03T12:00:00.000Z");
const ago = (ms: number) => new Date(now.getTime() - ms);
const ahead = (ms: number) => new Date(now.getTime() + ms);
const day = 24 * 60 * 60 * 1000;

describe("A4 needs-attention rules", () => {
  it("flags unassigned or unconverted enquiries after 24 hours, strictly beyond the boundary", () => {
    const row = { id: "e1", name: "A", ownerId: null, eventId: null, spam: false, createdAt: ago(ATTENTION_THRESHOLDS.enquiryHours * 60 * 60 * 1000 + 1) };
    expect(buildAttentionItems({ enquiries: [row] }, now).some((item) => item.rule === "Enquiries")).toBe(true);
    expect(buildAttentionItems({ enquiries: [{ ...row, createdAt: ago(24 * 60 * 60 * 1000) }] }, now)).toHaveLength(0);
    expect(buildAttentionItems({ enquiries: [{ ...row, ownerId: "staff" }] }, now).some((item) => item.rule === "Enquiries")).toBe(true);
    expect(buildAttentionItems({ enquiries: [{ ...row, eventId: "event" }] }, now).some((item) => item.rule === "Enquiries")).toBe(true);
    expect(buildAttentionItems({ enquiries: [{ ...row, spam: true }] }, now)).toHaveLength(0);
    expect(buildAttentionItems({ enquiries: [{ ...row, ownerId: "staff", eventId: "event" }] }, now)).toHaveLength(0);
  });

  it("flags sent quotations older than five days, not at the boundary or after a decision", () => {
    const row = { id: "q1", eventId: "event", eventTitle: "Party", status: "SENT", createdAt: ago(5 * day + 1) };
    expect(buildAttentionItems({ quotations: [row] }, now).some((item) => item.rule === "Quotations")).toBe(true);
    expect(buildAttentionItems({ quotations: [{ ...row, createdAt: ago(5 * day) }] }, now)).toHaveLength(0);
    expect(buildAttentionItems({ quotations: [{ ...row, status: "ACCEPTED" }] }, now)).toHaveLength(0);
  });

  it("flags confirmed/planning events within 14 days only when both prep links are missing", () => {
    const row = { id: "v1", title: "Wedding", status: "CONFIRMED", startDate: ahead(14 * day), vendorBookingCount: 0, assignmentCount: 0 };
    expect(buildAttentionItems({ planningEvents: [row] }, now).some((item) => item.rule === "Event preparation")).toBe(true);
    expect(buildAttentionItems({ planningEvents: [{ ...row, startDate: ahead(15 * day) }] }, now)).toHaveLength(0);
    expect(buildAttentionItems({ planningEvents: [{ ...row, vendorBookingCount: 1 }] }, now)).toHaveLength(0);
    expect(buildAttentionItems({ planningEvents: [{ ...row, status: "LEAD" }] }, now)).toHaveLength(0);
  });

  it("shows a due client balance within seven days only for finance viewers", () => {
    const row = { id: "v1", title: "Wedding", startDate: ahead(7 * day), balanceDuePaise: 1 };
    expect(buildAttentionItems({ balancesDue: [row] }, now, true).some((item) => item.rule === "Client balances")).toBe(true);
    expect(buildAttentionItems({ balancesDue: [row] }, now, false)).toHaveLength(0);
    expect(buildAttentionItems({ balancesDue: [{ ...row, startDate: ahead(8 * day) }] }, now, true)).toHaveLength(0);
    expect(buildAttentionItems({ balancesDue: [{ ...row, balanceDuePaise: 0 }] }, now, true)).toHaveLength(0);
  });

  it("flags executed events more than three days after their date", () => {
    const row = { id: "v1", title: "Event", status: "EXECUTED", startDate: ago(4 * day) };
    expect(buildAttentionItems({ executedEvents: [row] }, now).some((item) => item.rule === "Event closing")).toBe(true);
    expect(buildAttentionItems({ executedEvents: [{ ...row, startDate: ago(3 * day) }] }, now)).toHaveLength(0);
    expect(buildAttentionItems({ executedEvents: [{ ...row, status: "COMPLETED" }] }, now)).toHaveLength(0);
    expect(buildAttentionItems({ executedEvents: [{ ...row, startDate: now, executedAt: ago(4 * day) }] }, now).some((item) => item.rule === "Event closing")).toBe(true);
  });

  it("flags linked open tasks more than three days overdue", () => {
    const row = { id: "t1", title: "Call client", dueAt: ago(4 * day), eventId: "v1", clientId: null };
    expect(buildAttentionItems({ overdueTasks: [row] }, now).some((item) => item.rule === "Overdue tasks")).toBe(true);
    expect(buildAttentionItems({ overdueTasks: [{ ...row, dueAt: ago(3 * day) }] }, now)).toHaveLength(0);
    expect(buildAttentionItems({ overdueTasks: [{ ...row, eventId: null }] }, now)).toHaveLength(0);
  });

  it("flags pending partners only after three days", () => {
    const row = { id: "p1", name: "Partner", status: "PENDING", createdAt: ago(3 * day + 1) };
    expect(buildAttentionItems({ pendingPartners: [row] }, now).some((item) => item.rule === "Partners")).toBe(true);
    expect(buildAttentionItems({ pendingPartners: [{ ...row, createdAt: ago(3 * day) }] }, now)).toHaveLength(0);
    expect(buildAttentionItems({ pendingPartners: [{ ...row, status: "APPROVED" }] }, now)).toHaveLength(0);
  });

  it("flags private dreams waiting for review beyond three days without exposing their text", () => {
    const row = { id: "AILU-DRM-000001", status: "SUBMITTED", createdAt: ago(3 * day + 1) };
    const items = buildAttentionItems({ dreams: [row] }, now);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ rule: "Dreams", label: "Private dream submission", href: "/admin/dreams/AILU-DRM-000001" });
    expect(items[0].message).not.toContain("dream text");
    expect(buildAttentionItems({ dreams: [{ ...row, createdAt: ago(3 * day) }] }, now)).toHaveLength(0);
    expect(buildAttentionItems({ dreams: [{ ...row, status: "UNDER_REVIEW" }] }, now)).toHaveLength(0);
  });
});

describe("calendar range rules", () => {
  it("builds a Monday-first six-week grid across month edges", () => {
    const days = calendarMonthGrid("2026-11");
    expect(days).toHaveLength(42);
    expect(days[0]).toBe("2026-10-26");
    expect(days[6]).toBe("2026-11-01");
    expect(days[35]).toBe("2026-11-30");
    expect(days[41]).toBe("2026-12-06");
    expect(calendarMonthRange("2026-11").start.toISOString()).toBe("2026-11-01T00:00:00.000Z");
  });

  it("includes a multi-day event on every date it spans, including month edges", () => {
    const event = { startDate: new Date("2026-10-30T00:00:00.000Z"), endDate: new Date("2026-11-02T00:00:00.000Z") };
    expect(eventOccursOnDay(event, "2026-10-30")).toBe(true);
    expect(eventOccursOnDay(event, "2026-11-01")).toBe(true);
    expect(eventOccursOnDay(event, "2026-11-02")).toBe(true);
    expect(eventOccursOnDay(event, "2026-11-03")).toBe(false);
  });
});
