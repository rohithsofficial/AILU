import { describe, expect, it } from "vitest";
import { canTransitionEventStatus } from "./eventStatus";

describe("event status transitions", () => {
  it("allows the planned forward pipeline and cancellation/loss from open stages", () => {
    expect(canTransitionEventStatus("LEAD", "QUOTED")).toBe(true);
    expect(canTransitionEventStatus("NEGOTIATION", "CONFIRMED")).toBe(true);
    expect(canTransitionEventStatus("PLANNING", "LOST")).toBe(true);
    expect(canTransitionEventStatus("QUOTED", "CANCELLED")).toBe(true);
  });

  it("blocks skipped or backward transitions and terminal-state changes", () => {
    expect(canTransitionEventStatus("LEAD", "CONFIRMED")).toBe(false);
    expect(canTransitionEventStatus("CONFIRMED", "QUOTED")).toBe(false);
    expect(canTransitionEventStatus("COMPLETED", "CANCELLED")).toBe(false);
  });
});
