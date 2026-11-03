# AILU Work Summary

Updated: 3 November 2026

Branch: `feat/crm-a0-a1`

## Overview

This branch now contains the staff CRM foundation and core event workflows (A0/A1), the vendor and event finance phase (A2), and the AILU main theme brief. Work keeps the public website, existing AILU brand palette, Neon + Prisma 7 architecture, and the privacy and business rules in `AGENTS.md`.

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

## Database

- Added migration `20261103100000_add_vendors_and_event_finance` with vendor, vendor booking, payment, and expense tables plus indexes and relations.
- Before applying it, inspected the existing schema and migrations and confirmed the previous seven migrations were applied.
- Applied the additive migration with `prisma migrate deploy`; no reset or data drop was performed.
- A subsequent elevated `prisma migrate status` confirmed all eight migrations are up to date.

## Verification

Passed:

- `npm run typecheck`
- `npm run test` — 17 tests across 6 files
- `npx prisma validate`
- `npx prisma generate`
- `npx prisma migrate status` — successful with elevated network access after migration
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
2. Sign in with staff accounts for each role and manually verify vendor access, assigned-event vendor bookings, finance visibility, payments, expenses, balances, and estimated margin.
3. Proceed to A3 only after confirming the partner reward policy; do not invent commission rates.

No credentials or `.env.local` values are included in this report.
