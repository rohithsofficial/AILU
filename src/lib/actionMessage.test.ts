import { describe, expect, it, vi } from "vitest";
import { actionMessage } from "./actionMessage";

describe("actionMessage", () => {
  it("shows our own messages as they are", () => {
    expect(actionMessage(new Error("Choose an active vendor."))).toBe("Choose an active vendor.");
  });

  it("throws redirects and not-found again", () => {
    const redirect = Object.assign(new Error("NEXT_REDIRECT"), { digest: "NEXT_REDIRECT;replace;/admin;307;" });
    expect(() => actionMessage(redirect)).toThrow(redirect);
    const notFound = Object.assign(new Error("NEXT_NOT_FOUND"), { digest: "NEXT_NOT_FOUND" });
    expect(() => actionMessage(notFound)).toThrow(notFound);
  });

  it("turns database errors into plain English", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const duplicate = Object.assign(new Error("Unique constraint failed on the fields: (`phone`)"), { name: "PrismaClientKnownRequestError", code: "P2002" });
    expect(actionMessage(duplicate)).toMatch(/already exists/);
    const other = Object.assign(new Error("Invalid `prisma.event.update()` invocation ..."), { name: "PrismaClientValidationError" });
    expect(actionMessage(other)).toBe("Something went wrong. Please try again.");
  });
});
