# AILU Work Summary

Updated: 3 November 2026

Branch: `feat/crm-a4`

## Overview

This branch contains the public website launch-readiness work on top of the staff CRM foundation and event workflows (A0/A1), vendor and event finance (A2), team, partner, and commission management (A3), role-aware dashboard, calendar and search (A4), and AILU main theme brief. Work keeps the AILU brand palette, Neon + Prisma 7 architecture, and the privacy and business rules in `AGENTS.md`.

## A0 — Staff admin foundation

- Google OAuth staff sign-in with allowlisted staff accounts and first-owner bootstrap while the staff table is empty.
- Server-side role checks and active staff revalidation.
- OWNER, MANAGER, STAFF, and ACCOUNTS access roles.
- Admin shell, responsive navigation, staff management, and paginated audit log.
- Audit records for administrative changes.

## A1 — CRM workflows

- Website enquiry inbox with filtering, spam handling, assignment, and conversion to a client and event in one transaction.
- Client records with assignment, contacts, notes, tags, activity, and follow-up tasks.
- Event pipeline, event details, status transition checks, archive/restore, quotations, and task tracking.
- Quotation totals calculated on the server in integer paise.
- Role and assignment restrictions enforced in server actions and data access.

## Inbox runtime fix

The inbox passed enquiry status values such as `SUBMITTED` to the date formatter, causing `RangeError: Invalid time value`. The status filter and table now format statuses as labels with `humanize()`; actual dates still use `formatIN()`.

## Main theme brief

- Saved the supplied “AILU | The Future of Celebrations” brief as [AILU_MAIN_THEME.md](./AILU_MAIN_THEME.md).
- Kept existing AILU visual branding and current privacy/business requirements as constraints where the long-term brief proposes features that are not approved yet.

## A2 — Vendors and event finance

- Vendor directory with search/filtering, status, internal rating, event history, notes, and archive/restore.
- Free-text vendor categories; optional UPI ID is restricted to OWNER/ACCOUNTS. Bank account details are not stored.
- Event vendor bookings with service, status, agreed cost, and notes.
- Integer-paise records for client receipts, vendor payments, and event expenses.
- Finance summaries for accepted quotation total, receipts, client balance due, vendor costs, vendor payments, vendor balance due, expenses, and estimated margin.
- STAFF can manage vendors on assigned events but cannot view finance totals. MANAGER can read finance. OWNER and ACCOUNTS can record payments and expenses.
- Finance totals are described as operational estimates, not accounting statements. Linked vendor expenses are not counted twice against the committed cost.
- Added permission and financial calculation tests.

## A3 — Applications, team, partners, and commissions

- Added a paginated applications CRM with search and filters, staff-only notes, decision history, status updates, and conversion into a team member. Conversion reuses an existing normalized-phone team record and can be repeated without creating a duplicate.
- Added searchable team member records, active/inactive state, role/city filters, event assignments, assignment status, fee notes, and payments against team assignments. Repeated event/member/role assignments are blocked; same-day assignment overlaps are surfaced as warnings.
- Added partner status management with rejection/suspension reasons, partner enquiry/event history, and a commissions queue.
- Added manually proposed commission amounts and basis. No rate or formula is assumed. Proposals recheck referral attribution, partner approval, completed event, accepted quotation, and fully paid client balance. Approval is owner-only, proposer and approver must differ, and payment recording is restricted to OWNER/ACCOUNTS.
- Added commission and team-fee costs to event finance summaries. Commission amounts and team fees are restricted by server-side permissions; STAFF cannot access commission amounts or team fee values.
- Added dashboard cards, admin navigation, event detail sections, audit records, permission rules, and A3 rules/finance tests.
- Added migration `20261103101734_a3_team_partners_commissions`; it was applied to Neon after confirming the prior migrations were already applied. No reset or destructive migration was used.

## A4 — Dashboard, calendar, needs attention, and global search

