# AILU handoff

This file lets work continue on any computer. Claude reads it at the start of a session and updates it at the end.
Never put passwords, keys or connection strings here. This file goes to GitHub.

Last updated: 2026-11-12 (languages)

## Owner
Rohith. Freelance developer. Often sends voice-typed messages, so read for the meaning. Use simple English and short sentences.

## Where things are
- **Live site:** https://www.worldofailu.com (hidden by `COMING_SOON=true`)
- **CRM:** https://www.worldofailu.com/admin
- **CMS:** https://www.worldofailu.com/admin/cms (guide: `docs/CMS_GUIDE.md`)
- **GitHub:** https://github.com/rohithsofficial/AILU (`main` goes live on Vercel)
- **Vercel:** project `worldofailu`, team `rohithofficial99`
- **Neon:** project `super-hat-36693606`, branch `production`
- **Blob store:** `ailu-media`, connected to Production and Preview

## What is finished
- CRM with email and password login, plus edit and delete for records.
- Two worlds: AILU World at `/`, website at `/classic`.
- Phone layout fixes, phone turning fix and a smoother intro.
- CMS with SEO and a photo library.
- Speed work. Local Lighthouse, first visit, phone: 88.
- Project files tidied into `docs/` and `_local/`.

## Visitor feedback round
Rohith is sharing feedback from a friend, one point at a time. For each point: fix it, then check for the same problem across the whole site. The goal is an easy, clear site for visitors.

| # | Feedback | Status |
|---|---|---|
| 1 | Tapping small dots is hard, add left and right swipe | Done, on `main`: home story swipe, quick flick in world rooms, hints on both. Not tested on a real phone |
| 2 | Explore menu options seem to do nothing | Done, on `main`: a slow database can no longer hold up a page, and website pages show a loading screen. Rohith still needs to confirm the menu |
| 3 | In the world, moving up or down shows a blank page | Done, on `main`: `levelView.ts` keeps the view level, drag turns left and right only |
| 4 | Each world step should show what it is | Done, on `main`: step bar with room name, "Step 2 of 5", named chips and "Next: ..." (`worldSteps.ts`) |

## Work on 2026-11-08 (branch `claude/new-session-x8qhdu`, merged to `main` on 2026-11-12)
Full report: `docs/REPORT_2026-11-08.md`.
- Health check: lint, typecheck, 139 tests and build pass. `npm audit` has 1 critical and 4 high advisories (Next 14, zod 3, @vercel/blob). Upgrade waits for Rohith.
- World: level view and named steps (feedback 3 and 4 above).
- New landing page `/celebrate` (`docs/LANDING_PAGE.md`) with an A/B test on its hero (`docs/AB_TESTING.md`). Results: CRM → A/B test. No migration, no new package.
- `/privacy` no longer scrolls sideways on phones.
- Ideas and questions for Rohith: `docs/IMPROVEMENT_IDEAS.md`.
- Not verified here (no database on this computer): a real landing enquiry saving its A/B note, and the results screen while signed in.

## Code review on 2026-11-08 (same branch)
Full report: `docs/CODE_REVIEW_2026-11-08.md`. Code map: `docs/CODE_MAP.md`.
- Fixed: an empty "Expected guests" box blocked every enquiry; CRM name search returned every record (7 lists);
  unreadable form errors and buttons; tasks due today shown as overdue; inbox crash on odd page or status in the address;
  login crash on a damaged hash; partner double-submit message; WebGL context leak; Escape on the intro.
- Structure: shared helpers `src/lib/actionMessage.ts`, `src/lib/dates.ts`, `src/lib/search.ts` replace copied code.
- Every source file now starts with a comment saying what it is for.
- 150 tests pass. Lint, typecheck and build pass.

## Review and merge on 2026-11-12
Reviewed `claude/new-session-x8qhdu`: no new package, no migration, no change to the generated world files, landing wording matches the site. Lint, server lint, typecheck, 150 tests and build pass. `/celebrate` (A and B), `/privacy`, `/classic`, `/events` checked at 390px and `/celebrate` and `/` at 1440px: no sideways scroll, no console errors. Fast-forward merged to `main`. Not checked: a real enquiry save and `/admin/experiments` signed in (no database here), the world on a real phone.

