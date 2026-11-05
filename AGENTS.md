# AILU website: project context and handoff

This file is for an AI coding agent (OpenCode). Read all of it before changing anything.
Place it at the repo root as `AGENTS.md` (OpenCode loads that name automatically).

Repo: https://github.com/rohithsofficial/AILU (branch `main`)
Owner/developer: Rani (freelance developer, EmYou Media), building this for the AILU team.
Note: Rani often sends dictated (voice-to-text) messages with typos. Interpret the intent, and keep replies short and practical.

---

## 1. What AILU is

AILU is an event management and celebration company in Udupi, Karnataka, India.
Tagline: **"Creating Moments. Delivering Smiles."**
Contact: +91 82967 93486 · worldofailu24@gmail.com · WhatsApp https://wa.me/918296793486

The site is meant to feel like entering the world of AILU: premium, emotional, friendly. It is not a generic event marketplace.

### The vision (from the AILU team, in their words, summarised)
1. **Opening:** a hand symbol appears first, then the logo is revealed. Then a welcome message and what AILU does. Then the visitor tells us who they are and what they want. Two entry options: **"I am looking for events"** and **"I want to join AILU"**.
2. **About AILU:** events, opportunities, and supporting people's dreams.
3. **Events:** showcase events from across India (North Indian and South Indian, different cultures and traditions), event categories, services, demonstrations of how AILU organises events. People submit enquiries and AILU plans with them.
4. **Join AILU:** (a) join the team via an application form; (b) become an **external sales partner**: refer clients, and receive a **monetary reward when the referred client successfully books**.
5. **Donation Box:** people contribute money to help individuals in need.
6. **Fulfil Your Dreams:** people share dreams; if AILU can help, it helps **privately**. Stories are **never publicised**. Dignity and privacy first.
7. Overall: events, opportunities, rewards for referrals, donations, private dream support.

The original long brief also had loyalty points, an AI character ("Meet AILU"), public "dreams made possible" stories, and a big admin dashboard. The later vision above overrides it where they conflict (for example: **no public dream stories**; points are **not built** and undecided).

---

## 2. Non-negotiable rules

**Prisma / database (Rani fixed these by hand. Do not undo them):**
- Prisma is **7.x** (CLI 7.10.1). **Never upgrade to Prisma 8.** Use the normal `prisma migrate` workflow.
- `prisma.config.ts` loads `.env.local` with dotenv and sets `datasource.url` from `DIRECT_URL`. `prisma/schema.prisma` datasource has **no url / directUrl**. Do not put them back.
- Runtime client is built in `src/lib/db.ts` with the **`@prisma/adapter-pg` driver adapter** and the pooled `DATABASE_URL` (Prisma 7 has no built-in engine).
- Database is **Neon Postgres**. `.env.local` holds `DATABASE_URL` (pooled) and `DIRECT_URL` (direct). **Never edit, print, log or commit `.env.local`.** Never expose credentials.
- **Before any migration:** inspect `prisma/schema.prisma`, `prisma/migrations/` and run `npx prisma migrate status`. Preserve the existing database and models. Never reset the database or drop data.
- We chose Neon + Prisma **instead of Firebase**.

**Business honesty (build these into UI copy and logic):**
- Never invent prices, availability, reviews, testimonials, booking counts, rewards, earnings or completed wishes.
- An **enquiry is not a confirmed booking.** Confirmation needs availability, agreed scope/terms and payment.
- An **application is not employment.** A **partner registration does not guarantee earnings.** A reward applies only to a verified, completed booking, under terms AILU confirms.
- **Dreams stay private.** Never publish a dream or story. If the dreamer is under 18, a parent or guardian must be involved. No identity documents, bank details or precise addresses requested.
- **Donations stay switched off** until AILU has a proper legal and payment setup (registered trust or Section 8 company, licensed payment provider). The `/donate` page is information only.
- Collect only what is needed. Visitor profile answers from the intro stay on the device (localStorage) until a consent line and a database table exist.
- Brand colors are fixed: do not introduce new ones.

---

## 3. Brand and design

