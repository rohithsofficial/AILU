// No prices or availability are listed on purpose. Add them only once verified.
export type EventCategory = { slug: string; title: string; blurb: string; services: string[] };
export const EVENT_CATEGORIES: EventCategory[] = [
  { slug: "personal-celebrations", title: "Personal celebrations", blurb: "Birthdays, baby showers, anniversaries and all the little-big moments.", services: ["Theme and decor planning", "Hosting", "Entertainment and games", "Photography coordination"] },
  { slug: "wedding-celebrations", title: "Wedding celebrations", blurb: "Engagements, pre-wedding functions and intimate wedding occasions.", services: ["Function planning", "Hosting and anchoring", "Wedding entertainment", "Vendor coordination"] },
  { slug: "corporate-events", title: "Corporate events", blurb: "Company celebrations, launches, employee engagement, annual days and team gatherings.", services: ["Programme flow", "Hosting", "Team activities", "Stage and technical coordination"] },
  { slug: "hosting-anchoring", title: "Hosting & anchoring", blurb: "A warm welcome, a lively room and a programme that flows.", services: ["Event hosting", "Anchoring", "Event-day coordination"] },
  { slug: "personalised-entertainment", title: "Personalised entertainment", blurb: "Dance, singing, games and performances shaped around your people and occasion.", services: ["Dance", "Singing", "Dedication acts", "Interactive games"] },
  { slug: "cultural-regional-celebrations", title: "Cultural & regional celebrations", blurb: "North Indian and South Indian celebrations, each with its own customs, rhythm and style. Tell us the traditions you follow and we plan around them.", services: ["Tradition-aware programme planning", "Hosting and anchoring", "Music, dance and performances", "Coordination with your family or committee"] },
  { slug: "community-cultural-events", title: "Community & cultural events", blurb: "College programmes, reunions, association gatherings and cultural celebrations.", services: ["Programme planning", "Cultural performances", "Hosting", "Coordination"] },
];
export const getCategory = (slug: string) => EVENT_CATEGORIES.find((c) => c.slug === slug);
