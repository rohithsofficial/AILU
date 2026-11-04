import { describe, expect, it } from "vitest";
import { BODY_HTML } from "./body";
import { WORLD_MARKUP } from "./worldMarkup";

describe("AILU World markup", () => {
  it("contains no form or input that could collect data", () => {
    expect(WORLD_MARKUP).not.toMatch(/<form\b/i);
    expect(WORLD_MARKUP).not.toMatch(/<(input|textarea|select)\b/i);
    expect(WORLD_MARKUP).not.toContain("waForm");
  });

  it("keeps the form ids the engine moves into its card, as links to the real forms", () => {
    for (const [id, href] of [["enqForm", "/events#enquire"], ["jobForm", "/join/team"], ["dreamForm", "/dreams"]]) {
      expect(WORLD_MARKUP).toMatch(new RegExp(`id="${id}"[\\s\\S]{0,400}href="${href}"`));
    }
  });

  it("removes the points preview but keeps the ids the engine looks up", () => {
    expect(WORLD_MARKUP).not.toMatch(/AILU points|hand points|real points|Golden hands|Try the preview|href="#rewards"/i);
    for (const id of ["rewardsView", "hands", "rwFx", "tally", "rwReset", "policiesView", "lantern", "formCard", "formClose"]) {
      expect(WORLD_MARKUP).toContain(`id="${id}"`);
    }
  });

  it("matches the open partner programme and the real policy pages", () => {
    expect(WORLD_MARKUP).not.toMatch(/programme is currently closed|not open yet\. No earnings|Netlify/);
    expect(WORLD_MARKUP).toContain('href="/join/partner"');
    expect(WORLD_MARKUP).toContain('href="/referral-policy"');
    expect(WORLD_MARKUP).toContain("Registration does not guarantee earnings.");
  });

  it("sends in-world action links to real pages", () => {
    expect(WORLD_MARKUP).not.toMatch(/href="#(jobs|apply|dreams|share|enquire|policies)"/);
    expect(BODY_HTML).toMatch(/href="#enquire"/);
  });
});
