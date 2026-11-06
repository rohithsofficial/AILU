import { describe, expect, it } from "vitest";
import { QUICK_FLICK, swipeStep } from "./swipe";

describe("swipes", () => {
  it("goes next on a left swipe and back on a right swipe", () => {
    expect(swipeStep(-120, 10, 200)).toBe(1);
    expect(swipeStep(120, -10, 200)).toBe(-1);
  });

  it("ignores taps, slow drags and page scrolling", () => {
    expect(swipeStep(-20, 0, 100)).toBe(0);
    expect(swipeStep(-120, 0, 1500)).toBe(0);
    expect(swipeStep(-80, 300, 200)).toBe(0);
  });

  it("needs a quick flick in the 3D rooms, so a slow drag still looks around", () => {
    expect(swipeStep(-120, 0, 200, QUICK_FLICK)).toBe(1);
    expect(swipeStep(-120, 0, 500, QUICK_FLICK)).toBe(0);
  });
});
