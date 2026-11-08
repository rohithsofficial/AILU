# Code review: 2026-11-08

Branch: `claude/new-session-x8qhdu`. Rohith asked for a line-by-line review of the whole project:
find errors, fix bugs, make the structure right and add comments.

## What was reviewed
All hand-written code, about 12,600 lines: `src/auth.ts`, `src/middleware.ts`, every file in `src/lib`, `src/server`,
`src/app/api`, the CRM pages and every CRM server action, the public pages, components and forms.
Not hand-reviewed: the generated world files (`body.ts`, `engine.ts`, `ailu-world.css`) and the database migrations,
which must not be edited by hand.

Automatic checks added to the reading: every CRM page and action was listed with its role check; every internal link
(45) was matched against the real pages (52); a search for risky patterns (raw HTML, `any`, disabled lint rules, `console.log`,
links opening a new tab without `rel`).

## What is good (no change needed)
- **Security:** every CRM page checks the role, and every CRM action checks it again on the server before changing anything.
  STAFF can only change their own clients and events. ACCOUNTS is read-only outside money. Only owners manage staff,
  and the last owner can never be demoted or switched off.
- **Login:** scrypt passwords, the same delay for a wrong email and a wrong password, rate limits, sessions end when the password changes.
- **Public forms:** server-side checks, spam trap, rate limits stored as salted hashes, duplicate checks.
- **Money:** whole paise everywhere, totals worked out on the server, reward eligibility follows AGENTS.md.
- **Dreams:** owner and manager only, every view audited, no dream text in logs or audit lines, only whitelisted messages shown.

## Bugs found and fixed

| # | Where | Problem | Fix | Test |
|---|---|---|---|---|
| 1 | Enquiry form (`lib/validation.ts`) | **An empty "Expected guests" box blocked every enquiry** with "Number must be greater than or equal to 1". The field is optional, so real customers were stopped (also on `/celebrate`). | Empty means "not given". | `validation.test.ts`; checked through the real API |
| 2 | CRM search on 7 list pages (inbox, clients, events, vendors, applications, partners, team) | **Searching a name returned every record.** A name has no digits, and "phone contains nothing" matches every phone. | Shared `phoneFilter()`: phones are searched only with 3 or more digits, like the top-bar search. | `search.test.ts` |
| 3 | Public forms (enquiry, team, partner, dream) | **Error messages were dark red on a near-black page**, hard to read. | Light red. | Browser, 390px and 1440px |
| 4 | Team, partner, dream forms, error page, 404 page | **Cream text on yellow buttons** (contrast about 1.6 to 1). | Dark text, like the other yellow buttons. | Browser |
| 5 | Public forms | "Please check the highlighted fields", but nothing was highlighted. | Rejected fields get a red border. | Browser |
| 6 | CRM tasks, "Overdue" view (`server/tasks.ts`) | **A task due today showed as overdue** from 5:30 am on its own due day (date compared with the current time). | Compare with the start of today in India, like the dashboard. | `dates.test.ts` |
| 7 | CRM inbox (`server/inbox.ts`) | `?page=-3`, `?page=1.5` or `?status=anything` in the address **crashed the page**. The other lists already guarded this. | Safe page number and known statuses only. | `search.test.ts` |
| 8 | Login (`lib/password.ts`) | A damaged stored password hash made the login **crash** instead of saying "wrong password". | Treated as a wrong password. | `password.test.ts` |
| 9 | Partner registration API | Two registrations with the same phone at the same moment gave the second a vague "something went wrong". | Clear "already registered" message (409). | — |
| 10 | 3D check (`lib/device.ts`) | Each check left a WebGL context open (browsers allow about 16). | Released straight away. | — |
| 11 | Intro on `/` | No keyboard way out of the full-screen intro. | Escape works like "Skip intro". | Browser |

## Structure fixes
- **One error helper for all CRM actions** (`src/lib/actionMessage.ts`) instead of 10 copies. It also turns database errors
  into plain English ("That already exists...") instead of showing technical text to staff. Tested in `actionMessage.test.ts`.
- **One date helper** (`src/lib/dates.ts`) instead of the same "start of today in India" code written in 5 places.
- **One `formatINR`**: `lib/format.ts` now re-exports the one in `lib/money.ts`.
- The inbox reuses the status list from `lib/enquiryStatus.ts` instead of its own copy.
- The folders were already well organised (`app` pages, `server` database, `lib` rules, `components`, `content`),
  so no files were moved. Moving them would break every import for no gain. The map is in `docs/CODE_MAP.md`.

## Comments
Every source file (118 files that had none) now starts with a short comment that says what it is for, which page or
address it serves, and who may use it. A few tricky lines also got comments: the guests field, date-only fields,
the "→ EXECUTED" timeline search, the dream message whitelist and the 3D context release.

## Checked and not changed (decisions for Rohith)
1. **An accepted quotation can be set back to Draft and then deleted.** That lets staff fix mistakes, but it also means
   a record of what the client accepted can disappear. Should "Accepted" be final (only Rejected or Expired after it)?
2. **Security advisories** in Next.js 14, zod 3 and `@vercel/blob` (`npm audit`). The fix is a major upgrade (Next 15, zod 4).
   See `IMPROVEMENT_IDEAS.md`, item 1.
3. The `npm run lint` script skips `src/server`. It is clean today when run by hand. Adding it to the script is a one-line change; say if you want it.

## Results
- `npm run lint`, `npx eslint src/server`, `npx tsc --noEmit`: clean.
- `npm test`: 31 files, **150 tests pass** (was 28 files, 139 tests).
- `npm run build`: passes.
- Browser (390px and 1440px): team, partner and events forms after a failed send, the 404 page, and Escape on the intro.

## Not verified
- Anything that needs the database (this computer has none): the CRM search and inbox fixes were checked by tests and
  typecheck, not on real data. Please try a name search in CRM → Inbox and Clients after deploying.
- The tasks "Overdue" view on real tasks.
