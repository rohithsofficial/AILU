import { describe, expect, it } from "vitest";
import { TAP_SLOP, isHiddenDrag, trackPress } from "./levelView";

const press = { x: 100, y: 400, moved: false, sideways: false };

describe("levelView", () => {
  it("treats a small wobble as a tap", () => {
    const p = trackPress(press, 103, 404);
    expect(p.moved).toBe(false);
    expect(isHiddenDrag(p)).toBe(false);
  });

  it("flags an up or down drag that the engine cannot see", () => {
    const p = trackPress(press, 101, 400 - TAP_SLOP * 10);
    expect(p.moved).toBe(true);
    expect(p.sideways).toBe(false);
    expect(isHiddenDrag(p)).toBe(true);
  });

  it("leaves a sideways drag to the engine, even if the finger also moved up", () => {
    const p = trackPress(trackPress(press, 160, 300), 100, 400);
    expect(p.sideways).toBe(true);
    expect(isHiddenDrag(p)).toBe(false);
  });
});
