# AILU (Phase 1)

Next.js 14, TypeScript, Tailwind, Framer Motion, React Three Fiber, Prisma + Neon Postgres.

## Run
1. `npm install`
2. Copy `.env.example` to `.env.local` and add your two Neon connection strings.
3. `npx prisma migrate dev --name init` (creates the tables)
4. `npm run dev`

Without a DATABASE_URL the enquiry API returns a friendly "not switched on yet" message.

## Logo
Put the real files in `public/brand/` and change the two paths in `src/lib/brand.ts`.

## Included
Opening intro (skippable, remembered per session, reduced-motion and low-end fallback), home, events list and detail pages, enquiry form with server validation and `AILU-EVT-000001` IDs, `/my-ailu` placeholder.

## Next
Phase 2: phone OTP auth, user IDs, dashboard.
