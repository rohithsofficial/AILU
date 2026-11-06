# AILU: project guide for Claude Code

Read this, AGENTS.md and docs/HANDOFF.md at the start of every session and follow them. If they disagree, AGENTS.md (business rules) wins; ask Rohith.

## What this project is
Website, CRM and CMS for AILU, an event management company in Udupi, Karnataka.
Tagline: "Creating Moments. Delivering Smiles."
Owner: Rohith (freelance developer/designer, works mostly alone). Explain things in simple English, short sentences.

## Stack
Next.js (App Router) + React + TypeScript + Tailwind + Framer Motion + three.js / React Three Fiber.
Neon Postgres + Prisma 7. Auth with next-auth (staff sign in with email and password). Hosted on Vercel.
Brand: yellow #F5C400, black #111111, warm white #FFFDF7. Poppins for headings, Inter for body.
The hand-and-heart logo is the main symbol.

## Folder map (everything lives under src/: src/app, src/components, src/lib, src/server, src/content; middleware.ts and auth.ts are in src/)
- app/ public pages: about, contact, donate, dreams, events and events/[slug], faq, join (partner, team), my-ailu, privacy, terms, referral-policy, coming-soon, plus app/api/* (enquiries, dreams, applications, partners, admin/search, auth)
- app/(admin)/admin/* the CRM: inbox, clients, events, quotations, tasks, vendors, finance, team, partners, commissions, dreams, applications, calendar, attention, settings
- components/ site components (Hero, CelebrationJourney, HomeExperience, Navbar, Footer, SiteChrome, FloatingWhatsApp, Intro ...), components/admin/*, components/forms/*, components/AiluWorld/*
- lib/ shared logic and tests, server/ database logic and tests, content/site.ts text content
- middleware.ts and auth.ts at the root
- docs/ project documents (guide, plans, checklist, reports). README.md, AGENTS.md and CLAUDE.md stay in the root.
- _local/ zip files, patches and source references. Git ignores it and it is never pushed.

## Two worlds (the website concept)
1. AILU World (immersive): the 360° world ported from the original AILU_Celebrations.html. Component: components/AiluWorld/AiluWorld.tsx. It has its own header, menu and WhatsApp link, so no site Navbar/Footer is shown there.
2. Normal World (classic site): the regular pages with Navbar and Footer (home, events, join, dreams, about, contact, legal pages).
- The two worlds must feel clearly separate.
- Visitors can switch between them with one easy, always visible button, from either side, on desktop and on phone:
  - in the AILU World: a button "Explore Website" (goes to the classic home)
  - in the Normal World: a button "Enter AILU World" (goes to the world)
- Never force-redirect people or search engine crawlers between the worlds.
- Real forms, the CRM and legal pages live in the Normal World. Links inside the AILU World that need an action open the real page (see the ROUTES table in AiluWorld.tsx).

## Rules (never break these)
- Do NOT edit components/AiluWorld/body.ts, engine.ts or ailu-world.css by hand. They are generated. If a change inside the world is needed, list it for Rohith instead.
- Prisma 7 setup is final: prisma.config.ts loads .env.local and uses DIRECT_URL, schema has no datasource URLs. Do not change it. No Prisma 8.
- Never open, print, edit or commit .env.local or any secret.
- Do not create or run database migrations, and do not reset the database, unless Rohith asks.
- No fake prices, reviews, rewards or availability anywhere on the site.
- Dreams are private: never publish a person's dream or story.
- No new dependency without asking first.
- No destructive git commands (reset --hard, push --force, branch delete, clean -f).
- Work on a feature branch, small commits, clear commit messages. Tell Rohith which branch you are on.
- Do not touch the CRM branch work (A0 to A4) unless the task is about it.

## Working across computers
Rohith works on more than one computer. Claude memory stays on one computer, so anything that must be remembered goes in this repo.
- At the end of each task, update docs/HANDOFF.md: what changed, next steps and decisions. Update Current state below when it changes.
- Commit and push those updates with the task, so the next computer gets them with git pull.
- Never put secrets in these files.

## Always before saying "done"
1. npm run lint, npx tsc --noEmit, tests, npm run build all pass.
2. Check the changed pages at 390px (phone) and 1440px (desktop): no horizontal scroll, no overlapping fixed elements.
3. Mention anything you could not verify. Do not claim something works if you did not run it.

## Working style
- Understand the code first, then change it. Read before you edit.
- Fix root causes, not symptoms. Keep changes small and focused.
- Prefer existing patterns in the repo over inventing new ones.
- Ask only when a decision is Rohith's to make; otherwise choose a sensible default and say what you chose.
- Give a short summary at the end: files changed, what was verified, what is left.

## Build order decided by Rohith
1. Finish the CRM (A0 to A4). A3 (team and partner commissions) waits on the partner reward policy.
2. Then the main public website (two worlds).
3. Then the CMS.

## Current state (update this section when things change)
- A0, A1, A2 of the CRM done and migrated on Neon.
- Two worlds merged to main on 2026-11-05 (PR #5). / = AILU World in src/app/(world). /classic and all real pages = Normal World in src/app/(site). /world and public/ailu-celebrations.html are gone.
- Switch buttons done: "Enter AILU World" in the Navbar and its menu; "Explore Website" and a Quick Links list in components/WorldSwitch.tsx.
- The intro plays once per session, only on / (components/Intro.tsx, sessionStorage "ailu-intro-seen").
- No form inside the world collects data. The rewards/points preview is removed. World copy changes are in src/content/site.ts (SITE_CONTENT.world).
- World site changes live outside the generated files: worldMarkup.ts (markup patches, tested by worldMarkup.test.ts), AiluWorld.tsx (hides Rewards, releases WebGL, keeps the title, fixes Back), world-brand.css (brand fonts and colours).
- Menu: Join and Dreams open their world rooms; only their form cards link to real pages. Speed: worldRenderer.ts lowers pixel density and drops quality on slow devices.
- Open: components/AiluWorld/CHANGES_FOR_GENERATOR.md lists the edits Rohith must make when regenerating body.ts, engine.ts and ailu-world.css. Until then the Google Fonts @import, unprefixed keyframes, off-brand 3D colours and canvas fonts remain, /#rewards still opens the rewards 3D room, and the rewards scene is still in the 3D world.
- Phone fixes (2026-11-05): 3D hero and journey scenes run only at 1024px and wider. World phone rules are in world-brand.css. Skip intro fades out, with no hand flight. Intro buttons are Enter AILU World and Explore Website, and their names are in the CMS Intro section. Phone turning goes through phoneTurn.ts. A first visit starts the 3D engine only from the intro (src/lib/worldStart.ts); WorldPoster shows until it is ready. scripts/strip-world-font-import.cjs removes the blocking font import at build time. Checked at 320, 360, 390, 768 and 1440px in the browser pane, not yet on a real phone.
- three stays at 0.160.0 because the world port requires it.
- CRM login is email and password (src/lib/password.ts, scrypt, no new dependency). Google is off unless AUTH_GOOGLE_ENABLED=true. The passwordHash migration is applied on Neon. First owner password: npm run staff:password -- <email>.
- CRM records: tasks, payments, expenses, vendor bookings, team assignments, draft quotations and timeline notes have edit and delete (src/app/(admin)/admin/records/actions.ts). Clients and events stay archive and restore. An owner can delete a vendor only if it has no event bookings; otherwise archive it. Rules are in src/lib/recordRules.ts.
- CRM login and records merged to main on 2026-11-05 (PR #7). Live at /admin/login. The public site stays hidden by COMING_SOON.
- CMS: /admin/cms. Default wording is in src/content (defaults.ts, pageText.ts, legalText.ts). Public pages read getContent() in src/server/cms.ts, or useContent() in client components. Editor screens are built from the shape of CMS_DEFAULTS, so a new key appears in the CMS automatically. Rules are in src/lib/cms.ts. Guide: docs/CMS_GUIDE.md. Photo upload needs a Vercel Blob store (BLOB_READ_WRITE_TOKEN).
- Audit: docs/AUDIT.md (2026-11-04).
