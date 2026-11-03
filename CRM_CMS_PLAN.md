# AILU CRM + CMS: plan and data model

Companion to `AGENTS.md`. Read `AGENTS.md` first (rules, stack, current state). This file defines what to build next: an **internal admin system** for AILU staff with two halves:

- **CRM:** everything AILU knows about clients, vendors, partners, team members and every event, from first enquiry to money settled.
- **CMS:** the content shown on the public website, editable without code.

Status: **A0–A3 implementation delivered; authenticated runtime walkthrough pending.** A3 applications, team, partners, and manual commissions are implemented. Remaining business decisions in section 11 apply to later phases unless stated otherwise. Each phase gets one additive Prisma migration.

---

## 1. Goals

1. Nothing about an event lives only in WhatsApp or someone's head. One record holds client, requirements, quotes, vendors, team, payments, costs and notes.
2. A website enquiry becomes a tracked lead, then a client and an event, without retyping.
3. Know at any moment: what is pending, who must follow up, what is owed to us, what we owe vendors and partners, and what each event earned.
4. Staff can update public website content themselves.
5. Client and vendor data is protected, with role-based access and an audit trail.

Non-goals for now: public client login, online payments, automated WhatsApp sending, accounting software replacement, mobile app.

---

## 2. Architecture

- Same Next.js app, new route group: `src/app/(admin)/admin/...`. Public site stays untouched.
- **Auth:** staff only. Recommended: **Auth.js v5 with Google sign-in and an allowlist table (`StaffUser`)**, so there are no passwords to store. Only listed, active emails can sign in. (Alternative: credentials with hashed passwords + 2FA. Decide in section 11.)
- **Authorisation is server-side only.** Every server action and route handler calls `requireRole(...)` (`src/lib/authz.ts`). Hiding a button is never security.
- Domain logic in `src/server/<module>/` (queries, mutations, validation). Pages stay thin.
- UI: Tailwind + shadcn/ui, TanStack Table for lists (search, filter, sort, pagination, CSV export), react-hook-form + Zod for forms. Admin UI is plain and fast. It does **not** use the 3D or intro effects.
- **Money is stored as integer paise** (`Int`/`BigInt`), never floats. Currency is INR. Format at the edge.
- **Dates** stored in UTC, shown in Asia/Kolkata.
- Soft delete (`archivedAt`) for clients, vendors and events. Hard delete only for owner-initiated erasure requests.
- Every admin write calls `audit(actor, action, entity, id, diff)`.
- File uploads (contracts, quotation PDFs, event photos): use object storage (Vercel Blob or Cloudflare R2). Store only URL + metadata in the database. Decide provider in section 11.
- While `COMING_SOON=true`, middleware also redirects `/admin`. Staff unlock with the preview link. Consider exempting `/admin` and `/api/admin` (still protected by auth) once decided.

Folder sketch:
```
src/app/(admin)/admin/
  layout.tsx            # auth gate + sidebar
  page.tsx              # dashboard
  inbox/                # website enquiries
  clients/ [id]/
  events/  [id]/        # tabs: overview, quotes, vendors, team, payments, costs, tasks, notes, files
  vendors/ [id]/
  team/                 # applications + team members
  partners/             # sales partners + commissions
  tasks/
  reports/
  cms/                  # categories, media, faq, banners, pages, testimonials, settings
  settings/             # staff users, roles, audit log
src/server/{clients,events,vendors,finance,cms,...}/
src/lib/authz.ts  src/lib/audit.ts  src/lib/money.ts
```

---

## 3. Roles and permissions

| Area | OWNER | MANAGER | STAFF | ACCOUNTS |
|---|---|---|---|---|
| Dashboard | all | all | own work | finance view |
| Clients, events, tasks | full | full | create/edit assigned, no delete | read |
| Quotations | full | full | draft | read |
| Vendors (contact, notes) | full | full | read + add notes | read |
| Vendor bank/UPI details | full | hidden | hidden | full |
| Payments, expenses | full | read | hidden | full |
| Partner commissions | approve | propose | hidden | mark paid |
| Applications / team | full | full | read | hidden |
| CMS | full | full | edit drafts | hidden |
| Staff users, audit log, erasure | full | hidden | hidden | hidden |

