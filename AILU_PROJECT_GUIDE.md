# AILU Project Guide — Purpose, Features, and Development History

This guide explains what AILU is, what the repository does today, how its main parts fit together, and what has been delivered across the project branches. It is written as a project handoff and an orientation guide for the AILU team.

## 1. AILU in plain language

AILU is an event management and celebration company based in Udupi, Karnataka, India. Its tagline is **“Creating Moments. Delivering Smiles.”** The website is intended to introduce visitors to AILU, showcase celebration services and cultures, and let people enquire or explore ways to join the team.

The software has two connected parts:

1. **Public website:** brand experience, events information, enquiries, team applications, partner registration, and information about private dream support and donations.
2. **Staff CRM:** a private operations tool where authorized staff manage enquiries, clients, events, quotations, tasks, vendors, money records, applications, team assignments, partners, and commissions.

The CRM helps AILU keep business details in shared records instead of relying only on chats, spreadsheets, or memory. A public enquiry becomes a lead that staff can review and, when appropriate, convert into a client and event.

The CRM is not a replacement for accounting software, a public customer account system, an online payment gateway, or a published CMS yet.

## 2. Brand, audience, and promises

- **Audience:** people exploring celebrations, prospective team members, external sales partners, and AILU staff.
- **Brand feel:** premium, emotional, friendly, and rooted in celebrations. It should not feel like a generic event marketplace.
- **Brand colors:** AILU yellow `#F5C400`, black `#111111`, and warm white `#FFFDF7`.
- **Fonts:** Poppins for display headings and Inter for body text.
- **Logo:** white A, I, L and the golden “I love you” hand that forms the U, with a gold heart under the A. It needs a dark background.
- **Contact:** +91 74488 11611 · worldofailu24@gmail.com · [WhatsApp](https://wa.me/917448811611).

Business copy and workflows must stay honest:

- An enquiry is **not** a confirmed booking. AILU confirms only after checking availability, agreeing scope and terms, and receiving payment as required.
- Applying to join is **not** employment. Partner registration does not promise earnings. A referral reward is considered only for a verified completed booking under terms AILU confirms.
- Commission amounts and basis are manually entered. The system does not invent a percentage or reward formula.
- Dreams are private and must never be published as public stories. Applicants under 18 need a parent or guardian involved. Do not collect identity documents, bank details, or precise home addresses for dream submissions.
- Donations are information-only and stay disabled until AILU has the right legal entity and payment setup.
- Do not invent prices, availability, reviews, testimonials, event counts, rewards, earnings, or fulfilled dreams.

## 3. What visitors can use today

Public routes currently include:

| Route | Purpose |
| --- | --- |
| `/` | AILU introduction, brand experience, and paths into the site. |
| `/events` | Browse event categories and information. |
| `/events/[slug]` | Read information for an event category and submit an enquiry. |
| `/join` | Choose between a team application and partner registration. |
| `/join/team` | Submit an application to join the AILU team. |
| `/join/partner` | Register interest as an external sales partner. |
| `/dreams` | Information about private dream support; it is not a public-story feed. |
| `/donate` | Donation information only; no donation collection is enabled. |
| `/my-ailu` | Placeholder for a future customer account experience. |
| `/coming-soon` | Standalone public holding page when coming-soon mode is active. |

The introduction begins with the hand, reveals the AILU welcome, explains the company, and offers “I am looking for events” and “I want to join AILU.” Visitor answers are saved on that device only. The intro is skipped after it has been seen during the browser session. Reduced-motion and limited-device fallbacks avoid requiring 3D animation to use the site.

Coming-soon mode can hide the public website while staff administration remains protected by sign-in. A preview secret can grant a browser a preview cookie. Public APIs return unavailable while the site is hidden. Never put the preview secret in public code or expose `.env.local` values.

## 4. What staff can use today

Staff administration lives under `/admin` and requires Google OAuth plus an active staff record and role in the database. The current navigation covers:

| Area | What staff do there |
| --- | --- |
| Dashboard | Review today's work, upcoming events, enquiry queues, stage counts, attention items, and permitted finance summaries. |
| Inbox | Review website enquiries, filter and assign them, mark spam, and convert a suitable enquiry into a client and event. |
| Clients | View client details, contacts, notes, history, tasks, and related events within role permissions. |
| Events | Track an event from lead through quotation, negotiation, confirmation, planning, execution, and completion; manage event details and related records. |
| Quotations | Create versions and line items; server code calculates totals in integer paise. Only one quote version can be accepted for an event. |
| Tasks | Assign follow-ups and view tasks due today or overdue. |
| Calendar | Browse events by month, status, category, owner, or closed-event visibility. Multi-day events span days. It contains no finance fields. |
| Needs attention | Review actionable queues generated from named time and status rules. |
| Finance | Review role-appropriate client, vendor, and team balances due. |
| Vendors | Keep supplier directory records, contact details, event bookings, and internal notes. |
| Applications | Review applicants and convert a selected applicant into a team member. |
| Team | Maintain team records, event assignments, assignment statuses, and (for eligible roles) fee/payment tracking. |
| Partners | Approve, reject, or suspend partner registrations and view referral history. |
| Commissions | Propose, approve/reject, and record manually calculated referral commission payments under strict role rules. |
| Search | Search permitted CRM records from the top bar or `/admin/search`. |
| Staff settings | OWNER-only management of staff access and the audit log. |

Some features listed in `CRM_CMS_PLAN.md`, such as CMS editing, reports, file storage, customer accounts, and online payments, are future work and are not represented as completed features.

## 5. A lead-to-event workflow

1. A visitor submits an event enquiry on the public website.
2. The server validates the fields, normalizes the phone number, checks a hidden spam-trap field, and stores the enquiry with a human-readable ID such as `AILU-EVT-000001`.
3. If the visitor included a partner ID, the server records it only if that partner is eligible and the phone is not the partner's own number.
4. Staff find the record in the inbox, review it, and assign ownership.
5. Staff convert a suitable enquiry. Conversion creates or reuses a client by normalized phone and creates a linked event in one database transaction.
6. Staff manage event requirements, dates, owner, tasks, quotation versions, vendors, team assignments, payments, and expenses.
7. The event moves through allowed statuses. A quotation is not a confirmed booking by itself; staff still confirm scope, availability, terms, and payment.
8. Completed and paid events can become eligible for a manually proposed partner commission, subject to the A3 checks and OWNER approval.

Other public forms are similarly server-validated. Team applications use IDs like `AILU-APP-000001`; partner records use `AILU-SP-000001`. Application and partner registration each have duplicate checks. These submissions are not promises of hiring or earnings.

## 6. Roles and access boundaries

The staff roles are `OWNER`, `MANAGER`, `STAFF`, and `ACCOUNTS`. All authorization is enforced on the server. Hiding a link or button in the UI is not a security boundary.

| Capability | OWNER | MANAGER | STAFF | ACCOUNTS |
| --- | --- | --- | --- | --- |
| Dashboard | All permitted CRM and finance data | Operational and finance read views | Own/assigned work only; no finance totals | Finance view and assigned permitted records |
| Clients/events/tasks | Full access | Operational access | Restricted to assigned/owned scope | Read access for permitted records |
| Finance records/totals | Read/write | Read | No finance amounts/totals | Read/write where allowed |
| Vendor directory/bookings | Full | Full | Limited operational access; no finance totals | Finance-related access as allowed |
| Applications/team | Full | Operational access | Read/limited access | Hidden |
| Partner commission | Approve/reject | Propose | Hidden | Record approved payment; cannot approve |
| Staff users and audit settings | Owner-only | Hidden | Hidden | Hidden |

Important commission boundaries:

- Eligibility checks referral attribution, approved partner status, completed event, accepted quotation, and fully paid client balance.
- Proposal amount and basis are entered manually; no rate is assumed.
- The person proposing a commission cannot approve their own proposal.
- OWNER approves/rejects. OWNER or ACCOUNTS records payment.
- STAFF cannot read commission values or team assignment fees.

## 7. A4 dashboard, attention, calendar, and search

A4 builds on A0–A3 without changing the database schema.

### Dashboard and finance summaries

- Role-scoped today's tasks and overdue count.
- Events over the coming seven days and the coming 30 days.
- Unassigned enquiries, oldest unconverted enquiries, and clickable event stage counts.
- Existing application, partner, and commission queues when the signed-in role is allowed to see them.
- Client balances, vendor amounts due, team assignment fees due, and completed-event margin estimate only for roles with finance permission.
- Money remains integer paise in storage and calculations. Dashboard money is operational information, not an accounting statement.
- The A4 monthly margin estimate uses completed events whose event start date is in the current month because the current model has no explicit completion date.

### Needs-attention rules

Named thresholds and pure rule tests are in `src/server/dashboard/attention-rules.ts`. The queue highlights stale enquiries, sent quotes waiting for an answer, near-term events without vendor/team preparation, upcoming client balances for finance roles, events left in EXECUTED, overdue tasks, and pending partner applications. The full view is `/admin/attention`.

### Calendar

`/admin/calendar` uses URL filters so the view can be shared or revisited. It supports month navigation, status/category/owner filters, a closed-event toggle, multi-day events, and a mobile agenda. STAFF event scope follows owned events, and the calendar query does not return finance fields.

### Search

The top-bar search waits 300 ms after typing, requires at least two characters, supports normalized phone searches, and returns at most five entries per permitted record group. Search groups and row scope are filtered server-side. Depending on role, groups include clients, events, enquiries, vendors, partners, applications, or team members. It does not return phone values in result details.

## 8. Technical design

- **Framework:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Framer Motion, Three.js, React Three Fiber, and Drei.
- **Backend:** Next.js route handlers and server-side modules under `src/server/`.
- **Validation:** Zod schemas validate public submissions and server-side changes.
- **Authentication:** Auth.js v5 with Google OAuth for staff; roles and active status are read from the database.
- **Database:** Neon PostgreSQL.
- **ORM:** Prisma 7.10.1. Runtime Prisma client uses `@prisma/adapter-pg` with pooled `DATABASE_URL`; `prisma.config.ts` reads `.env.local` and supplies the direct `DIRECT_URL` for migrations.
- **Currency:** INR, represented as integer paise in the database. Do not use floating-point math for money.
- **Dates:** timestamps are stored in UTC and displayed in Asia/Kolkata. Date-only event and task logic should be interpreted in India local calendar days.
- **Audit:** administrative changes are recorded for accountability.
- **Identifiers:** sequential human-readable IDs are assigned transactionally using each model's auto-increment sequence. Child records use generated IDs.
- **Soft deletion:** archive fields are used for key client/vendor/event records to preserve operational history.

### Useful code locations

| Path | Contents |
| --- | --- |
| `src/app/` | Public site, API routes, and staff admin pages. |
| `src/app/(admin)/admin/` | Authenticated CRM pages. |
| `src/components/` | Shared public and admin UI. |
| `src/server/` | Server-only query, mutation, and business-rule modules. |
| `src/lib/authz.ts` and `src/lib/permissions.ts` | Staff access checks and permission definitions. |
| `src/lib/db.ts` | Prisma 7 runtime client and PostgreSQL adapter. |
| `src/lib/validation.ts` | Shared validation and phone normalization. |
| `src/lib/money.ts` and finance helpers | Paise calculations and finance summaries. |
| `src/lib/logoLayers.ts` | Geometry for the split navbar logo. |
| `prisma/schema.prisma` | Current database models and enums. |
| `prisma/migrations/` | Additive database migration history. |
| `public/brand/` | AILU logo and hand assets. |

## 9. Development history across branches

These are the local project branches and the changes they contain. The A4 branch contains the earlier commits in its ancestry, so it is the most complete project branch.

### `main` — public site and CRM foundation

- Created the AILU public site foundation: brand tokens, home, event categories/details, contact content, and server-validated enquiries.
- Added human-readable enquiry IDs and persistent enquiry storage.
- Added coming-soon/preview mode, the AILU hand intro, actual logo assets, and public join/dream/donate information pages.
- Replaced the initial Firebase direction with Neon + Prisma.
- Added the A0 staff admin foundation: Google OAuth allowlist, first OWNER bootstrap while no staff exist, role checks, owner staff management, and audit log.
- Added A1 inbox conversion, client records, event pipeline and transition rules, quotations, tasks, notes, and activity history.
- Fixed an inbox crash caused by formatting enquiry status strings as dates: statuses are now rendered as labels.

### `feat/crm-a0-a1` — CRM core milestone

- Documents the A0/A1 CRM foundation and delivery. This branch is an earlier milestone before A2 and A3.

### `feat/crm-a3` — A2 and A3 operations

- A2 adds vendors, event vendor bookings, client receipts, vendor payments, expenses, and restricted finance summaries.
- A3 adds application review and conversion, team member records, event assignments and optional fees, partner status/history, and manually proposed commissions.
- A2 and A3 add their own additive Prisma migrations. The migrations were applied only after checking the previous migrations; the database was not reset.
- This branch is the completed A3 milestone before A4.

### `feat/crm-a4` — current complete implementation

- Adds role-aware dashboard sections, A4 finance due lists, seven needs-attention rules, calendar, global search, and the top-bar My Tasks shortcut.
- Updates project documentation and work summary.
- Adds no schema migration, dependency, or environment variable.
- Latest A4 commits: `6839ad5` feature implementation and `dec0925` documentation.

Branches pushed to `origin` include `main`, `feat/crm-a0-a1`, `feat/crm-a3`, and `feat/crm-a4`. Check the remote repository if branch state changes after this guide is written.

## 10. Database and secret safety — read before changing data

These rules are essential because the production-like Neon database contains real project data:

1. Prisma is **7.x**. Do not upgrade it to Prisma 8 as part of ordinary feature work.
2. Keep the schema datasource without `url` or `directUrl`. `prisma.config.ts` owns migration connection configuration.
3. Runtime uses the pooled `DATABASE_URL`; migrations use the direct `DIRECT_URL`.
4. `.env.local` contains secrets. Never read it into a response, print it, log it, commit it, or edit it casually.
5. Before any migration, inspect `prisma/schema.prisma` and `prisma/migrations/`, then run `npx prisma migrate status`.
6. Never reset the Neon database or drop existing data. Prefer additive migrations that preserve existing models and records.
7. No Firebase database is used. Do not reintroduce Firebase as the primary data store.
8. Do not ask visitors for more personal information than a workflow needs. Visitor intro answers remain in localStorage until a consent line and database table are defined.

Current database status in A4: nine migrations, all applied. A4 itself did not alter the schema.

## 11. Local setup and commands

Prerequisites: Node.js and npm; access to the development Neon database; Google OAuth credentials for admin sign-in.

1. Install packages with `npm install`.
2. Copy `.env.example` to `.env.local` and fill in values locally. Do not share or commit the file.
3. Set pooled `DATABASE_URL`, direct `DIRECT_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `ADMIN_BOOTSTRAP_EMAIL`. Set coming-soon and WhatsApp settings as needed.
4. Generate Prisma client with `npx prisma generate`.
5. For an existing shared database, check `npx prisma migrate status` before deciding whether any migration is needed. Never run a reset.
6. Run `npm run dev` and browse to `http://localhost:3000`.

Useful checks:

```powershell
npm run typecheck
npm test -- --run
npx prisma validate
npx prisma generate
npx prisma migrate status
npm run build
```

The repository has no configured lint script. The production build uses `next/font` to fetch Poppins and Inter; the restricted delivery environment could not reach Google Fonts, so run the build where those fonts are accessible. Do not remove the chosen brand fonts to work around a network restriction.

### First staff sign-in

1. Configure Google OAuth callback URLs for local development and production.
2. Set `ADMIN_BOOTSTRAP_EMAIL` to the first OWNER's email.
3. Visit `/admin` and sign in with that Google account while the `StaffUser` table is empty.
4. Once the OWNER exists, use `/admin/settings/staff` to add the remaining staff. The bootstrap email does not bypass the normal role checks after staff have been created.
5. Verify each staff role with a real account before production launch.

## 12. Verification completed and limitations

On A4, the following passed:

- `npm run typecheck`.
- `npm test -- --run`: 41 tests in 10 files, including permission boundaries, finance calculations, A4 attention rules, calendar date logic, search scope, phone normalization, and event rules.
- Prisma schema validation and client generation with Prisma 7.10.1.
- `prisma migrate status`: all nine migrations applied.
- `git diff --check` before commit.

Not completed in the delivery environment:

- `npm run build` could not download Inter and Poppins from Google Fonts because outbound network access was denied.
- Google OAuth was not manually exercised with the team's configured Google account.
- A complete logged-in walkthrough as OWNER, MANAGER, STAFF, and ACCOUNTS remains to be done.
- Public animation appearance and mobile performance should be checked in a browser on real devices.

## 13. What remains, in priority order

1. **Runtime verification:** sign in as each staff role and walk through A2–A4 finance visibility, application conversion, team assignments, commission eligibility/approval/payment, dashboard scope, search visibility, calendar filters, and audit history.
2. **Build and browser verification:** run production build with font access; check intro animation, scroll logo, 3D fallback, mobile layout, and accessibility.
3. **Customer accounts:** decide phone OTP provider (Firebase only for OTP, or an Indian SMS provider with an auth framework); then implement the user's own enquiries, applications, and partner referrals. The decision is open.
4. **Private dream submission:** implement consent, guardian consent for minors, private moderation states, minimal data collection, and no public display.
5. **Policy and content:** privacy/terms/referral policy and real event content approved by AILU.
6. **Operational hardening:** public-form rate limiting, security headers, accessibility review, SEO/social cards, production environment review, and launch decision.
7. **Donations:** only after legal structure and a suitable payment provider are in place.
8. **CMS and reports:** the plan describes editable content and business reports; those modules are not yet implemented.
9. **Later ideas:** loyalty points only after a business decision, AILU character/chat, notifications, online customer payments, and file uploads.

Do not start a later phase or decide a business policy by guessing. Current open decisions include OTP provider, whether loyalty points will exist, referral reward rules, donation legal/payment setup, and when to turn off coming-soon mode.

## 14. Short glossary

- **Enquiry:** a visitor's request for information or planning. It is not a booking.
- **Client:** a person or organization AILU is working with; a converted enquiry can link to one.
- **Event:** the operational record for one planned celebration or event engagement.
- **Quotation:** a versioned proposal with server-calculated total; acceptance is tracked separately from event confirmation.
- **Vendor booking:** an event's planned service from an outside supplier, with status and agreed cost.
- **Team assignment:** a team member's role on a particular event; optional fees are private to authorized roles.
- **Sales partner:** an external referrer with an AILU partner ID. Registration alone does not create earnings.
- **Commission:** a manually proposed monetary reward for a referral that passes the eligibility rules and approval process.
- **Paise:** one hundredth of an Indian rupee. For example, ₹100 is stored as 10,000 paise.
- **Migration:** a versioned change to the database structure. A4 did not need one; A2 and A3 did.
- **Role scope:** server-enforced limits on what rows and fields a staff member can access.

## 15. Related project documents

- `AGENTS.md` — authoritative implementation rules, architecture constraints, and handoff instructions.
- `CRM_CMS_PLAN.md` — CRM/CMS product plan and data model direction. Some sections are planning material, not completed features.
- `AILU_MAIN_THEME.md` — original AILU visual and experience brief, interpreted under the privacy/business rules in `AGENTS.md`.
- `WORK_SUMMARY.md` — concise phase-by-phase implementation and verification report.
- `README.md` — shorter repository setup and route overview.

When documents conflict, follow current non-negotiable instructions in `AGENTS.md` and the later AILU vision there. For example, dreams remain private even if an older theme document suggests public stories, and loyalty points remain undecided.
