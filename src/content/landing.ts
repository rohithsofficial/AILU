import type { Variant } from "@/lib/experiments";

// Wording for the landing page at /celebrate (see docs/LANDING_PAGE.md).
// Only the hero changes between version A and version B. Everything else is the same,
// so a difference in enquiries can only come from the hero. Keep every line honest:
// no prices, reviews, ratings, booking counts or promises AILU has not confirmed.

export const LANDING_VARIANTS: Record<Variant, { name: string; eyebrow: string; title: string; em: string; body: string; cta: string }> = {
  // A: the feeling. Leads with the brand promise and the emotion of the day.
  a: {
    name: "Feeling",
    eyebrow: "Event planning in Udupi",
    title: "Creating moments.",
    em: "Delivering smiles.",
    body: "Weddings, birthdays, company days and cultural celebrations, planned around your people and your traditions.",
    cta: "Plan my celebration",
  },
  // B: the next step. Leads with what the visitor does and what happens after.
  b: {
    name: "Next step",
    eyebrow: "Udupi event planners",
    title: "Tell us the occasion.",
    em: "We’ll shape the plan.",
    body: "Share your date, place and guest count. AILU reviews it and contacts you with a plan and a tailored quotation.",
    cta: "Get my tailored quote",
  },
};

export const LANDING = {
  title: "Plan your celebration in Udupi",
  description: "Tell AILU about your wedding, birthday, corporate or cultural event in Udupi and coastal Karnataka. No payment to enquire.",
  trust: ["Based in Udupi, Karnataka", "No payment to enquire", "North and South Indian traditions", "A quotation made for your event"],
  occasionsTitle: "What are you celebrating?",
  stepsTitle: "How it works",
  whyTitle: "Why families and teams choose AILU",
  why: [
    { title: "One team for the day", body: "Planning, decor, hosting and performances are coordinated together, so you are not chasing five vendors." },
    { title: "Your traditions, your way", body: "Tell us the customs that matter to your family. We plan the programme around them." },
    { title: "Clear about cost", body: "No fixed packages and no surprise prices. Your quotation depends on the occasion, guests, place and services you choose." },
  ],
  formTitle: "Tell us about your event",
  formBody: "It takes a few minutes. We use these details only to plan with you.",
  faqTitle: "Before you ask",
  faqCount: 3,
  finalTitle: "Your celebration starts with one message.",
  finalBody: "Send the form above, or talk to us on WhatsApp.",
  whatsappLabel: "WhatsApp us",
  callLabel: "Call",
  enquireShort: "Enquire",
};
