import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  dbConfigured: vi.fn(() => true),
  checkPublicRateLimit: vi.fn(async (_input: unknown) => ({ allowed: true, retryAfterSeconds: 60 })),
  clientIpFrom: vi.fn(() => "203.0.113.4"),
  hasRecentDuplicateDream: vi.fn(async (_input: unknown) => false),
  createDreamSubmission: vi.fn(async (_input: unknown) => "AILU-DRM-000001"),
}));
vi.mock("@/lib/db", () => ({ dbConfigured: mocks.dbConfigured }));
vi.mock("@/lib/rate-limit", () => ({
  checkPublicRateLimit: mocks.checkPublicRateLimit,
  clientIpFrom: mocks.clientIpFrom,
  PUBLIC_RATE_LIMITS: {
    dreamIp: { route: "dreams-ip", limit: 3, windowMs: 86400000 },
    dreamContact: { route: "dreams-contact", limit: 2, windowMs: 86400000 },
  },
}));
vi.mock("@/server/dreams", () => ({
  hasRecentDuplicateDream: mocks.hasRecentDuplicateDream,
  createDreamSubmission: mocks.createDreamSubmission,
}));
import { POST } from "./route";

describe("POST /api/dreams", () => {
  beforeEach(() => {
    mocks.dbConfigured.mockReturnValue(true);
    mocks.checkPublicRateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 60 });
    mocks.hasRecentDuplicateDream.mockResolvedValue(false);
    mocks.createDreamSubmission.mockResolvedValue("AILU-DRM-000001");
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

  const adult = {
    isMinor: false, displayName: "Riya", contactPhone: "98765 43210", contactEmail: "", city: "Udupi",
    category: "MY_DREAM", dream: "I would love to learn classical dance.", whyItMatters: "", helpNeeded: "",
    consentToContact: true, website: "",
  };
  const request = (body: unknown) => new Request("http://localhost/api/dreams", { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.4" }, body: JSON.stringify(body) });

  it("returns 503 without parsing or saving submissions while the feature is closed", async () => {
    vi.stubEnv("DREAMS_FORM_OPEN", "false");
    const response = await POST(new Request("http://localhost/api/dreams", { method: "POST", body: "not-json" }));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Private dream submissions are not open yet." });
  });

  it("keeps the feature closed when its environment switch is unset", async () => {
    vi.stubEnv("DREAMS_FORM_OPEN", "");
    const response = await POST(new Request("http://localhost/api/dreams", { method: "POST", body: "{}" }));
    expect(response.status).toBe(503);
  });

  it("accepts an adult submission and returns only its private reference ID", async () => {
    vi.stubEnv("DREAMS_FORM_OPEN", "true");
    vi.stubEnv("DATABASE_URL", "configured");
    vi.stubEnv("RATE_LIMIT_SALT", "test-only-salt");
    const response = await POST(request(adult));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: "AILU-DRM-000001" });
    expect(mocks.createDreamSubmission).toHaveBeenCalledWith(expect.objectContaining({ isMinor: false, displayName: "Riya" }));
    expect(mocks.checkPublicRateLimit).toHaveBeenCalledTimes(2);
    expect(mocks.checkPublicRateLimit).toHaveBeenNthCalledWith(2, expect.objectContaining({ route: "dreams-contact", identifier: "phone:+919876543210" }));
  });

  it("submits a minor only through guardian contact fields", async () => {
    vi.stubEnv("DREAMS_FORM_OPEN", "true");
    vi.stubEnv("DATABASE_URL", "configured");
    vi.stubEnv("RATE_LIMIT_SALT", "test-only-salt");
    const minorBase: Record<string, unknown> = { ...adult, isMinor: true, displayName: "", guardianName: "Parent Name", guardianPhone: "98765 43210", guardianConsent: true };
    delete minorBase.contactPhone;
    delete minorBase.contactEmail;
    const response = await POST(request(minorBase));
    expect(response.status).toBe(200);
    expect(mocks.createDreamSubmission).toHaveBeenCalledWith(expect.objectContaining({ isMinor: true, guardianPhone: "98765 43210" }));
    expect(mocks.createDreamSubmission.mock.calls[0][0]).not.toHaveProperty("contactPhone");
    expect(mocks.createDreamSubmission.mock.calls[0][0]).not.toHaveProperty("contactEmail");
    expect(mocks.checkPublicRateLimit).toHaveBeenNthCalledWith(2, expect.objectContaining({ identifier: "phone:+919876543210" }));
  });

  it("rejects sensitive identifiers before saving and returns a duplicate message", async () => {
    vi.stubEnv("DREAMS_FORM_OPEN", "true");
    vi.stubEnv("DATABASE_URL", "configured");
    vi.stubEnv("RATE_LIMIT_SALT", "test-only-salt");
    const sensitive = await POST(request({ ...adult, dream: "My Aadhaar is 1234 5678 9012" }));
    expect(sensitive.status).toBe(400);
    expect(mocks.createDreamSubmission).not.toHaveBeenCalled();

    mocks.hasRecentDuplicateDream.mockResolvedValue(true);
    const duplicate = await POST(request(adult));
    expect(duplicate.status).toBe(409);
    expect((await duplicate.json()).error).toContain("similar dream");
    expect(mocks.createDreamSubmission).not.toHaveBeenCalled();
  });

  it("returns 429 after the IP rate limit is reached", async () => {
    vi.stubEnv("DREAMS_FORM_OPEN", "true");
    vi.stubEnv("DATABASE_URL", "configured");
    vi.stubEnv("RATE_LIMIT_SALT", "test-only-salt");
    mocks.checkPublicRateLimit.mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 3600 });
    const response = await POST(request(adult));
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("3600");
    expect(mocks.createDreamSubmission).not.toHaveBeenCalled();
  });
});