- Colors: yellow `#F5C400`, black `#111111`, warm white `#FFFDF7` (Tailwind: `ailu-yellow`, `ailu-black`, `ailu-cream`).
- Fonts: Poppins (headings, `font-display`), Inter (body, `font-body`) via `next/font`.
- Logo = the letters **A, I, L** plus a **golden "I love you" hand that acts as the "U"**, with a gold heart under the A. White letters, so the logo only works on **dark** backgrounds (the navbar is dark for this reason).
- Assets in `public/brand/`:
  - `ailu-logo.png` (1400×468): full logo.
  - `ailu-hand.png` (1000×750): standalone hand icon (used in intro and hero).
  - `logo-a.png`, `logo-il.png`, `logo-hand.png`: the logo cut into three transparent pieces (see section 6). Boxes are defined in `src/lib/logoLayers.ts`.
- Favicons in `src/app/`: `favicon.ico`, `icon.png`, `apple-icon.png`.
- Look: dark hero with golden glow and a floating 3D hand, yellow ticker, dark glass navbar, black cards that glow on hover, scroll reveals. Dark `PageHero` band on inner pages.

---

## 4. Tech stack

Next.js 14 (App Router, `src/`), React 18, TypeScript, Tailwind 3, Framer Motion, Three.js + React Three Fiber + Drei (3D is lazy-loaded and has a 2D fallback), Zod, Prisma 7 + Neon Postgres.

Env vars (see `.env.example`; real values live only in `.env.local` / Vercel):
- `DATABASE_URL`, `DIRECT_URL`: Neon (pooled / direct).
- `COMING_SOON` (`true` hides the site), `PREVIEW_SECRET` (long random string).
- `NEXT_PUBLIC_WHATSAPP_NUMBER` (optional, digits with country code; falls back to `lib/brand.ts`).

Commands: `npm install` · `npx prisma generate` · `npx prisma migrate status` · `npx prisma migrate dev --name <name>` · `npm run dev` · `npm run build` · `npx tsc --noEmit`

---

## 5. What has been built (chronological)

