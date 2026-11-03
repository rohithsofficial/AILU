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
Contact: +91 74488 11611 · worldofailu24@gmail.com · WhatsApp https://wa.me/917448811611

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

### Delivery status: **verify first**
Work after the coming-soon hardening was delivered to Rani as patch files. Check whether each is in the repo before assuming:
- Last commit known to include the coming-soon fixes: `cd770da`.
- Scroll logo + skip flight: present if `src/components/NavLogo.tsx` and `src/lib/logoLayers.ts` exist.
- Join forms + referrals: present if `src/app/api/partners/route.ts` and `src/components/forms/PartnerForm.tsx` exist. If present, the migration `add_applications_and_partners` must be created and run (new tables `Application`, `SalesPartner`; new column `EventEnquiry.referredBySpId`).

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
- `Application` (+ `ApplicationStatus`: SUBMITTED, UNDER_REVIEW, SHORTLISTED, CONTACTED, SELECTED, NOT_SELECTED, CLOSED)
- `SalesPartner` (+ `PartnerStatus`: PENDING, APPROVED, REJECTED, SUSPENDED; `phone` unique)
- Phones are normalised to `+91XXXXXXXXXX` by `normalizePhone()` in `src/lib/validation.ts`.

**API routes:** `POST /api/enquiries`, `/api/applications` (one per phone per 30 days), `/api/partners` (one per phone). All validate with Zod on the server, use a hidden honeypot field, and return friendly errors. They return 503 when `DATABASE_URL` is missing.

**Pages:** `/`, `/events`, `/events/[slug]`, `/join`, `/join/team`, `/join/partner`, `/dreams` (info only), `/donate` (info only), `/my-ailu` (placeholder), `/coming-soon`.

---

## 7. Known issues and unverified items

- The authoring sandbox **could not run `prisma generate`** (no access to Prisma's binary host), so Prisma-dependent code was never compiled against a generated client. `npx tsc --noEmit` should be clean once `prisma generate` runs. If it is not, fix it. The most likely spots are `src/lib/db.ts` (adapter setup) and the `$transaction` callbacks.
- Animations (intro flight, scroll logo, hero 3D) were **never viewed in a browser** by the author. Please run them and fix visual issues: hand landing a few pixels off the logo's hand, compact logo spacing (`GAP` in `logoLayers.ts`), mobile performance.
- A production `npm run build` needs network access to Google Fonts (`next/font`).
- No rate limiting on the public forms yet (only a honeypot and duplicate checks).

## 8. Cleanup to do

- Remove Firebase leftovers: `firestore.rules`, `src/lib/firebaseAdmin.ts`, and `npm uninstall firebase-admin` (data is on Neon). Keep the package only if Firebase Auth is later chosen for phone OTP.
- Stop tracking junk: `ZIP FILES/`, `public/brand/Glossy Golden Shaka Hand Icon.png`, `public/brand/ailu-transparent-logo.png`, `public/brand/ailu-hand.svg` (add `ZIP FILES/` to `.gitignore`).
- `README.md` is outdated. Update it from this file.

---

## 9. What to do next (in order)

1. **Sync and verify:** check the delivery status in section 5, run `npx prisma generate`, `npx prisma migrate status`, create/run the pending migration, `npx tsc --noEmit`, `npm run dev`. Submit one test enquiry, application and partner registration.
2. **Admin system = CRM + CMS.** This replaces the earlier "simple admin dashboard" idea. The full plan, data model and phases are in **`CRM_CMS_PLAN.md`** (read it). CRM stores clients, vendors, partners, team members and every event's details, quotes, payments and costs. CMS manages public website content. Start with phase A0 (staff auth, roles, audit log) only, and confirm the open decisions in section 11 of that file first. Keep all authorisation server-side.
3. **Customer accounts:** phone number + OTP login (decision pending: Firebase Auth only for OTP and verify its token on the server, or Auth.js/Better Auth with an Indian SMS provider such as MSG91). Backend-generated user ID `AILU-USER-000001`. "My AILU" dashboard: my enquiries and status, my applications, my partner ID and referrals.
4. **Referral tracking:** show partners their leads and statuses; admin marks a referral qualified only after a verified, completed and paid booking; admin-configurable reward policy (fixed / percentage), approve → paid; no amounts shown until AILU defines the policy.
5. **Private dream submission** (`/dreams`): form + table with consent, guardian consent for under-18s, moderation status, no public display ever, no sensitive data collected.
6. **Donation Box:** only after the legal and payment setup exists. Then Razorpay with transparent copy on who receives funds and how they are reported.
7. **Policy pages:** privacy policy, terms, referral policy (rewards policy only if points are introduced).
8. **Real content:** event photos and short demo videos of how AILU runs events (placeholders only today), confirmed list of North/South Indian traditions AILU can really deliver, real About text.
9. **Hardening:** rate limiting on public forms, security headers, SEO and Open Graph, accessibility pass, production env on Vercel (`COMING_SOON`, `PREVIEW_SECRET`, Neon URLs), launch by setting `COMING_SOON=false`.
10. **Later:** loyalty points (needs a business decision first), "Meet AILU" character and chat (predefined answers first, AI later), WhatsApp/email notifications, payments for bookings.

## 10. Open decisions (ask Rani, do not guess)

- Phone OTP approach (Firebase vs SMS provider).
- Whether to keep loyalty points at all, or only the monetary referral reward.
- Referral reward rules (fixed vs percentage, which event types).
- Legal entity and payment provider for donations.
- When to switch `COMING_SOON` off.