- Extended the existing dashboard with role-scoped today tasks, 7-day events, unassigned and oldest unconverted enquiries, clickable event pipeline counts, upcoming 30-day events, and the A3 approval queues.
- Added money widgets only for OWNER, MANAGER, and ACCOUNTS: client balances, vendor payments and stored team fees due, plus estimated margin for completed events with accepted quotations dated this month. Each due widget links to a role-protected filtered list. Money remains integer paise and is labelled operational/estimated.
- Added seven pure needs-attention rules with named thresholds and boundary tests: stale/unassigned enquiries, unanswered sent quotes, near events without vendor and team preparation, client balance due near event date (finance roles only), events left in EXECUTED, overdue client/event tasks, and pending partners.
- Added `/admin/attention` grouped full-list view and a top-bar My tasks due/overdue count.
- Added `/admin/calendar`: URL-persisted month/status/category/owner/closed filters, multi-day spans, status labels and legend, month grid, and CSS-selected mobile agenda. STAFF results follow the events-list owner scope; the calendar returns no finance fields.
- Added top-bar global search and `/admin/search?q=` results for clients, events, enquiries, vendors, partners, applications, and team members. It debounces input, requires at least two characters, normalizes formatted phone searches, limits each group to five, and queries only types/rows allowed for the current role.
- Updated inbox owner filtering and task due view so dashboard links open the corresponding filtered lists.
- No database migration, schema change, new dependency, or environment variable was added.

## Public website launch-readiness pass

- Added typed `src/content/site.ts` for site content, factual FAQs/process descriptions, optional social/person content, and empty category galleries. Added gallery asset requirements in `public/gallery/README.md`.
- Added `/about`, `/contact`, `/faq`, `/privacy`, `/terms`, and `/referral-policy`, refreshed Dreams and Donation Box messaging, and set `/my-ailu` to noindex. The Donation Box and dream form remain closed.
- Reworked the public navigation/footer, active links and Escape behavior in the mobile menu, skip-to-content link, and a floating WhatsApp link that hides while forms/footer are visible, during the intro, and on coming-soon/admin screens.
- Added public page metadata, canonical/Open Graph/Twitter values, a network-independent generated Open Graph image, Organization/FAQ/Breadcrumb JSON-LD, robots and sitemap routes, not-found/error/loading UI, and the sitemap/robots coming-soon behavior.
- Improved event-category pages with process/checklist/related categories, optional empty gallery support, metadata, breadcrumbs, and category-prefilled enquiry. Enquiry supports `?category=` and format-validated `?ref=` prefills, required contact consent, past-date rejection, associated inline errors, focusable feedback, and a WhatsApp follow-up link.
- Application/partner consent messaging now links to privacy and errors are connected for assistive technology. Server validation remains authoritative.
- Added salted HMAC rate limits without storing raw IPs: 5 event enquiries/hour/IP and 3/hour/phone; 3 applications/day/IP; 3 partner registrations/day/IP. Existing honeypots and duplicate checks remain. Set `RATE_LIMIT_SALT` before enabling forms.
- Added and applied `20261103111506_website_rate_limit`; current Neon status reports 10 migrations applied. This is additive; no data was reset or removed.
- Added ESLint 8, `eslint-config-next`, and `eslint-plugin-jsx-a11y`; the lint script covers public app/components/content/lib while excluding admin pages and components, which are outside this pass.
- Read-only `npm audit --omit=dev` reports 9 production advisories (6 moderate, 2 high, 1 critical), including Next.js, PostCSS, and Zod. The automatic fix crosses major versions; this remains a separate launch blocker requiring compatibility review and full CRM regression.
- Removed three unused brand assets after confirming there were no code references: `Glossy Golden Shaka Hand Icon.png`, `ailu-transparent-logo.png`, and `ailu-hand.svg`.
- Updated README and AGENTS and added `LAUNCH_CHECKLIST.md`.

Copy changes: removed the unsupported “founder-led” and “selected bookings across South India” wording; replaced it with “Based in Udupi, Karnataka. Planning celebrations across India.” Reworded partner copy so registration does not promise a reward or earnings and consideration depends on a verified, completed, paid booking and written terms. Clarified that dreams are private and the form is not open; donations are not collected. Removed public suggestions that dream support/donation collection is available now.

