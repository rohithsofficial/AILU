# AILU: project guide for Claude Code

Read this and AGENTS.md at the start of every session and follow both. If they disagree, AGENTS.md (business rules) wins; ask Rani.

## What this project is
Website, CRM and CMS for AILU, an event management company in Udupi, Karnataka.
Tagline: "Creating Moments. Delivering Smiles."
Owner: Rani (freelance developer/designer, works mostly alone). Explain things in simple English, short sentences.

## Stack
Next.js (App Router) + React + TypeScript + Tailwind + Framer Motion + three.js / React Three Fiber.
Neon Postgres + Prisma 7. Auth with next-auth (staff sign in with Google). Hosted on Vercel.
Brand: yellow #F5C400, black #111111, warm white #FFFDF7. Poppins for headings, Inter for body.
The hand-and-heart logo is the main symbol.

## Folder map (everything lives under src/: src/app, src/components, src/lib, src/server, src/content; middleware.ts and auth.ts are in src/)
- app/ public pages: about, contact, donate, dreams, events and events/[slug], faq, join (partner, team), my-ailu, privacy, terms, referral-policy, coming-soon, plus app/api/* (enquiries, dreams, applications, partners, admin/search, auth)
- app/(admin)/admin/* the CRM: inbox, clients, events, quotations, tasks, vendors, finance, team, partners, commissions, dreams, applications, calendar, attention, settings
- components/ site components (Hero, CelebrationJourney, HomeExperience, Navbar, Footer, SiteChrome, FloatingWhatsApp, Intro ...), components/admin/*, components/forms/*, components/AiluWorld/*
- lib/ shared logic and tests, server/ database logic and tests, content/site.ts text content
- middleware.ts and auth.ts at the root

## Two worlds (the website concept)
1. AILU World (immersive): the 360° world ported from the original AILU_Celebrations.html. Component: components/AiluWorld/AiluWorld.tsx. It has its own header, menu and WhatsApp link, so no site Navbar/Footer is shown there.
2. Normal World (classic site): the regular pages with Navbar and Footer (home, events, join, dreams, about, contact, legal pages).
- The two worlds must feel clearly separate.
- Visitors can switch between them with one easy, always visible button, from either side, on desktop and on phone:
  - in the AILU World: a button "Normal site" (goes to the classic home)
  - in the Normal World: a button "Enter AILU World" (goes to the world)
- Never force-redirect people or search engine crawlers between the worlds.
- Real forms, the CRM and legal pages live in the Normal World. Links inside the AILU World that need an action open the real page (see the ROUTES table in AiluWorld.tsx).

## Rules (never break these)
- Do NOT edit components/AiluWorld/body.ts, engine.ts or ailu-world.css by hand. They are generated. If a change inside the world is needed, list it for Rani instead.
- Prisma 7 setup is final: prisma.config.ts loads .env.local and uses DIRECT_URL, schema has no datasource URLs. Do not change it. No Prisma 8.
- Never open, print, edit or commit .env.local or any secret.
- Do not create or run database migrations, and do not reset the database, unless Rani asks.
- No fake prices, reviews, rewards or availability anywhere on the site.
- Dreams are private: never publish a person's dream or story.
- No new dependency without asking first.
- No destructive git commands (reset --hard, push --force, branch delete, clean -f).
- Work on a feature branch, small commits, clear commit messages. Tell Rani which branch you are on.
- Do not touch the CRM branch work (A0 to A4) unless the task is about it.

## Always before saying "done"
1. npm run lint, npx tsc --noEmit, tests, npm run build all pass.
2. Check the changed pages at 390px (phone) and 1440px (desktop): no horizontal scroll, no overlapping fixed elements.
3. Mention anything you could not verify. Do not claim something works if you did not run it.

## Working style
- Understand the code first, then change it. Read before you edit.
- Fix root causes, not symptoms. Keep changes small and focused.
- Prefer existing patterns in the repo over inventing new ones.
- Ask only when a decision is Rani's to make; otherwise choose a sensible default and say what you chose.
- Give a short summary at the end: files changed, what was verified, what is left.

## Build order decided by Rani
1. Finish the CRM (A0 to A4). A3 (team and partner commissions) waits on the partner reward policy.
2. Then the main public website (two worlds).
3. Then the CMS.

## Current state (update this section when things change)
- A0, A1, A2 of the CRM done and migrated on Neon.
- Two worlds built on branch feat/two-worlds (2026-11-05, PR #5, not merged). / = AILU World in src/app/(world). /classic and all real pages = Normal World in src/app/(site). /world and public/ailu-celebrations.html are gone.
- Switch buttons done: "Enter AILU World" in the Navbar and its menu; "Normal site" and a Pages list in components/WorldSwitch.tsx.
- The intro plays once per session, only on / (components/Intro.tsx, sessionStorage "ailu-intro-seen").
- No form inside the world collects data. The rewards/points preview is removed. World copy changes are in src/content/site.ts (SITE_CONTENT.world).
- World site changes live outside the generated files: worldMarkup.ts (markup patches, tested by worldMarkup.test.ts), AiluWorld.tsx (hides Rewards, releases WebGL, keeps the title, fixes Back), world-brand.css (brand fonts and colours).
- Menu: Join and Dreams open their world rooms; only their form cards link to real pages. Speed: worldRenderer.ts lowers pixel density and drops quality on slow devices.
- Open: components/AiluWorld/CHANGES_FOR_GENERATOR.md lists the edits Rani must make when regenerating body.ts, engine.ts and ailu-world.css. Until then the Google Fonts @import, unprefixed keyframes, off-brand 3D colours and canvas fonts remain, /#rewards still opens the rewards 3D room, and the rewards scene is still in the 3D world.
- Checked at 390px and 1440px in the desktop browser pane only. Rani's mobile report still needs a check on a real phone.
- three stays at 0.160.0 because the world port requires it.
- CRM login is email and password (src/lib/password.ts, scrypt, no new dependency). Google is off unless AUTH_GOOGLE_ENABLED=true. The passwordHash migration is applied on Neon. First owner password: npm run staff:password -- <email>.
- CRM records: tasks, payments, expenses, vendor bookings, team assignments, draft quotations and timeline notes have edit and delete (src/app/(admin)/admin/records/actions.ts). Clients and events stay archive and restore. An owner can delete a vendor only if it has no event bookings; otherwise archive it. Rules are in src/lib/recordRules.ts.
- Branch feat/crm-password-login is stacked on feat/two-worlds.
- Audit: AUDIT.md (2026-11-04).