Enforce in `authz.ts` (one place), not scattered in pages.

---

## 4. CRM modules (what each screen does)

1. **Inbox:** all website enquiries (`EventEnquiry`) with status, source, partner referral. Actions: assign owner, mark spam, **Convert to client + event** (dedupes client by normalised phone, links the enquiry).
2. **Clients:** list/search by name, phone, city, tag. Profile: contact details, company info (GSTIN for corporate), source, all events, all enquiries, timeline, tasks, documents, consent flag.
3. **Events (the core record):** pipeline `LEAD → QUOTED → NEGOTIATION → CONFIRMED → PLANNING → EXECUTED → COMPLETED` plus `CANCELLED` / `LOST` (with reason). Event page tabs:
   - Overview: client, category, tradition (North Indian / South Indian / other), dates, venue, guests, budget, requirements, owner.
   - Quotations: versions with line items, discount, tax, validity, status.
   - Vendors: vendor bookings (service, agreed amount, status, notes).
   - Team: assigned team members/performers with role and fee.
   - Payments: money in from client (advance/instalments/final), money out (vendors, team, partner commission), with balance due.
   - Costs and margin: expenses, revenue, profit for this event.
   - Tasks and notes: checklist, follow-ups, call/WhatsApp/meeting log.
   - Files: contracts, approved quotes, run sheets, photos.
4. **Vendors:** directory by category (decor, catering, photography, videography, sound/lights, DJ, venue, makeup, priests/ritual services, transport, performers, other), city, rating (internal), status (active / inactive / do not use), contact people, rate notes, history of events they worked on, payments owed/paid. Bank/UPI details are restricted (section 3).
5. **Team:** applications (existing `Application`) → convert to **Team member** (roles, availability, fee notes, events worked).
6. **Partners:** existing `SalesPartner` with approve/reject/suspend, their referred enquiries and events, and **commissions** (amount, basis, `PENDING_APPROVAL → APPROVED → PAID` or `REJECTED`).
7. **Tasks and follow-ups:** due dates, assignee, linked to client/event/enquiry. "Today / overdue" view feeds the dashboard.
8. **Dashboard:** new enquiries, pipeline counts by stage, upcoming events (next 30 days), overdue tasks, payments due from clients, vendor payments due, partner commissions awaiting approval.
9. **Reports (later):** revenue and margin by month/category, source performance (website vs partner), vendor spend, CSV export.

Client-facing: still only the public enquiry and join forms. No client login yet.

---

## 5. Data model draft (Prisma)

Rules that apply to every model:
- Human IDs follow the existing pattern: `seq Int @unique @default(autoincrement())` plus `id String @id` set to `AILU-XXX-000001` in one `$transaction`.
- New prefixes: `AILU-CLI-` client, `AILU-EVENT-` event, `AILU-VEN-` vendor, `AILU-TM-` team member. Existing: `AILU-EVT-` enquiry, `AILU-APP-` application, `AILU-SP-` partner. Use `cuid()` ids for child rows (items, notes, payments).
- Phones normalised with `normalizePhone()`.
- This is a **draft**: adjust field names freely, but keep the shape. Add models **per phase**, not all at once.