1. **Phase 1 starter:** brand tokens, home, events list and per-category detail pages (no prices), contact footer, enquiry form with server validation and spam trap, IDs like `AILU-EVT-000001` created in a DB transaction from an auto-increment `seq`.
2. **Firebase replaced by Neon + Prisma** (Prisma 7 fixes by Rani, see rules above).
3. **Vision update:** intro reordered (hand first); `/join`, `/dreams`, `/donate` pages; "Cultural & regional celebrations" category; real logo and hand assets added.
4. **Premium redesign:** dark navbar with large logo, new hero, ticker, reveals, dark page headers.
5. **Intro "hand flies to the logo":** hand in the middle, welcome lines, optional "tell us about you" (name, city, who you are), two buttons. On either button **or "Skip intro"** the hand flies to the logo in the navbar, then the logo wipes in left to right.
6. **Coming-soon mode** (Rani added, then hardened): `COMING_SOON=true` redirects everyone to `/coming-soon`; `/?preview=<PREVIEW_SECRET>` sets an httpOnly cookie to bypass. `/api/*` returns 503 while hidden. `X-Robots-Tag: noindex` on the page. `SiteChrome` hides intro, navbar and footer on `/coming-soon`.
7. **Scroll logo:** on scroll the "I" and "L" fold away and the hand slides left beside the "A" (first and last parts remain). Reverses at the top.
8. **Join forms + referrals:** `/join/team` (applications, IDs `AILU-APP-000001`) and `/join/partner` (registration, IDs `AILU-SP-000001`, status starts `PENDING`); optional partner ID on the event enquiry form, recorded as `referredBySpId` (ignored if the partner is rejected/suspended or the phone matches the partner's own).
9. **CRM foundation (A0):** Google OAuth allowlist with first-owner bootstrap only while `StaffUser` is empty, active staff and current roles rechecked from the database, owner-only staff management and paginated audit log, responsive standalone admin shell.
10. **CRM core (A1):** inbox filters and enquiry conversion in a transaction; assigned clients with contacts, tasks and activity history; event pipeline, transition rules, quotations with server-computed integer-paise totals and one accepted version per event; task views and role checks. A1 records are private to staff.
11. **CRM vendors and finance (A2):** vendor directory, event vendor bookings, integer-paise client/vendor payments and expenses, role-restricted event finance summary. No bank account details are collected; UPI IDs are owner/accounts-only.
12. **CRM applications, team, partners and commissions (A3):** application review/conversion, team member directory and event assignments, partner status and referral history, manually entered commissions with eligibility checks and owner approval.
13. **CRM dashboard, calendar and search (A4):** role-aware dashboard and finance widgets, tested needs-attention rules, a filtered month calendar with mobile agenda, and permission-filtered global search. No schema migration or new dependency.
14. **Public website launch pass:** About, Contact, FAQ, Privacy, Terms, and Referral Policy pages; site-wide content source and empty-ready galleries; SEO/social metadata and structured data; robots/sitemap; honest footer/navigation; accessible form changes; 429 form abuse limits; error/loading/404 pages; and launch checklist. The CRM is unchanged except for the additive `RateLimit` table used by the public APIs.
15. **Private "Fulfil Your Dreams" intake:** gated public form with adult/guardian paths, sensitive-pattern rejection, rate limits and duplicate detection; separate dream records and status history; OWNER/MANAGER-only review and access audit; OWNER-only typed-ID deletion; role-scoped dashboard count and needs-attention rule. Dreams are never published or included in global search.

### Delivery status: **A0–A4, public website launch pass, and private dreams workflow implemented on `feat/dreams-private`; launch verification and legal/safeguarding decisions pending**
- Prisma CLI/client 7.10.1; schema has no datasource URL. Eleven additive migrations are applied to the connected Neon database; never reset it.
- `prisma validate`, `prisma generate`, elevated `prisma migrate status`, `npm run typecheck`, and the Vitest suite passed during this delivery.
- Google OAuth sign-in could not be manually exercised without using the configured OAuth account. The code path is ready when the deployment has `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `ADMIN_BOOTSTRAP_EMAIL` configured.
- Production build needs network access for `next/font` to fetch Google Fonts; it fails with `EACCES` when network access is restricted. Do not replace the brand fonts to bypass this. The security-update and dreams-feature builds passed with network access enabled.
- A2 schema, server services and admin pages are implemented. Its additive migration was applied after confirming the seven prior migrations.
- A3 adds applications review and idempotent team-member conversion, team assignment and fee tracking, partner status/history, manual commission proposals, and a commission approval/payment queue. Its additive migration was applied after confirming the eight prior migrations; status confirmed all nine are applied.
- Commission amount and basis are entered manually; no reward formula is assumed. Eligibility requires correct referral attribution, an approved partner, a completed event, an accepted quotation and a fully paid client balance. Owner approves/rejects; proposer cannot approve their own proposal; OWNER/ACCOUNTS records payment. STAFF cannot read commission or team fee amounts.
- A4 adds the role-aware dashboard, all seven threshold-based attention rules, finance due list, month calendar and global search. Dashboard, calendar and search use server-side role scopes. STAFF does not receive finance widgets or amounts. No A4 migration or dependencies were added.
- A4 test coverage includes all attention-rule boundaries, money due/within-seven-day calculations, all four role scopes, phone normalization, and multi-day calendar/month edges.
- The public launch pass added the additive `20261103111506_website_rate_limit` migration. It stores only salted HMAC hashes for IP/phone counters. Enquiries are limited to 5/hour per IP and 3/hour per phone; applications and partner registrations are each limited to 3/day per IP.
- Public enquiry, application, and partner APIs retain honeypot and duplicate checks. Contact-consent requirements are validated server-side; the current CRM models do not retain a separate consent timestamp, which is disclosed in the privacy draft and remains a pre-launch decision.
- Public forms now have an event-enquiry consent checkbox and India-date past-event validation; partner/category URL prefill; inline error descriptions, focusable feedback, and a WhatsApp enquiry follow-up link.
- Added content/metadata, About/Contact/FAQ/legal pages, robots/sitemap, Open Graph image, JSON-LD, 404/error/loading UI, and a floating WhatsApp button. Donation intake remains off; `/my-ailu` is noindex.
- The private dreams feature adds the additive `20261103120225_dreams_private_submissions` migration. The `Dream` table is separate from clients/events and stores guardian contact instead of a child's own contact. `DreamStatusChange` stores status history and is deleted with the Dream row. Migration status confirmed all eleven migrations applied.
- Public dream intake is controlled by `DREAMS_FORM_OPEN`; it defaults to `false` in `.env.example`. When closed, `/dreams` remains information-only and `POST /api/dreams` returns 503. When open, submissions are limited to 3/day per IP and 2/day per phone/email contact, duplicate-checked for 24 hours, and audited without dream text.
- Only OWNER and MANAGER have dream read/manage permissions. STAFF and ACCOUNTS cannot access the list, details, actions, dashboard count, or dream attention rule. Dreams are not in global search or public content. OWNER deletion requires the exact typed reference ID and atomically records an audit entry with the reference ID and reason.
- Dream view, status, notes, reason, submission, and deletion audit records contain no submitted dream text. Admin list pages show metadata only; full details appear only on the restricted detail page.
- Dream form, role boundaries, rate limits, duplicate detection, sensitive-pattern rejection, status rules, dashboard attention and audit minimization have Vitest coverage. Keep `DREAMS_FORM_OPEN=false` until the launch checklist and legal/safeguarding decisions are complete.
- ESLint was added for public code with `next/core-web-vitals` and `jsx-a11y/recommended`. The lint command excludes the existing CRM route group and admin components per the public-only scope.
- Public and private-dream typecheck/lint passed; all 74 Vitest tests passed. Production build passed with network access enabled for Google Fonts. No real-browser/mobile walkthrough has been completed yet. See `docs/LAUNCH_CHECKLIST.md`.
- Authenticated runtime walkthrough for A2–A4 remains pending. The production build still needs Google Fonts network access.

---

## 6. How the key pieces work

**Intro (`src/components/Intro.tsx`)**
- Steps: 0 hand alone → 1 welcome → 2 what we do → 3 "about you" form + two buttons. Skip button always visible.
- `sessionStorage["ailu-intro-seen"]` stops it replaying in the same session. Visitor answers go to `localStorage["ailu-visitor"]` (device only).
- `startFlight()` is shared by the two buttons and Skip: it measures the centre hand and the target `[data-ailu-hand]` in the navbar, animates a fixed `<img>` between them (1.4 s), then sets `html[data-logo="ready"]`, and the logo wipes in (CSS clip-path). `html[data-logo="pending"]` hides the nav logo during the intro.
- Reduced motion: no flight, no 3D, final step shown immediately. `src/lib/device.ts` `canUse3D()` gates WebGL (needs WebGL, >4 cores, >2 GB).
- `HAND_FILL = 0.76`: the standalone hand artwork fills ~76% of its image box; the landing rect is enlarged to compensate.

**Navbar logo (`NavLogo.tsx`, `logoLayers.ts`, `globals.css`)**
- The logo is split into three layers (A, IL, hand), each cropped to its own box in the 1400×468 master. Recombined they match the original exactly.
- `data-compact` (set when `scrollY > 60`) shrinks the container width, fades/squeezes the IL layer, and moves the hand's `left` from its full position to just after the A. The hand's `left` comes from CSS variables, not an inline style, so it can animate.
- If the logo artwork changes, re-cut the layers (they were separated by position + colour; the L's foot overlaps the hand and was handled with a position rule) and update the boxes in `logoLayers.ts`.

**Coming soon (`src/middleware.ts`, `SiteChrome.tsx`)**: described above. Matcher excludes `_next`, favicon, robots.txt and static asset extensions.

**IDs:** each model has `seq Int @unique @default(autoincrement())` and `id String @id`. Create with a temporary id, then update `id` to `AILU-XXX-000001` inside one `$transaction`.

**Data model (`prisma/schema.prisma`)**
- `EventEnquiry` (+ `EnquiryStatus`: SUBMITTED, UNDER_REVIEW, QUOTATION_PREPARED, AWAITING_CUSTOMER, PAYMENT_PENDING, CONFIRMED, COMPLETED, CANCELLED; `referredBySpId`)
- `Application` (+ `ApplicationStatus`: SUBMITTED, UNDER_REVIEW, SHORTLISTED, CONTACTED, SELECTED, NOT_SELECTED, CLOSED; optional team-member link)
- `SalesPartner` (+ `PartnerStatus`: PENDING, APPROVED, REJECTED, SUSPENDED; `phone` unique)
- A3: `TeamMember`, `EventAssignment`, and versioned `Commission` (`PENDING_APPROVAL`, `APPROVED`, `PAID`, `REJECTED`); assignment fees and approved commission costs contribute to event finance.
- CRM additions include `Client.ownerId` for staff assignment and `Activity.enquiryId` for inbox history. These are nullable indexed fields with additive migrations.
- Phones are normalised to `+91XXXXXXXXXX` by `normalizePhone()` in `src/lib/validation.ts`.

**API routes:** `POST /api/enquiries`, `/api/applications` (one per phone per 30 days), `/api/partners` (one per phone). All validate with Zod on the server, use a hidden honeypot field, and return friendly errors. They return 503 when `DATABASE_URL` is missing.

**Pages:** `/`, `/events`, `/events/[slug]`, `/join`, `/join/team`, `/join/partner`, `/dreams` (information-only by default; private form behind `DREAMS_FORM_OPEN`), `/donate` (info only), `/my-ailu` (placeholder), `/coming-soon`.

---

## 7. Known issues and unverified items

- Google OAuth has not been manually tested against the team's Google project.
- Animations (intro flight, scroll logo, hero 3D) were **never viewed in a browser** by the author. Please run them and fix visual issues: hand landing a few pixels off the logo's hand, compact logo spacing (`GAP` in `logoLayers.ts`), mobile performance.
- A production `npm run build` needs network access to Google Fonts (`next/font`); it failed in this environment with `EACCES` while fetching Inter and Poppins.
- Rate limiting is database-backed; production requires `RATE_LIMIT_SALT` to be configured before public forms will accept submissions.
- `npm audit --omit=dev` still reports advisories across Next.js, Zod, glob and minimatch after same-major patching. Current Next 14 and Zod 3 have no fix for all reported ranges; glob/minimatch fixes require a major version. Review an approved major-upgrade path before production. Do not apply `npm audit fix --force` blindly.
- The privacy, terms, and referral policy pages are drafts and need review by an Indian lawyer before launch. Data-retention periods, consent-evidence retention, and response expectations are undecided.
- Real approved event photographs, About/story content, traditions/service details, and official social URLs are still needed.

## 8. Cleanup to do

- Remove Firebase leftovers: `firestore.rules`, `src/lib/firebaseAdmin.ts`, and `npm uninstall firebase-admin` (data is on Neon). Keep the package only if Firebase Auth is later chosen for phone OTP.
- Unused public brand files were removed after confirming they were not referenced by application code: `Glossy Golden Shaka Hand Icon.png`, `ailu-transparent-logo.png`, and `ailu-hand.svg`.
- `README.md` now includes public/admin setup and Google OAuth bootstrap instructions.

---

## 9. What to do next (in order)

1. **Launch verification:** follow `docs/LAUNCH_CHECKLIST.md`; verify forms, mobile/accessibility behavior, Vercel/Neon production configuration, OAuth, rate limits, SEO, and `COMING_SOON=false` only at the end.
2. **Review policies and business details:** lawyer review, data retention, consent evidence, response expectations, referral reward terms, and legal donation setup.
3. **Supply approved content:** About/story, category/traditions information, real photographs with permissions, and official social links.
4. **Runtime verify A2–A4:** with authenticated OWNER, MANAGER, STAFF and ACCOUNTS accounts, walk finance, application conversion, assignments, commission eligibility/approval/payment, dashboard scopes, search visibility, calendar filters, and role boundaries.
5. **Customer accounts:** phone number + OTP login (provider decision pending); "My AILU" dashboard for enquiries, applications, partner ID and referrals.
6. **Dream launch readiness:** lawyer review; decide retention and closed-record policy, grievance contact, guardian verification, which staff may handle minors' dreams, and emergency response. Test adult/guardian submissions and OWNER deletion before setting `DREAMS_FORM_OPEN=true`.
7. **Later:** CMS, reports, loyalty points only after a business decision, "Meet AILU" character/chat, notifications, and customer payments.

## 10. Open decisions (ask Rani, do not guess)

- Phone OTP approach (Firebase vs SMS provider).
- Whether to keep loyalty points at all, or only the monetary referral reward.
- Referral reward rules (fixed vs percentage, which event types).
- Legal entity and payment provider for donations.
- When to switch `COMING_SOON` off.
- Dream-data retention period and how long closed submissions remain.
- Privacy grievance contact and response expectations for dream requests.
- How AILU verifies a parent/guardian relationship and which individual staff may handle minors' dreams.
- What staff should do if a submission describes an emergency or urgent medical/financial crisis.
