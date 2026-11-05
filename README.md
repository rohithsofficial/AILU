# AILU

AILU is an event management and celebration company in Udupi, Karnataka. This repository contains the public website and a staff-only CRM. A2–A4 add vendor and event finance tracking, application review and conversion, team assignments, partner management, manual commissions, and role-aware dashboard, calendar, and global search tools.

## Stack

Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Framer Motion, Three.js, Auth.js v5, Prisma 7, and Neon Postgres.

## Local setup

1. Install Node.js and run `npm install`.
2. Copy `.env.example` to `.env.local`. Add the pooled Neon connection string as `DATABASE_URL` and the direct string as `DIRECT_URL`.
3. Set the admin values below.
4. Apply pending database migrations with `npx prisma migrate dev`.
5. Run `npx prisma generate`, then `npm run dev`.

Never reset the database. Prisma 7 configuration reads `DIRECT_URL` from `.env.local` for migrations; the runtime adapter uses `DATABASE_URL`. Do not put connection URLs back in `prisma/schema.prisma`.

## Staff admin setup

Set these server-only environment variables:

- `AUTH_SECRET`: a long random value used to sign staff sessions.
- `AUTH_GOOGLE_ENABLED`, `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`: optional. Google sign-in is off unless `AUTH_GOOGLE_ENABLED=true`.

Staff sign in at `/admin/login` with email and password. Set the first owner password from your own computer:

```bash
npm run staff:password -- owner@example.com
```

The same command resets a lost owner password. It uses `DIRECT_URL` from `.env.local`, and creates the first `OWNER` only while the `StaffUser` table is empty. After that, the owner adds staff and sets their passwords at `/admin/settings/staff`, and everyone can change their own under My password. A password change signs out older sessions. Sign-in attempts are rate limited, and staff roles are checked against the database on each admin request.

The admin remains accessible while `COMING_SOON=true`; it is protected by staff authentication. Public APIs remain closed while the public site is hidden.

Public launch settings:

- `NEXT_PUBLIC_SITE_URL`: final canonical HTTPS website origin, used for metadata and sitemap URLs.
- `RATE_LIMIT_SALT`: long random server-only secret used to hash public form rate-limit identifiers. Do not expose or reuse the preview secret.
- `DREAMS_FORM_OPEN`: defaults to `false`. Set to `true` only after legal and safeguarding review; it opens private dream intake on `/dreams` and `POST /api/dreams`.
- `COMING_SOON` and `PREVIEW_SECRET`: keep the public site hidden until launch checks pass; the preview secret stays private.
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: optional country-code digits; otherwise the number in `src/lib/brand.ts` is used.

## Main routes

- Public site: `/`, `/events`, `/about`, `/contact`, `/faq`, `/join`, `/dreams`, `/donate`, `/privacy`, `/terms`, `/referral-policy`.
- Staff CRM: `/admin`, `/admin/inbox`, `/admin/clients`, `/admin/events`, `/admin/calendar`, `/admin/attention`, `/admin/tasks`, `/admin/finance`, `/admin/vendors`, `/admin/applications`, `/admin/team`, `/admin/partners`, `/admin/commissions`, `/admin/search`.
- Owner settings: `/admin/settings/staff`, `/admin/settings/audit`.

Enquiries are not confirmed bookings. Staff must verify availability, scope, terms, and payment before confirming an event. Donations remain information-only until the required legal and payment setup exists. Dreams remain private.

Vendor categories are free text. Vendor UPI IDs are optional and visible only to OWNER and ACCOUNTS; bank account details are not stored. Event finance records use integer paise. OWNER and ACCOUNTS can record payments and expenses; MANAGER can read event finance; assigned STAFF can manage vendor bookings without access to finance totals. Margin uses the latest accepted quotation less vendor commitments (or higher linked actual expenses) and non-vendor expenses, while client and vendor balances use recorded payments. These are operational estimates, not accounting statements.

Applications can be reviewed and converted to team members. Existing normalized phone matches are reused. Team assignments are recorded per event, including optional fees and payments; STAFF cannot read fee amounts. Partner rewards remain manual: staff enter an amount and basis, and the system checks attribution, partner approval, completed event, accepted quotation, and full client payment. OWNER approves or rejects a commission; OWNER or ACCOUNTS records payment. No commission rate is assumed.

The A4 dashboard filters records and finance by role. It includes today's work, upcoming and unassigned queues, needs-attention rules, finance due lists, and estimated margin. The month calendar and global search use the same server-side event and record access scopes as the admin lists. Search requires two characters, waits 300 ms after typing, and returns at most five results per allowed group. A4 makes no schema changes or new dependencies.

The public launch pass adds About, Contact, FAQ, and legal pages; canonical/Open Graph metadata, Organization/FAQ/Breadcrumb structured data, robots and sitemap routes; public form abuse limits; form consent and accessibility improvements; and 404/error/loading states. Rate-limit rows store salted hashes rather than raw IPs. The website collects no payments, analytics, or advertising trackers. Private dream intake is gated off by default with `DREAMS_FORM_OPEN=false`; when enabled it stores dream details separately from clients/events, restricts review to OWNER and MANAGER, and never publishes submissions. See `LAUNCH_CHECKLIST.md` before changing either public intake switch.

Private dream review: `/admin/dreams` is available only to OWNER and MANAGER. Deletion is OWNER-only and permanently removes the submission and status history while retaining an audit record with the reference ID and deletion reason. Do not put submission text in logs, global search, public content, analytics or staff notes outside this restricted workflow. Apply the additive `dreams_private_submissions` migration with `npx prisma migrate deploy` before deploying this feature. Keep `DREAMS_FORM_OPEN=false` until the legal and safeguarding checklist is complete.

## Checks

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build` (requires network access to Google Fonts used by `next/font`)
- `npx prisma validate`
- `npx prisma migrate status`

Vitest covers permissions, quotation and event-finance calculations, phone normalization, enquiry conversion mapping, event status transitions, public metadata/indexing, enquiry prefill/date/consent validation, and rate-limit window/hash behavior.
