import { describe, expect, it } from "vitest";
import { canChangeNote, linkedMoneyError, quotationDeleteError, safeAdminPath } from "./recordRules";

describe("CRM record rules", () => {
  it("lets authors, owners and managers change notes, never status lines", () => {
    const note = { kind: "NOTE", byId: "a" };
    expect(canChangeNote({ id: "a", role: "STAFF" }, note)).toBe(true);
    expect(canChangeNote({ id: "b", role: "STAFF" }, note)).toBe(false);
    expect(canChangeNote({ id: "b", role: "MANAGER" }, note)).toBe(true);
    expect(canChangeNote({ id: "a", role: "ACCOUNTS" }, note)).toBe(false);
    expect(canChangeNote({ id: "a", role: "OWNER" }, { kind: "STATUS", byId: "a" })).toBe(false);
  });

  it("blocks deleting bookings and assignments with money linked", () => {
    expect(linkedMoneyError("booking", { payments: 0, expenses: 0 })).toBeNull();
    expect(linkedMoneyError("booking", { payments: 1, expenses: 0 })).toMatch(/linked/);
    expect(linkedMoneyError("assignment", { payments: 0, expenses: 2 })).toMatch(/linked/);
  });

  it("only deletes draft quotations", () => {
    expect(quotationDeleteError("DRAFT")).toBeNull();
    expect(quotationDeleteError("ACCEPTED")).toMatch(/draft/);
  });

  it("keeps return paths inside the admin", () => {
    expect(safeAdminPath("/admin/events/AILU-EVT-000001#finance")).toBe("/admin/events/AILU-EVT-000001#finance");
    expect(safeAdminPath("https://evil.example")).toBe("/admin");
    expect(safeAdminPath("//evil.example")).toBe("/admin");
    expect(safeAdminPath("/administrator")).toBe("/admin");
  });
});
