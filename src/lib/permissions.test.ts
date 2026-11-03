import { describe, expect, it } from "vitest";
import { can, canEditAssignedRecord } from "./permissions";

describe("staff permissions", () => {
  it("limits staff controls to assigned work and blocks owner settings", () => {
    expect(can("STAFF", "events.write")).toBe(true);
    expect(can("STAFF", "staff.manage")).toBe(false);
    expect(can("STAFF", "audit.read")).toBe(false);
    expect(can("OWNER", "staff.manage")).toBe(true);
  });

  it("keeps ACCOUNTS read-only for A1 CRM and hides the inbox", () => {
    expect(can("ACCOUNTS", "clients.read")).toBe(true);
    expect(can("ACCOUNTS", "clients.write")).toBe(false);
    expect(can("ACCOUNTS", "inbox.read")).toBe(false);
    expect(can("ACCOUNTS", "quotations.write")).toBe(false);
  });

  it("lets STAFF edit only records assigned to them", () => {
    expect(canEditAssignedRecord("STAFF", "staff-1", "staff-1")).toBe(true);
    expect(canEditAssignedRecord("STAFF", "staff-1", "staff-2")).toBe(false);
    expect(canEditAssignedRecord("STAFF", "staff-1", null)).toBe(false);
    expect(canEditAssignedRecord("MANAGER", "manager-1", "staff-2")).toBe(true);
    expect(canEditAssignedRecord("ACCOUNTS", "accounts-1", "accounts-1")).toBe(false);
  });

  it("restricts finance writes to the owner and accounts roles", () => {
    expect(can("OWNER", "finance.write")).toBe(true);
    expect(can("ACCOUNTS", "finance.write")).toBe(true);
    expect(can("MANAGER", "finance.read")).toBe(true);
    expect(can("MANAGER", "finance.write")).toBe(false);
    expect(can("STAFF", "finance.read")).toBe(false);
    expect(can("STAFF", "vendors.read")).toBe(true);
  });
});
