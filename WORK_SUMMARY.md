# AILU Work Summary

Updated: 3 November 2026

Branch: `feat/crm-a3`

## Overview

This branch contains the staff CRM foundation and event workflows (A0/A1), vendor and event finance (A2), team, partner, and commission management (A3), and the AILU main theme brief. Work keeps the public website, existing AILU brand palette, Neon + Prisma 7 architecture, and the privacy and business rules in `AGENTS.md`.

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

## Database

- Added migration `20261103100000_add_vendors_and_event_finance` with vendor, vendor booking, payment, and expense tables plus indexes and relations.
- Before applying it, inspected the existing schema and migrations and confirmed the previous seven migrations were applied.
- Applied the additive migration with `prisma migrate deploy`; no reset or data drop was performed.
- A subsequent elevated `prisma migrate status` confirmed all eight migrations are up to date.

## Verification

Passed:

- `npm run typecheck`
- `npm run test` — 24 tests across 7 files
- `npx prisma validate`
- `npx prisma generate`
- `prisma migrate status` — successful with elevated network access after migration; all nine migrations are applied
- `git diff --check`

Could not complete:

- `npm run build` fails at `next/font` because the environment cannot connect to Google Fonts to fetch Inter and Poppins. The build needs to be rerun in an environment with font access.
- Google OAuth and the full authenticated UI workflow have not been manually exercised. Walk through the workflows with OWNER, MANAGER, STAFF, and ACCOUNTS accounts when OAuth is configured.

## Commits

- `84ce67f` — `feat: add AILU CRM foundation and referrals`
- `8625c1c` — `fix(admin): render enquiry statuses as labels`
- `668f984` — `docs: add AILU main theme brief`
- `29c2d0a` — `feat(crm): add vendor and event finance workflows`

## Remaining work

1. Run the production build where Google Fonts are reachable.
2. Sign in with staff accounts for each role and manually verify A2/A3 role access, application conversion, assignment, eligibility, commission approval/payment, finance totals, and audit history.
3. Keep commissions manual until AILU defines reward policy; the system does not calculate a rate.

No credentials or `.env.local` values are included in this report.
