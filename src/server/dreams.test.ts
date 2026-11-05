import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getPrisma: vi.fn(), audit: vi.fn() }));
vi.mock("@/lib/db", () => ({ getPrisma: mocks.getPrisma }));
vi.mock("@/lib/audit", () => ({ audit: mocks.audit }));

import { getDreamDetail, listDreams, permanentlyDeleteDream, updateDreamReview } from "./dreams";
import type { Staff } from "@/lib/authz";

const staffFor = (role: Staff["role"]): Staff => ({ id: "staff-1", email: "staff@example.test", name: "Test staff", role, active: true });

describe("private dream services", () => {
  afterEach(() => vi.clearAllMocks());

  it("denies STAFF and ACCOUNTS direct reads and writes before touching the database", async () => {
    const form = new FormData();
    form.set("status", "CLOSED");
    form.set("statusReason", "A reason");
    form.set("internalNotes", "");
    form.set("id", "AILU-DRM-000001");
    form.set("confirmId", "AILU-DRM-000001");
    form.set("reason", "Deletion requested");

    for (const role of ["STAFF", "ACCOUNTS"] as const) {
      const staff = staffFor(role);
      await expect(listDreams(staff, {})).rejects.toThrow("Your role does not allow this action.");
      await expect(getDreamDetail(staff, "AILU-DRM-000001")).rejects.toThrow("Your role does not allow this action.");
      await expect(updateDreamReview(staff, "AILU-DRM-000001", form)).rejects.toThrow("Your role does not allow this action.");
      await expect(permanentlyDeleteDream(staff, form)).rejects.toThrow("Only the owner can permanently delete a dream submission.");
    }
    expect(mocks.getPrisma).not.toHaveBeenCalled();
  });

  it("audits opening a detail with only the actor and reference ID", async () => {
    const dream = { id: "AILU-DRM-000001", dream: "Private text", statusHistory: [] };
    const findUnique = vi.fn().mockResolvedValue(dream);
    mocks.getPrisma.mockReturnValue({ dream: { findUnique } });
    const result = await getDreamDetail(staffFor("MANAGER"), dream.id);
    expect(result).toBe(dream);
    expect(mocks.audit).toHaveBeenCalledTimes(1);
    expect(mocks.audit).toHaveBeenCalledWith(staffFor("MANAGER"), "dream.viewed", "Dream", dream.id);
    expect(JSON.stringify(mocks.audit.mock.calls)).not.toContain(dream.dream);
  });
});
