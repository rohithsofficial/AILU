import { describe, expect, it } from "vitest";
import { createFrameWatch, FLOOR_RATIO, nextRatio } from "./worldRenderer";

function run(gapMs: number, frames: number) {
  const watch = createFrameWatch();
  let now = 1000, drops = 0;
  for (let i = 0; i < frames; i++) { now += gapMs; if (watch(now)) drops++; }
  return drops;
}

describe("world renderer quality", () => {
  it("keeps quality on a smooth device", () => {
    expect(run(16, 300)).toBe(0);
  });

  it("drops quality when frames stay slow", () => {
    expect(run(33, 100)).toBeGreaterThan(0);
  });

  it("ignores long gaps such as a hidden tab", () => {
    expect(run(1000, 300)).toBe(0);
  });

  it("never goes below the floor", () => {
    let ratio = 1.25;
    for (let i = 0; i < 20; i++) ratio = nextRatio(ratio);
    expect(ratio).toBe(FLOOR_RATIO);
  });
});
