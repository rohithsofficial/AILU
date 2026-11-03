import { describe, expect, it } from "vitest";
import { buildConvertedEventData } from "./events";

describe("enquiry conversion event mapping", () => {
  it("prefills an event from the enquiry and keeps it at LEAD", () => {
    const event = buildConvertedEventData({
      id: "AILU-EVT-000001",
      category: "wedding",
      eventDate: "2026-12-20",
      location: "Udupi",
      guests: 120,
      budget: "₹2,00,000",
      services: "Decor, hosting",
      details: "Outdoor venue",
    }, "AILU-CLI-000001", "staff-1", "Wedding for Rani");

    expect(event).toMatchObject({
      clientId: "AILU-CLI-000001",
      enquiryId: "AILU-EVT-000001",
      title: "Wedding for Rani",
      category: "wedding",
      status: "LEAD",
      startDate: new Date("2026-12-20"),
      venueCity: "Udupi",
      guestCount: 120,
      ownerId: "staff-1",
      requirements: "Budget: ₹2,00,000 | Decor, hosting | Outdoor venue",
    });
  });
});
