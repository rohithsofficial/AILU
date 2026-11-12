import { BRAND } from "@/lib/brand";
import { EVENT_CATEGORIES } from "@/lib/events";
import { PUBLIC_PAGE_CONTENT } from "@/lib/public-metadata";
import { SITE_CONTENT } from "@/content/site";
import { LEGAL_TEXT } from "@/content/legalText";
import { PAGE_TEXT } from "@/content/pageText";
import { UI_TEXT } from "@/content/uiText";

// Everything the CMS can change, with today's wording as the default. The editor screens are built from the
// shape of this object, so a new key here appears in the CMS without more code.
// Keys named slug, path, kind or scene are fixed. A list that contains one cannot gain or lose items.

const CELEBRATION_TAGLINES = ["Your people, your moment", "A promise, held together", "Made for the whole team", "Give the room a voice", "Let the energy find you", "Every tradition has a rhythm", "A crowd can feel like family"];

export const CMS_DEFAULTS = {
  settings: {
    tagline: BRAND.tagline,
    phone: BRAND.phone,
    email: BRAND.email,
    whatsapp: BRAND.whatsapp,
    whatsappMessage: "Hi AILU, I would like to ask about planning a celebration.",
    socialLinks: SITE_CONTENT.socialLinks,
  },
  banner: { enabled: false, text: "", linkLabel: "", href: "" },
  seo: {
    googleVerificationCode: "",
    defaultShareImage: "/opengraph-image.png",
    pages: Object.entries(PUBLIC_PAGE_CONTENT).map(([path, page]) => ({
      path,
      title: path === "/" ? SITE_CONTENT.worldTitle : page.title,
      description: page.description,
      shareImage: "",
      hideFromGoogle: false,
    })),
  },
  celebrations: {
    items: EVENT_CATEGORIES.map((category, index) => ({
      slug: category.slug,
      title: category.title,
      tagline: CELEBRATION_TAGLINES[index],
      blurb: category.blurb,
      services: category.services,
      seoTitle: "",
      seoDescription: "",
      shareImage: "",
      gallery: [] as { src: string; alt: string; caption: string }[],
    })),
  },
  faqs: { items: SITE_CONTENT.faqs },
  hero: PAGE_TEXT.hero,
  journey: {
    ...PAGE_TEXT.journey,
    chapters: [
      { kind: "event", slug: "personal-celebrations", label: "Personal", cue: "A room full of your people", line: "The ones who make it yours." },
      { kind: "event", slug: "wedding-celebrations", label: "Wedding", cue: "A promise, held together", line: "One day. So many beginnings." },
      { kind: "event", slug: "cultural-regional-celebrations", label: "Culture", cue: "Every tradition has a rhythm", line: "Keep the rituals. Turn up the feeling." },
      { kind: "join", slug: "", label: "Join AILU", cue: "There’s a place in this story for you", line: "Bring your talent. Or bring people together." },
      { kind: "event", slug: "community-cultural-events", label: "Community", cue: "When everyone comes together", line: "Make a whole crowd feel close." },
    ],
  },
  home: {
    ...PAGE_TEXT.home,
    atAGlance: [
      { label: "Based in", value: "Udupi, Karnataka" },
      { label: "Gatherings", value: "Personal to community" },
      { label: "Planning", value: "Shaped around your occasion" },
      { label: "Enquiries", value: "No payment to enquire" },
    ],
    peopleList: ["Hosting and coordination", "Dance and performance", "Music and sound", "Décor and making", "Photography coordination", "Stage and lighting", "Games and participation", "Behind-the-scenes support"],
    traditions: [
      { title: "Coastal Karnataka", detail: "Yakshagana, Pili Vesha and Chande, rooted in the coast." },
      { title: "Kerala", detail: "Kathakali, Chenda and cultural programmes." },
      { title: "South Indian classical", detail: "Bharatanatyam, Kuchipudi and Mohiniyattam." },
      { title: "North and West India", detail: "Bhangra, Garba, Dandiya and Kathak." },
      { title: "Contemporary and fusion", detail: "Contemporary dance, hip-hop, DJs and live music." },
    ],
    ideas: [
      { tag: "Personal celebrations", title: "A little golden gathering", copy: "Warm colour, shared tables and small details shaped around your people." },
      { tag: "Corporate events", title: "Business, with a bright side", copy: "A clear stage, welcoming spaces and a programme planned around the occasion." },
      { tag: "Entertainment", title: "An evening with energy", copy: "Music, movement and moments for guests to share together." },
    ],
    steps: SITE_CONTENT.process,
  },
  eventsPage: PAGE_TEXT.eventsPage,
  eventDetail: {
    ...PAGE_TEXT.eventDetail,
    steps: [
      { title: "Share the occasion", body: "Tell us what you are planning and what matters most to you." },
      { title: "Add the details", body: "Share the date if known, location, guest estimate, customs, and services you need." },
      { title: "Discuss the plan", body: "AILU reviews the request, checks availability, and discusses scope, terms, and a tailored quotation." },
      { title: "Confirm together", body: "An enquiry is not a booking. Planning begins after availability, scope, terms, and required payment are agreed." },
    ],
    checklist: ["Date or date range", "Event location", "Guest estimate", "Budget range if known", "Traditions or customs you follow", "Services you need"],
  },
  about: { ...PAGE_TEXT.about, introText: SITE_CONTENT.about[0], points: SITE_CONTENT.about.slice(1) },
  contact: PAGE_TEXT.contact,
  join: { ...PAGE_TEXT.join, teamPageTitle: "Join the AILU team", partnerPageTitle: "Bring opportunities. Grow together." },
  dreams: { title: "Dreams, handled privately", ...PAGE_TEXT.dreams },
  donate: { title: "The AILU Donation Box", ...PAGE_TEXT.donate },
  faqPage: { title: "Frequently asked questions", ...PAGE_TEXT.faqPage },
  myAilu: { title: "Your AILU story starts soon", ...PAGE_TEXT.myAilu },
  comingSoon: PAGE_TEXT.comingSoon,
  nav: {
    ...PAGE_TEXT.nav,
    destinations: [
      { scene: "discover", label: "Discover", href: "/", cue: "The world of AILU", title: "Wander into the feeling.", copy: "A celebration can begin with a single idea. Find the moment that feels like yours." },
      { scene: "celebrations", label: "Celebrations", href: "/events", cue: "Make a day mean more", title: "Gather around what matters.", copy: "Explore celebrations, traditions and the ways AILU can help bring people together." },
      { scene: "join", label: "Become part of AILU", href: "/join", cue: "Bring your spark", title: "There’s room for your kind of magic.", copy: "Join the team or help people find the celebration they have been dreaming of." },
      { scene: "about", label: "About AILU", href: "/about", cue: "What brings us together", title: "Creating moments. Delivering smiles.", copy: "Meet the people and purpose behind a world built around celebration, opportunity and care." },
    ],
  },
  footer: {
    ...PAGE_TEXT.footer,
    columns: [
      { title: "Explore", links: [{ href: "/events", label: "Events" }, { href: "/about", label: "About" }, { href: "/faq", label: "FAQ" }, { href: "/contact", label: "Contact" }] },
      { title: "Join", links: [{ href: "/join/team", label: "Join the team" }, { href: "/join/partner", label: "Become a partner" }, { href: "/dreams", label: "Dream support" }, { href: "/donate", label: "Donation Box — opening soon" }] },
      { title: "Legal", links: [{ href: "/privacy", label: "Privacy" }, { href: "/terms", label: "Terms" }, { href: "/referral-policy", label: "Referral policy" }] },
    ],
  },
  intro: PAGE_TEXT.intro,
  ui: UI_TEXT,
  world: SITE_CONTENT.world,
  privacy: LEGAL_TEXT.privacy,
  terms: LEGAL_TEXT.terms,
  referralPolicy: LEGAL_TEXT.referralPolicy,
};