## Languages on 2026-11-12 (branch `feat/languages`, not merged)
Rohith chose: address prefixes with our own code (no new package), AI drafts hidden until checked, Kannada full and the other four partial, CMS editing per language with no migration. Guide: `docs/LANGUAGES.md`.
- English addresses and wording are unchanged. `/kn/...`, `/hi/...`, `/ml/...`, `/ta/...`, `/te/...` serve the other languages. The AILU World and the CRM stay English.
- Kannada: all Normal World pages, `/celebrate`, forms, errors, legal pages, SEO titles. Hindi, Malayalam, Tamil, Telugu: menu, footer, switcher, forms and errors.
- All five are **drafts**: not in the live switcher, `noindex`, with a "draft, read in English" note. Turn one on with `checked: true` in `src/lib/i18n.ts` after a native speaker checks it.
- Language button in the top bar (phone and desktop), the Explore menu and the footer. It shows on the live site only once a language is checked.
- New CMS section "Buttons, forms and messages" (form labels, errors, menu words). CMS language picker; translated sections save as rows like `hero:kn`.
- Noto Sans fonts for the five scripts, downloaded only when a page shows that script.
- Checked: lint, server lint, typecheck, 180 tests, build. In the browser: 17 pages × 6 languages at 390px and 320px (no sideways scroll beyond 1px rounding), Kannada and English at 1440px, the switcher, a Kannada enquiry with empty fields (Kannada errors), English errors unchanged, the A/B test on `/celebrate` and `/kn/celebrate`.
- Not checked: CMS language editing signed in (no database on this computer), a real phone, the live site.
- World text: nothing needs to change in the generated world files. "Explore Website" in the world opens the English site.

## Next steps
0. Languages: have a native speaker read `/kn/classic` and the other Kannada pages (and a lawyer the Kannada legal pages). Then set `kn` to `checked: true`, merge `feat/languages`, and test CMS editing in Kannada on the live site.
1. Send one test enquiry from `/celebrate?v=b` (leave Expected guests empty) and check CRM → A/B test, Note: that test enquiry counts as one version B result (results come from the saved notes), so subtract it, or change `LANDING_TEST.id` before real traffic starts. Try a name search in CRM → Inbox and Clients.
2. Try the world on a real phone: drag up and down, tap the step chips.
3. Answer the questions at the end of `docs/IMPROVEMENT_IDEAS.md`.
4. Continue the feedback round: Rohith sends the next point.
5. Try one publish in the CMS on the live site. It was tested only on a local server.
6. Add real content, social links and permitted photos in the CMS.
7. Add the Google verification code in CMS, under SEO for every page.
8. Have a lawyer review the legal pages.
9. Launch: set `COMING_SOON=false` in Vercel, then run Lighthouse again.

## Waiting on a decision
- Should an Accepted quotation be final? Today it can go back to Draft and be deleted.
- Security upgrade to Next 15 / zod 4 (`npm audit` advisories).
- How to count landing page visits: Vercel Web Analytics or a small table (migration).
- Partner reward policy. The reward screens exist, but do not use them for real rewards yet.
- Regenerating the world files: see `src/components/AiluWorld/CHANGES_FOR_GENERATOR.md`.
- Entering the world is still heavy on slow phones. The real fix needs engine changes.

## Notes for Claude
- `localhost:3000` on the office PC may be the Western Terrain Coffee Roasters project, not AILU. Check before testing.
- `.env.local` points to the live database. Test risky changes on a temporary Neon branch.
- `next start` can keep running after its task stops. Check the port before trusting a local test.
- Some networks block the Neon database port 5432. Then localhost pages use default wording and CRM login fails, while the live site is fine. Test with `Test-NetConnection` or use another network.
- Some Vercel connector calls fail with 403. The `vercel` command line works when signed in.
- Test names like "Rani" in `*.test.ts` files are sample customers only.

## New computer setup
1. Install Node.js, Git and VS Code. Sign in to GitHub.
2. Run these commands:

```bash
git clone https://github.com/rohithsofficial/AILU.git
cd AILU
npm install
```

3. Copy `.env.local` from the office PC to the project folder. Use a private method, such as a USB drive or a password manager. Do not email it, and do not commit it.
4. Copy `_local/` too, if you need the zip files or world source files.
5. Run `npm run dev` and open the address it prints.

## Daily routine
- Before starting: run `git pull`.
- Ask Claude to read `docs/HANDOFF.md` and continue.
- Before leaving: ask Claude to update this file, commit and push.
