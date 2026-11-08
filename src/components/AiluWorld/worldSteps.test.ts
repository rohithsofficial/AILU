import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ROOMS, findStep, nextLabel, stepBarHtml } from "./worldSteps";

// The stop titles each room builds in engine.ts, in order.
function engineStops() {
  const source = readFileSync(join(__dirname, "engine.ts"), "utf8");
  const parts = source.split(/\n\s+([a-z]+):function\(\)\{/);
  const rooms: Record<string, string[]> = {};
  for (let i = 1; i < parts.length; i += 2) {
    const titles = [...parts[i + 1].matchAll(/stop\(b,[^']*'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1]);
    if (titles.length) rooms[parts[i]] = titles;
  }
  // The culture room builds its stops in a loop from the T1 list.
  const t1 = /var T1=(\[\[[\s\S]*?\]\]);/.exec(source)?.[1];
  if (t1) rooms.culture = (JSON.parse(t1.replace(/'/g, '"')) as string[][]).map((row) => row[0]);
  return rooms;
}

describe("worldSteps", () => {
  const engine = engineStops();

  it.each(Object.entries(ROOMS))("names every stop of the %s room, in the engine's order", (key, room) => {
    expect(room.steps.map((step) => step.title)).toEqual(engine[key]);
  });

  it("finds the room and step for a card title", () => {
    expect(findStep("The mandap")).toMatchObject({ room: ROOMS.wedding, index: 2 });
    expect(findStep("Not a stop")).toBeNull();
  });

  it("marks the current chip and the ones already seen", () => {
    const html = stepBarHtml(ROOMS.wedding, 2);
    expect(html).toContain("Step 3 of 5");
    expect(html.match(/aria-current="step"/g)).toHaveLength(1);
    expect(html.match(/step-chip done/g)).toHaveLength(2);
  });

  it("names the next stop on the next button", () => {
    expect(nextLabel(ROOMS.wedding, 0)).toBe("Next: Aisle");
    expect(nextLabel(ROOMS.wedding, 4)).toBe("Last stop");
  });

  it("escapes labels", () => {
    expect(stepBarHtml(ROOMS.stagenight, 0)).toContain("Sound &amp; light");
  });
});