```prisma
// ---------- Foundation (phase A0) ----------
enum StaffRole { OWNER MANAGER STAFF ACCOUNTS }

model StaffUser {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String
  role      StaffRole @default(STAFF)
  active    Boolean   @default(true)
  createdAt DateTime  @default(now())
}

model AuditLog {
  id        String   @id @default(cuid())
  actorId   String?
  action    String            // e.g. "event.status_changed"
  entity    String            // e.g. "Event"
  entityId  String
  diff      Json?
  at        DateTime @default(now())
  @@index([entity, entityId])
  @@index([at])
}

// ---------- Clients (A1) ----------
enum ClientType   { INDIVIDUAL COMPANY COMMUNITY }
enum ClientSource { WEBSITE PARTNER REFERRAL WALK_IN SOCIAL OTHER }

model Client {
  seq              Int          @unique @default(autoincrement())
  id               String       @id            // AILU-CLI-000001
  type             ClientType   @default(INDIVIDUAL)
  name             String
  companyName      String?
  phone            String       @unique
  altPhone         String?
  email            String?
  city             String?
  address          String?
  gstin            String?                     // corporate clients only
  source           ClientSource @default(WEBSITE)
  referredBySpId   String?                     // partner who introduced them
  tags             String[]
  notes            String?
  consentToContact Boolean      @default(false)
  archivedAt       DateTime?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  contacts         ClientContact[]
  events           Event[]
}

model ClientContact {            // extra people at a company/community client
  id       String @id @default(cuid())
  clientId String
  client   Client @relation(fields: [clientId], references: [id])
  name     String
  role     String?
  phone    String?
  email    String?
}

// ---------- Events (A1) ----------
enum EventStatus { LEAD QUOTED NEGOTIATION CONFIRMED PLANNING EXECUTED COMPLETED CANCELLED LOST }

model Event {
  seq           Int         @unique @default(autoincrement())
  id            String      @id               // AILU-EVENT-000001
  clientId      String
  client        Client      @relation(fields: [clientId], references: [id])
  enquiryId     String?     @unique           // EventEnquiry.id it was converted from
  title         String
  category      String                         // EventCategory slug
  tradition     String?                        // North Indian / South Indian / other, free text
  status        EventStatus @default(LEAD)
  lostReason    String?
  startDate     DateTime?
  endDate       DateTime?
  venueName     String?
  venueCity     String?
  venueAddress  String?
  guestCount    Int?
  budgetPaise   Int?
  requirements  String?
  internalNotes String?
  ownerId       String?                        // StaffUser
  archivedAt    DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  quotations    Quotation[]
  vendorBookings VendorBooking[]
  assignments   EventAssignment[]
  payments      Payment[]
  expenses      Expense[]
  @@index([status, startDate])
  @@index([clientId])
}

// ---------- Quotations (A1) ----------
enum QuotationStatus { DRAFT SENT ACCEPTED REJECTED EXPIRED }

model Quotation {
  id            String          @id @default(cuid())
  eventId       String
  event         Event           @relation(fields: [eventId], references: [id])
  version       Int             @default(1)
  status        QuotationStatus @default(DRAFT)
  validUntil    DateTime?
  discountPaise Int             @default(0)
  taxPaise      Int             @default(0)
  totalPaise    Int             @default(0)      // computed server-side, never trusted from the client
  terms         String?
  createdAt     DateTime        @default(now())
  items         QuotationItem[]
}

model QuotationItem {
  id             String    @id @default(cuid())
  quotationId    String
  quotation      Quotation @relation(fields: [quotationId], references: [id])
  description    String
  quantity       Int       @default(1)
  unitPricePaise Int
}

// ---------- Vendors (A2) ----------
enum VendorStatus { ACTIVE INACTIVE DO_NOT_USE }

model Vendor {
  seq            Int          @unique @default(autoincrement())
  id             String       @id              // AILU-VEN-000001
  name           String
  category       String                         // managed list; see VendorCategory in CMS settings or a table
  contactPerson  String?
  phone          String
  altPhone       String?
  email          String?
  city           String?
  address        String?
  gstin          String?
  rateNotes      String?
  rating         Int?                           // internal 1-5
  status         VendorStatus @default(ACTIVE)
  tags           String[]
  notes          String?
  // Restricted to OWNER/ACCOUNTS. Prefer UPI id. If bank details are stored, encrypt at rest.
  upiId          String?
  bankDetailsEnc String?
  archivedAt     DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  bookings       VendorBooking[]
}

enum VendorBookingStatus { ENQUIRED QUOTED CONFIRMED DONE CANCELLED }

model VendorBooking {
  id                String              @id @default(cuid())
  eventId           String
  event             Event               @relation(fields: [eventId], references: [id])
  vendorId          String
  vendor            Vendor              @relation(fields: [vendorId], references: [id])
  service           String
  agreedAmountPaise Int?
  status            VendorBookingStatus @default(ENQUIRED)
  notes             String?
  payments          Payment[]
  expenses          Expense[]
}

// ---------- Team (A3) ----------
model TeamMember {
  seq           Int     @unique @default(autoincrement())
  id            String  @id                     // AILU-TM-000001
  name          String
  phone         String  @unique
  email         String?
  city          String?
  roles         String[]
  applicationId String? @unique                 // Application it came from
  feeNotes      String?
  active        Boolean @default(true)
  notes         String?
  createdAt     DateTime @default(now())
  assignments   EventAssignment[]
}

model EventAssignment {
  id           String     @id @default(cuid())
  eventId      String
  event        Event      @relation(fields: [eventId], references: [id])
  teamMemberId String
  teamMember   TeamMember @relation(fields: [teamMemberId], references: [id])
  role         String
  feePaise     Int?
  status       String     @default("ASSIGNED")  // ASSIGNED / CONFIRMED / DONE / DROPPED
  payments     Payment[]
}

// ---------- Money (A2/A3) ----------
enum PaymentDirection { IN OUT }
enum PaymentMode      { CASH UPI BANK_TRANSFER CARD CHEQUE OTHER }

model Payment {
  id                String           @id @default(cuid())
  direction         PaymentDirection
  purpose           String                      // ADVANCE, INSTALMENT, FINAL, REFUND, VENDOR, TEAM_FEE, COMMISSION
  eventId           String?
  event             Event?           @relation(fields: [eventId], references: [id])
  vendorBookingId   String?
  vendorBooking     VendorBooking?   @relation(fields: [vendorBookingId], references: [id])
  assignmentId      String?
  assignment        EventAssignment? @relation(fields: [assignmentId], references: [id])
  commissionId      String?
  commission        Commission?      @relation(fields: [commissionId], references: [id])
  amountPaise       Int
  mode              PaymentMode
  reference         String?                     // UPI ref / cheque no. Never card numbers.
  paidOn            DateTime
  recordedById      String?
  note              String?
  createdAt         DateTime         @default(now())
  @@index([eventId])
}

model Expense {
  id              String         @id @default(cuid())
  eventId         String
  event           Event          @relation(fields: [eventId], references: [id])
  vendorBookingId String?
  vendorBooking   VendorBooking? @relation(fields: [vendorBookingId], references: [id])
  category        String
  amountPaise     Int
  spentOn         DateTime
  note            String?
}

enum CommissionStatus { PENDING_APPROVAL APPROVED PAID REJECTED }

model Commission {
  id           String           @id @default(cuid())
  partnerId    String                         // SalesPartner.id
  eventId      String
  basis        String                         // how the amount was worked out
  amountPaise  Int
  status       CommissionStatus @default(PENDING_APPROVAL)
  decidedById  String?
  decidedAt    DateTime?
  createdAt    DateTime         @default(now())
  payments     Payment[]
  @@unique([partnerId, eventId])
}

// ---------- Work management (A4) ----------
model Task {
  id         String    @id @default(cuid())
  title      String
  dueAt      DateTime?
  doneAt     DateTime?
  priority   String    @default("NORMAL")
  assigneeId String?
  clientId   String?
  eventId    String?
  enquiryId  String?
  createdAt  DateTime  @default(now())
  @@index([assigneeId, doneAt, dueAt])
}

model Activity {                              // timeline: calls, WhatsApp, meetings, notes, status changes
  id        String   @id @default(cuid())
  kind      String
  body      String
  byId      String?
  clientId  String?
  eventId   String?
  vendorId  String?
  at        DateTime @default(now())
  @@index([clientId, at])
  @@index([eventId, at])
}

model Document {
  id           String   @id @default(cuid())
  kind         String                          // CONTRACT, QUOTE, RUN_SHEET, PHOTO, OTHER
  name         String
  url          String
  clientId     String?
  eventId      String?
  vendorId     String?
  uploadedById String?
  createdAt    DateTime @default(now())
}

// ---------- CMS (A5) ----------
model EventCategory {                          // replaces the hard-coded list in src/lib/events.ts
  slug       String  @id
  title      String
  blurb      String
  services   String[]
  imageId    String?
  sort       Int     @default(0)
  published  Boolean @default(true)
}

model MediaAsset {
  id        String   @id @default(cuid())
  url       String
  alt       String
  kind      String   @default("IMAGE")        // IMAGE / VIDEO
  width     Int?
  height    Int?
  createdAt DateTime @default(now())
}

model FaqItem     { id String @id @default(cuid())  question String  answer String  sort Int @default(0)  published Boolean @default(true) }
model Banner      { id String @id @default(cuid())  text String  linkUrl String?  startsAt DateTime?  endsAt DateTime?  published Boolean @default(false) }
model Page        { slug String @id  title String  bodyMd String  published Boolean @default(false)  updatedAt DateTime @updatedAt }   // privacy, terms, referral policy, about
model SiteSetting { key String @id  value Json }                                                                                         // phone, WhatsApp, email, social links
model Testimonial { id String @id @default(cuid())  displayName String  text String  eventId String?  consentGiven Boolean  published Boolean @default(false) }  // publish only with consent
```