Open points before launch: lawyer review of legal drafts; data retention and consent-evidence retention decisions; response expectations; referral amount/basis and event eligibility in writing; approved founder/About story; confirmed event traditions/services; social links; real photos and permissions. No retention or response-time promise was invented.

## Database

- Added migration `20261103100000_add_vendors_and_event_finance` with vendor, vendor booking, payment, and expense tables plus indexes and relations.
- Before applying it, inspected the existing schema and migrations and confirmed the previous seven migrations were applied.
- Applied the additive migration with `prisma migrate deploy`; no reset or data drop was performed.
- A subsequent elevated `prisma migrate status` confirmed all eight migrations were up to date at the A2 stage.
- A3 migration `20261103101734_a3_team_partners_commissions` adds team members, event assignments, assignment payment links, and versioned commissions. It was applied after confirming the prior eight migrations; status confirmed all nine are up to date.
- A4 has no schema change. The public launch pass adds and applies `20261103111506_website_rate_limit`; the connected database now has ten applied migrations.

## Verification

Passed:

- `npm run typecheck`
- `npm run lint` — passes for public app/components/content/lib; admin routes and components intentionally excluded
- `npm run test` — 56 tests across 15 files
- `npx prisma validate`
- `npx prisma generate`
- `prisma migrate status` — successful with elevated network access after migration; all nine migrations are applied
- `git diff --check`

Could not complete:

- `npm run build` fails at `next/font` because the environment cannot connect to Google Fonts to fetch Inter and Poppins. The build needs to be rerun in an environment with font access; no First Load JS report is available until it succeeds.
- Google OAuth and the full authenticated UI workflow have not been manually exercised. Walk through the workflows with OWNER, MANAGER, STAFF, and ACCOUNTS accounts when OAuth is configured.
- Real browser checks for 360 px overflow, no-JavaScript rendering, mobile animation performance, and live form 429 behavior remain pending. Unit tests cover the related logic, but they do not replace the launch checklist walkthrough.

## Commits

- `84ce67f` — `feat: add AILU CRM foundation and referrals`
- `8625c1c` — `fix(admin): render enquiry statuses as labels`
- `668f984` — `docs: add AILU main theme brief`
- `29c2d0a` — `feat(crm): add vendor and event finance workflows`
- `62dfec6` — `feat(crm): add A3 team partner and commission workflows`
- `d1c35ba` — `docs: update A3 work summary`
- `6839ad5` — `feat(crm): add A4 dashboard calendar and search`
- `7c1253b` — `feat(public): add launch pages and SEO metadata`
- `6be75e6` — `feat(public): protect forms and improve accessibility`
- `028d280` — `chore(lint): add public accessibility rules`

## A3 PR summary

Add applications review and conversion to team members, event team assignments and fee tracking, partner management and referral history, and manual commissions with server-side eligibility checks, owner approval, and restricted payment recording. Include team fees and approved commissions in event finance, enforce role-based visibility, and document the workflows. Commission amounts and basis are entered by staff; no reward formula is assumed.

## A4 PR summary

Add a role-aware CRM dashboard with needs-attention rules and finance due lists, a filtered responsive events calendar, and global search across permitted CRM records. Add the top-bar My tasks shortcut and filtered finance, inbox, and task destinations. Keep authorization in server queries; STAFF receives no finance data. No schema change, migration, dependency, or environment variable is needed.

## Remaining work

1. Complete `LAUNCH_CHECKLIST.md`, including the legal review and real content inputs, before setting `COMING_SOON=false`.
2. Run the production build where Google Fonts are reachable and do the 360 px/mobile/browser form walkthrough.
3. Sign in with staff accounts for each role and manually verify A2–A4 access and workflows.
4. Keep commissions manual until AILU defines reward policy; the system does not calculate a rate.

No credentials or `.env.local` values are included in this report.
