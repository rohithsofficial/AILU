import { describe, expect, it } from "vitest";
import { DUMMY_HASH, hashPassword, passwordProblem, verifyPassword } from "./password";

describe("staff passwords", () => {
  it("accepts the right password and rejects a wrong one", async () => {
    const stored = await hashPassword("correct horse battery");
    expect(stored).not.toContain("correct horse");
    expect(await verifyPassword("correct horse battery", stored)).toBe(true);
    expect(await verifyPassword("correct horse battere", stored)).toBe(false);
  });

  it("uses a new salt every time", async () => {
    expect(await hashPassword("same password here")).not.toBe(await hashPassword("same password here"));
  });

  it("never matches the dummy hash or a broken value", async () => {
    expect(await verifyPassword("anything at all", DUMMY_HASH)).toBe(false);
    expect(await verifyPassword("anything at all", "not-a-hash")).toBe(false);
  });

  it("requires a minimum length", () => {
    expect(passwordProblem("short")).toMatch(/at least/);
    expect(passwordProblem("long enough now")).toBeNull();
  });
});

describe("damaged password hash", () => {
  it("reads as a wrong password instead of crashing the login", async () => {
    await expect(verifyPassword("anything-long", "scrypt$abc$8$1$AAAA$AAAA")).resolves.toBe(false);
    await expect(verifyPassword("anything-long", "scrypt$32768$8$1$AAAA$")).resolves.toBe(false);
  });
});