export type SiteContent = typeof CMS_DEFAULTS;
export type CmsKey = keyof SiteContent;

export type CmsSectionInfo = { key: CmsKey; label: string; group: string; help: string; ownerPublish?: boolean };

export const CMS_SECTIONS: CmsSectionInfo[] = [
  { key: "settings", group: "Business", label: "Contact details", help: "Phone, email, WhatsApp and social links. These update across the whole website." },
  { key: "banner", group: "Business", label: "Announcement banner", help: "A short message at the top of the website. Tick Enabled to show it." },
  { key: "seo", group: "SEO", label: "SEO for every page", help: "The title and description Google shows, and the image used when a page is shared." },
  { key: "celebrations", group: "Events", label: "Celebrations", help: "The celebration types, their SEO and their photo galleries. Add only real photos you have permission to use." },
  { key: "faqs", group: "Events", label: "FAQs", help: "Questions on the FAQ page. The first five also appear on the home page." },
  { key: "eventsPage", group: "Events", label: "Events page", help: "Wording on the main events page." },
  { key: "eventDetail", group: "Events", label: "Celebration detail pages", help: "Wording shared by all seven celebration pages." },
  { key: "hero", group: "Home", label: "Home top section", help: "The first thing visitors see on the website home page." },
  { key: "journey", group: "Home", label: "Home scroll story", help: "The scrolling celebration story under the top section." },
  { key: "home", group: "Home", label: "Home sections", help: "Everything else on the home page." },
  { key: "about", group: "Pages", label: "About", help: "The About page." },
  { key: "contact", group: "Pages", label: "Contact", help: "The Contact page." },
  { key: "join", group: "Pages", label: "Join, team and partner", help: "The Join page and the team and partner form pages." },
  { key: "dreams", group: "Pages", label: "Dreams", help: "Keep the privacy promise clear. Never publish a person's dream or story.", ownerPublish: true },
  { key: "donate", group: "Pages", label: "Donation Box", help: "No donations are collected. Change this only when that is still true.", ownerPublish: true },
  { key: "faqPage", group: "Pages", label: "FAQ page heading", help: "The heading above the questions." },
  { key: "myAilu", group: "Pages", label: "My AILU", help: "The placeholder page for customer accounts." },
  { key: "comingSoon", group: "Pages", label: "Coming soon", help: "Shown to the public while the site is hidden." },
  { key: "nav", group: "Site parts", label: "Menu", help: "The full-screen menu on the website." },
  { key: "footer", group: "Site parts", label: "Footer", help: "The bottom of every normal page." },
  { key: "ui", group: "Site parts", label: "Buttons, forms and messages", help: "Menu links, form labels, error messages and language notes used across the website." },
  { key: "intro", group: "AILU World", label: "Intro", help: "The welcome screen, and the world and website button names." },
  { key: "world", group: "AILU World", label: "World text", help: "Form cards and policy text inside the world. The 3D scenes stay in code." },
  { key: "privacy", group: "Legal", label: "Privacy policy", help: "Have legal changes checked by a lawyer. Only the owner can publish these.", ownerPublish: true },
  { key: "terms", group: "Legal", label: "Website terms", help: "Have legal changes checked by a lawyer. Only the owner can publish these.", ownerPublish: true },
  { key: "referralPolicy", group: "Legal", label: "Referral policy", help: "Have legal changes checked by a lawyer. Only the owner can publish these.", ownerPublish: true },
];
