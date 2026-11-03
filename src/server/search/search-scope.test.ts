import { describe, expect, it } from "vitest";
import { dashboardSectionAccess, allowedSearchGroups, phoneSearchTerm } from "./search-scope";

describe("A4 role-filtered dashboard and search", () => {
  it.each(["OWNER", "MANAGER", "STAFF", "ACCOUNTS"] as const)("applies only current role permissions for %s", (role) => {
    const access = dashboardSectionAccess(role);
    expect(access.finance).toBe(role !== "STAFF");
    expect(allowedSearchGroups(role).includes("applications")).toBe(role !== "ACCOUNTS");
    expect(allowedSearchGroups(role).includes("enquiries")).toBe(role !== "ACCOUNTS");
    expect(access.events).toBe(true);
    expect(access.tasks).toBe(true);
    expect(access.commissions).toBe(role === "OWNER" || role === "MANAGER" || role === "ACCOUNTS");
    expect(access.partners).toBe(true);
    expect(access.applications).toBe(role !== "ACCOUNTS");
    expect(allowedSearchGroups(role)).toEqual(role === "ACCOUNTS" ? ["clients", "events", "vendors", "partners", "team"] : ["clients", "events", "enquiries", "vendors", "partners", "applications", "team"]);
  });

  it("normalizes local and +91 formatted phone searches to the same stored number", () => {
    expect(phoneSearchTerm("9876543210")).toBe("+919876543210");
    expect(phoneSearchTerm("98765 43210")).toBe("+919876543210");
    expect(phoneSearchTerm("+91 98765-43210")).toBe("+919876543210");
    expect(phoneSearchTerm("AILU-CLI-000001")).toBeNull();
  });
});
