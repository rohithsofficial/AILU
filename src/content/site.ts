import { BRAND } from "@/lib/brand";
import { EVENT_CATEGORIES } from "@/lib/events";

export const SITE_CONTENT = {
  name: BRAND.name,
  tagline: BRAND.tagline,
  contact: BRAND,
  // TODO(content): needs real information from AILU. No social URLs are published yet.
  socialLinks: [] as { label: string; href: string }[],
  // TODO(content): needs real information from AILU before adding founder/team profiles.
  people: [] as { name: string; role: string; image?: string; alt?: string }[],
  about: [
    "AILU is an event management and celebration company based in Udupi, Karnataka.",
    "We plan personal, wedding, corporate, hosting and anchoring, entertainment, cultural and regional, and community celebrations. We work with North Indian and South Indian traditions and ask each client to share the customs that matter to them.",
    "AILU also creates opportunities to work with the team or refer clients as an external sales partner. Dream support is handled privately; no dream stories are published.",
  ],
  process: [
    { title: "Tell us your idea", body: "Share the occasion, date if known, location, guest estimate, traditions, and services you have in mind." },
    { title: "Shape the plan", body: "AILU reviews the requirements, checks availability, agrees the scope and terms with you, and prepares a tailored quotation." },
    { title: "Confirm together", body: "An enquiry is not a booking. An event is confirmed only after availability, scope, terms, and required payment are agreed." },
  ],
  faqs: [
    { question: "How do I enquire about an event?", answer: "Use the Events page or contact form to share your occasion, date if known, location, guest estimate, and what you need." },
    { question: "What happens after I enquire?", answer: "AILU reviews the details and may contact you to understand the event, check availability, and discuss a suitable plan and quotation." },
    { question: "Does an enquiry confirm my booking?", answer: "No. A booking is confirmed only after availability, scope, terms, and required payment are agreed with AILU." },
    { question: "How much does an event cost?", answer: "Pricing depends on the event and agreed scope. AILU prepares a personalised quotation; this site does not publish unverified prices." },
    { question: "Can I request North Indian or South Indian traditions?", answer: "Yes. Tell AILU which traditions, customs, and programme details matter to you so they can be discussed during planning." },
    { question: "How can I join the AILU team?", answer: "Use the team application form to share your contact details, interests, skills, and relevant experience. Applying does not guarantee employment or an assignment." },
    { question: "How does the sales partner programme work?", answer: "Register as a partner and share your partner ID with someone who enquires. A reward is considered only for a verified, completed, paid booking under terms AILU confirms. Earnings are not guaranteed." },
    { question: "How does AILU handle dreams?", answer: "When the private dream form is open, submissions are reviewed only by authorized OWNER and MANAGER staff and are never published or used as public stories. A parent or guardian must submit and consent for someone under 18. Sharing a dream does not guarantee support; AILU decides based on suitability, safety and available resources. The form is not for emergencies; if anyone is in immediate danger in India, call 112." },
    { question: "How is my information used?", answer: "Form details are stored in AILU's database and used to respond to your enquiry or manage an application or partner registration. See the Privacy page for details." },
    { question: "How do I contact AILU?", answer: `Call or WhatsApp ${BRAND.phone}, or email ${BRAND.email}.` },
  ],
  // The two worlds: "/" is the AILU World, "/classic" is the Normal World home.
  worldTitle: "AILU | Enter the 360° world",
  switch: { toWorld: { href: "/", label: "Enter AILU World" }, toSite: { href: "/classic", label: "Explore Website" } },
  // Real pages listed inside the AILU World.
  worldLinks: [
    { href: "/events", label: "Events" },
    { href: "/join", label: "Join AILU" },
    { href: "/join/partner", label: "Become a partner" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
    { href: "/terms", label: "Terms" },
    { href: "/donate", label: "Donation Box" },
  ],
  world: {
    // The AILU World never collects data. Each in-world form is replaced by a link to the real form.
    forms: {
      enqForm: { lead: "Tell us about your occasion on our enquiry form. No payment is needed to enquire.", href: "/events#enquire", label: "Open the enquiry form", note: "An enquiry is not a confirmed booking." },
      jobForm: { lead: "Introduce yourself on our team application form.", href: "/join/team", label: "Open the team application", note: "Applying does not guarantee employment or an assignment." },
      dreamForm: { lead: "Dream support is handled privately on our dreams page. A parent or guardian must be involved for anyone under 18.", href: "/dreams", label: "Read about private dream support", note: "Dreams are never published. Sharing a dream does not guarantee support." },
    },
    partner: { status: "Open", title: "Sales partners", body: "Introduce clients to AILU with your partner ID. A reward is considered only for a verified, completed, paid booking under terms AILU confirms.", note: "Registration does not guarantee earnings.", href: "/join/partner", label: "Register as a partner" },
    dreamsStatus: "Private",
    dreamsShareLead: "Dreams are read in confidence and never published. The private dream form opens on our dreams page when AILU is ready.",
    dreamsShareNote: "A parent or guardian must be involved for anyone under 18. Please don’t include identity documents or financial details.",
    referral: { eyebrow: "Sales partner programme", title: "Introduce a client.", em: "Under clear terms.", body: "Partners share their partner ID with people who enquire. A reward is considered only for a verified, completed, paid booking, under terms AILU confirms. Registration does not guarantee earnings." },
    policies: {
      title: "A little clarity.", em: "A lot of care.",
      body: "Our privacy notice, website terms and referral policy are on their own pages.",
      links: [{ href: "/privacy", label: "Privacy" }, { href: "/terms", label: "Terms" }, { href: "/referral-policy", label: "Referral policy" }],
    },
  },
  galleries: Object.fromEntries(EVENT_CATEGORIES.map((category) => [category.slug, [] as { src: string; alt: string; caption?: string }[]])) as Record<string, { src: string; alt: string; caption?: string }[]>,
};