Changes to existing models (A1):
- `EventEnquiry`: add `clientId String?`, `eventId String?`, `ownerId String?`, `spam Boolean @default(false)`. Keep `status`.
- `SalesPartner` and `Application`: add `internalNotes String?`, `decidedById String?`, `decidedAt DateTime?`.

---

## 6. CMS scope

Editable from `/admin/cms` (draft → published, revalidate public pages on save with `revalidatePath`):
- **Event categories:** title, blurb, services, image, order, show/hide. Public pages read these from the database instead of `src/lib/events.ts`. Keep the file as the seed/fallback.
- **Media library:** upload, alt text (required), reuse.
- **FAQ**, **announcement banner** (with start/end), **pages** (privacy policy, terms, referral policy, About) in Markdown.
- **Site settings:** phone, WhatsApp, email, social links (replace constants in `lib/brand.ts` over time).
- **Testimonials:** only with the client's consent flag, never invented.
- **Event gallery and "how we run events" demos:** photos/videos attached to categories (real content only).
Not in the CMS: brand colors, logo, layout, intro animation. Those stay in code.

---

## 7. Security and privacy

- Staff sign-in only; session role re-checked on every action; deactivated staff lose access immediately.
- Least privilege per the permission table. Vendor bank details and payments restricted.
- Audit log for create/update/delete/status change/export/sign-in. Never log secrets or full payloads with personal data.
- India's DPDP Act 2023 applies to personal data of clients and others: collect only what is needed for the event, keep a `consentToContact` flag, provide a way to **export and erase** a client (owner-only action), and set a retention rule (for example archive inactive clients after N years). Get proper legal advice before launch. This document is not legal advice.
- No Aadhaar, PAN images, passport or card numbers. Payment `reference` holds UPI/cheque references only.
- Encrypt sensitive fields at rest (`bankDetailsEnc`) with a server-side key kept in env; or avoid storing bank details and keep only UPI ids.
- CSV exports are owner/accounts only and audited.
- Rate-limit sign-in and public forms. Backups: use Neon point-in-time restore and test a restore.

