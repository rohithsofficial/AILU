# AILU code map

Last updated: 2026-11-08. Where everything lives, and the rule for each folder.
Every source file now starts with a short comment that says what it is for.

## The one-line rule per folder

| Folder | What goes here | Rule |
|---|---|---|
| `src/app/` | Pages and API routes (Next.js App Router). The folder path is the web address. | Keep pages thin: read data from `src/server`, rules from `src/lib`. |
| `src/app/(world)/` | The AILU World at `/` | No site navbar or footer here. |
| `src/app/(site)/` | The Normal World: classic home `/classic` and all real pages | Gets the navbar, footer and WhatsApp button from `SiteChrome`. |
| `src/app/(landing)/` | Campaign landing pages (`/celebrate`) | Small header only. One goal: an enquiry. |
| `src/app/(admin)/admin/` | The CRM and CMS (`/admin`) | Every `page.tsx` calls `requireRolePage`, every `actions.ts` function calls `requireRole` first. |
| `src/app/api/` | Public form endpoints and staff-only endpoints | Validate on the server with the schemas in `src/lib/validation.ts`. |
| `src/server/` | Everything that reads or writes the database | Never import from a client component. Write an audit line for every staff change. |
| `src/lib/` | Pure rules and helpers, no database (except `db.ts`, `audit.ts`, `rate-limit.ts`, `authz.ts`) | Put a test next to each rule (`*.test.ts`). |
| `src/components/` | React components for the public site | `components/admin/` for the CRM, `components/forms/` for public forms, `components/AiluWorld/` for the world. |
| `src/content/` | Default wording. The CMS can change most of it. | No fake prices, reviews, rewards or availability. |
| `prisma/` | Database schema and migrations | Do not create or run migrations unless Rohith asks. |
| `docs/` | Guides, plans, reports | Update `HANDOFF.md` at the end of every task. |

## Folder parts in brackets
`(world)`, `(site)`, `(landing)` and `(admin)` are **route groups**. The brackets keep them out of the address:
`src/app/(site)/about/page.tsx` is `/about`, not `/site/about`. Each group can have its own `layout.tsx`.

## Shared helpers (use these, do not copy them)

| Need | Use | File |
|---|---|---|
| Is this staff member allowed? | `requireRolePage`, `requireRole`, `can`, `canEditEvent`, `canEditClient` | `src/lib/authz.ts`, `src/lib/permissions.ts` |
| Show an error from a CRM action | `actionMessage(error)` | `src/lib/actionMessage.ts` |
| Search phones in a CRM list | `phoneFilter(q)` | `src/lib/search.ts` |
| A safe page number from the address bar | `pageNumber(value)` | `src/lib/search.ts` |
| Today in India, start of today, add days | `todayInIndia`, `indiaDayStart`, `addDays` | `src/lib/dates.ts` |
| Money (always whole paise) | `parseINRToPaise`, `formatINR`, `quotationTotalPaise` | `src/lib/money.ts` |
| Phone numbers | `indianPhoneSchema`, `normalizePhone` (`+91XXXXXXXXXX`) | `src/lib/validation.ts` |
| Record a staff change | `audit(actor, action, entity, id, diff)` | `src/lib/audit.ts` |
| Add a timeline line | `logActivity(kind, body, links, byId)` | `src/server/activity.ts` |
| Wording for a public page | `getContent()` (server) or `useContent()` (client) | `src/server/cms.ts`, `src/components/ContentProvider.tsx` |
| A/B test version | `chooseVariant`, `experimentNote` | `src/lib/experiments.ts` |

## How a request flows

**A visitor sends the enquiry form**
`EnquiryForm.tsx` → `POST /api/enquiries` (`src/app/api/enquiries/route.ts`) → checks with `enquirySchema` → spam trap → rate limits → saves `EventEnquiry` → the CRM inbox shows it.

**A staff member changes an event**
`events/[id]/page.tsx` form → `updateEventAction` (`events/actions.ts`) → `requireRole` → `canEditEvent` → `updateEvent` (`src/server/events.ts`) → `audit(...)` → redirect back with a message.

**A page shows wording**
`page.tsx` → `getContent()` → the published CMS section, merged with the defaults in `src/content`. If the database is slow, the last good content is used (see `src/server/cms.ts`).

## Dates
Date-only fields (event dates, task due dates, payment dates) are stored as midnight UTC of that day.
Compare them with `indiaDayStart()`, never with `new Date()`, or "today" items look overdue from 5:30 in the morning.

## Generated files (never edit by hand)
`src/components/AiluWorld/body.ts`, `engine.ts`, `ailu-world.css`. Changes for them are listed in
`src/components/AiluWorld/CHANGES_FOR_GENERATOR.md`. The site's own world fixes live next to them
(`worldMarkup.ts`, `phoneTurn.ts`, `roomSwipe.ts`, `levelView.ts`, `worldSteps.ts`, `worldRenderer.ts`, `world-brand.css`).

## Checks before "done"
`npm run lint`, `npx eslint src/server --ext .ts` (the lint script skips `src/server`), `npx tsc --noEmit`, `npm test`, `npm run build`,
then look at the changed pages at 390px and 1440px.
