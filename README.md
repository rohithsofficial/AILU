# AILU

AILU is an event management and celebration company in Udupi, Karnataka. This repository contains the public website and a staff-only CRM. Phase A2 adds the vendor directory and event finance tracking.

## Stack

Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Framer Motion, Three.js, Auth.js v5, Prisma 7, and Neon Postgres.

## Local setup

1. Install Node.js and run `npm install`.
2. Copy `.env.example` to `.env.local`. Add the pooled Neon connection string as `DATABASE_URL` and the direct string as `DIRECT_URL`.
3. Configure Google OAuth and the admin values below.
4. Apply pending database migrations with `npx prisma migrate dev`.
5. Run `npx prisma generate`, then `npm run dev`.

Never reset the database. Prisma 7 configuration reads `DIRECT_URL` from `.env.local` for migrations; the runtime adapter uses `DATABASE_URL`. Do not put connection URLs back in `prisma/schema.prisma`.

## Staff admin setup

Set these server-only environment variables:

- `AUTH_SECRET`: a long random value used to sign staff sessions.
- `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`: credentials for the Google OAuth app. Add `http://localhost:3000/api/auth/callback/google` and the production callback URL to its allowed redirects.
- `ADMIN_BOOTSTRAP_EMAIL`: the email allowed to create the first `OWNER`, and only while the `StaffUser` table is empty.

Visit `/admin` and sign in with that Google account. After the first owner is created, add other staff at `/admin/settings/staff`. Every staff member signs in with their own Google account. Staff roles are checked against the database on each admin request.

The admin remains accessible while `COMING_SOON=true`; it is protected by staff authentication. Public APIs remain closed while the public site is hidden.

## Main routes

- Public site: `/`, `/events`, `/join`, `/dreams`, `/donate`.
- Staff CRM: `/admin`, `/admin/inbox`, `/admin/clients`, `/admin/events`, `/admin/tasks`, `/admin/vendors`.
- Owner settings: `/admin/settings/staff`, `/admin/settings/audit`.

Enquiries are not confirmed bookings. Staff must verify availability, scope, terms, and payment before confirming an event. Donations remain information-only until the required legal and payment setup exists. Dreams remain private.

Vendor categories are free text. Vendor UPI IDs are optional and visible only to OWNER and ACCOUNTS; bank account details are not stored. Event finance records use integer paise. OWNER and ACCOUNTS can record payments and expenses; MANAGER can read event finance; assigned STAFF can manage vendor bookings without access to finance totals. Margin uses the latest accepted quotation less vendor commitments (or higher linked actual expenses) and non-vendor expenses, while client and vendor balances use recorded payments. These are operational estimates, not accounting statements.

## Checks

- `npm run typecheck`
- `npm run test`
- `npm run build` (requires network access to Google Fonts used by `next/font`)
- `npx prisma validate`
- `npx prisma migrate status`

Vitest covers permissions, quotation and event-finance calculations, phone normalization, enquiry conversion mapping, and event status transitions.