---

## 8. Quality bar for every module

- Zod validation on the server; friendly errors; no data loss on error.
- Lists: search, filters, pagination (server-side), empty states.
- Every status change writes an `Activity` and an `AuditLog` row.
- Money math only in `src/lib/money.ts`; totals computed on the server; unit tests for money and permission helpers.
- Responsive (managers use phones), keyboard accessible.
- Verify against a real generated Prisma client (`npx prisma generate`) and run `npx tsc --noEmit` and `npm run build` before declaring a phase done.

---

## 9. Build phases (each ends with a working, demonstrable slice)

**A0 Foundation.** Auth.js + Google allowlist, `StaffUser`, `requireRole`, admin layout and sidebar, `AuditLog`, `money.ts`. *Done when:* only an allowlisted email can open `/admin`; a STAFF user cannot reach OWNER-only pages even by typing the URL or calling the action.

**A1 Inbox, clients, events, quotations.** Inbox over `EventEnquiry`; Client CRUD; Event CRUD with pipeline; "Convert enquiry"; quotation builder with versions; tasks and notes basics; Activity timeline. *Done when:* a test website enquiry can be converted to a client + event, quoted, and moved to CONFIRMED, with the history visible.

**A2 Vendors and money (implementation complete; runtime walkthrough pending).** Vendor directory, vendor bookings per event, client payments in, vendor payments out, expenses, per-event balance and margin. Current defaults: categories are free text; bank account details are not stored; optional UPI ID is restricted to OWNER/ACCOUNTS. The additive migration is applied and all eight migrations were confirmed up to date. *Done when:* an authenticated walkthrough confirms an event shows accepted quote, received, balance due, vendor costs, vendor payments and estimated margin correctly under the intended roles.

