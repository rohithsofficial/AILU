import { describe, expect, it } from "vitest";
import { LANDING_TEST, chooseVariant, compareVariants, experimentNote, isBot, pickVariant, readExperimentNote } from "./experiments";

describe("experiments", () => {
  it("splits visitors half and half", () => {
    expect(pickVariant(0)).toBe("a");
    expect(pickVariant(0.49)).toBe("a");
    expect(pickVariant(0.5)).toBe("b");
    expect(pickVariant(0.99)).toBe("b");
  });

  it("keeps a returning visitor on their version", () => {
    expect(chooseVariant({ cookie: "b", random: 0.1 })).toEqual({ variant: "b", assign: false });
  });

  it("gives a new visitor a random version and saves it", () => {
    expect(chooseVariant({ random: 0.7, userAgent: "Mozilla/5.0 (iPhone)" })).toEqual({ variant: "b", assign: true });
  });

  it("ignores a broken cookie", () => {
    expect(chooseVariant({ cookie: "z", random: 0.2 })).toEqual({ variant: "a", assign: true });
  });

  it("lets ?v= force a version", () => {
    expect(chooseVariant({ forced: "B", cookie: "a", random: 0.1 })).toEqual({ variant: "b", assign: true });
    expect(chooseVariant({ forced: "b", cookie: "b", random: 0.1 })).toEqual({ variant: "b", assign: false });
  });

  it("always shows version A to search engines and link previews, without a cookie", () => {
    expect(isBot("Googlebot/2.1")).toBe(true);
    expect(isBot("WhatsApp/2.23")).toBe(true);
    expect(chooseVariant({ userAgent: "Googlebot/2.1", random: 0.9 })).toEqual({ variant: "a", assign: false });
  });

  it("writes and reads the CRM note", () => {
    const note = experimentNote("b");
    expect(note).toBe(`Landing page test ${LANDING_TEST.id}: version B`);
    expect(readExperimentNote(note)).toEqual({ test: LANDING_TEST.id, variant: "b" });
    expect(readExperimentNote("Called the client")).toBeNull();
  });

  it("waits for enough data", () => {
    expect(compareVariants(5, 12)).toMatchObject({ leader: "b", confident: false });
  });

  it("calls a clear winner", () => {
    // 20 vs 40: z = 20 / sqrt(60) = 2.58
    expect(compareVariants(20, 40)).toMatchObject({ leader: "b", confident: true });
  });

  it("does not call a small gap a win", () => {
    // 28 vs 34: z = 6 / sqrt(62) = 0.76
    expect(compareVariants(28, 34)).toMatchObject({ leader: "b", confident: false });
    expect(compareVariants(20, 20)).toMatchObject({ leader: null, confident: false });
  });
});