**A3 Team and partners.** Applications review and "Convert to team member"; assignments; partner approve/reject; commissions with approval and "paid". *Done when:* a referred enquiry that completes and is paid produces a commission that waits for approval, and cannot be approved by the same person who proposed it if the owner enables that rule.

**A4 Dashboard and reminders.** Dashboard widgets, "today/overdue" tasks, upcoming events, dues. Optional later: WhatsApp click-to-chat links and email notifications.

**A5 CMS.** Categories, media, FAQ, banner, pages, settings, testimonials; public pages switch to database content with revalidation.

**A6 Reports and exports.** Revenue/margin/source reports, CSV export with audit.

Later: client self-service portal and phone OTP, online payments (Razorpay) for advances, quotation PDF generation and e-sign, document storage, donations/dreams admin (separate, privacy-first).

---

## 10. Current instruction for the agent

1. Read `AGENTS.md` and this file. A0/A1 are delivered; A2 is authorized and in progress.
2. Before applying any migration, inspect the schema/history and run `npx prisma migrate status`; if the database cannot be reached, leave the migration unapplied and report it. Never reset the database.
3. Keep A2 additive and within vendors, event vendor bookings, payments and expenses. Do not introduce commissions or guessed reward rules.
4. Keep the public site working at all times.

## 11. Decisions to confirm with Rani (recommended default in bold)

1. Staff sign-in: **Google sign-in with allowlist**, or email + password + 2FA?
2. Staff roles: **OWNER / MANAGER / STAFF / ACCOUNTS as in section 3**, or simpler?
3. How many people will use the admin, and on phones or computers?
4. File storage for contracts/photos: **Vercel Blob**, Cloudflare R2, or Google Drive links only for now?
5. Do vendor bank details need to be stored, or is **UPI id only** enough?
6. Quotation: is a **PDF export** needed in the first version, and does AILU charge GST (affects tax fields and invoicing)?
7. Is there an existing spreadsheet of clients/vendors to **import**? (A CSV import step should be added in A1/A2.)
8. Which vendor categories and event traditions should be in the starting lists?
9. Commission rule: fixed amount, percentage, or per event type? (Needed before A3 can calculate anything.)
10. Data retention period for inactive clients.
