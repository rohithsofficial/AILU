# AILU handoff

This file lets work continue on any computer. Claude reads it at the start of a session and updates it at the end.
Never put passwords, keys or connection strings here. This file goes to GitHub.

Last updated: 2026-11-13

**Start here:** read `docs/PROJECT_STATUS.md`, then the latest `docs/SESSION_LOG_*.md` (2026-11-13). Unfinished task plans are in `docs/SESSION_LOG_2026-11-12.md`. New work: a new branch from `main`, checked on its preview link before merging.

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
| 5 | Home idea cards are empty picture boxes | On branch `fix/home-feedback`: compact cards with a faint AILU hand; each card shows a photo once one is chosen in CMS → Home sections → Ideas |
| 6 | Too much gap between sections | Same branch: phone spacing about 36px above and below each section on all public pages and `/celebrate`; desktop unchanged. Measured at 390px: gaps from 125–160px down to under 100px on most pages |
| 7 | The "right people" table looks off | Same branch: number and name on one line, no empty boxes |
| 8 | Few people click Enter AILU World | Same branch, Rohith chose icon + tour card: a turning 360° icon on the button (`World360Icon.tsx`), a "Take the 360° tour" card under the top section (`WorldTourCard.tsx`, wording in CMS Home sections, draft translations), and three lines on the phone menu button |
| 9 | Intro: make the AILU World exciting, and do not show the intro every time | On `release/website`: the world choice is a glowing card with a 360° icon, badge and a line about what waits inside; the intro plays on a first visit, then again after 30 days |
| 10 | Phone overflow: top bar and Explore menu wider than the screen (seen on a 412px Android) | Branch `fix/mobile-overflow`: on phones the language button shows only the globe, the menu button only the three lines, and the 360° icon hides when the language button is there. Scanned 320–768px: home and menu in all six languages, every website page in English and Kannada, the world and the login: all fit |

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
- All five languages (Kannada, Hindi, Malayalam, Tamil, Telugu) now cover every Normal World page, `/celebrate`, forms, errors, legal pages and SEO titles (Hindi, Malayalam, Tamil and Telugu completed later on 2026-11-12).
- All five are **drafts**: not in the live switcher, `noindex`, with a "draft, read in English" note. Turn one on with `checked: true` in `src/lib/i18n.ts` after a native speaker checks it.
- Language button in the top bar (phone and desktop), the Explore menu and the footer. It shows on the live site only once a language is checked.
- New CMS section "Buttons, forms and messages" (form labels, errors, menu words). CMS language picker; translated sections save as rows like `hero:kn`.
- Noto Sans fonts for the five scripts, downloaded only when a page shows that script.
- Checked: lint, server lint, typecheck, 180 tests, build. In the browser: 17 pages × 6 languages at 390px and 320px (no sideways scroll beyond 1px rounding), Kannada and English at 1440px, the switcher, a Kannada enquiry with empty fields (Kannada errors), English errors unchanged, the A/B test on `/celebrate` and `/kn/celebrate`.
- Not checked: CMS language editing signed in (no database on this computer), a real phone, the live site.
- World text: nothing needs to change in the generated world files. "Explore Website" in the world opens the English site.

## Home feedback on 2026-11-12 (branch `fix/home-feedback`, from `feat/languages`, not merged)
Points 5 to 8 in the feedback table. Merge order: `feat/languages`, then `feat/cms-easy-editing`, then this branch.
- Checked: lint, server lint, typecheck, tests, build; 12 pages at 390px for gaps and sideways scroll; `/classic` at 320px and 1440px; Kannada, Tamil (390px) and Malayalam (320px) home. Not checked: a real phone.

## Easier CMS on 2026-11-12 (branch `feat/cms-easy-editing`, from `feat/languages`, not merged)
Rohith asked for the CMS to work like the Western Terrain Coffee Roasters CMS: page by page, clean, with preview and easy photos.
Rohith chose to build on `feat/languages`, so merge `feat/languages` first, then this branch.
- CMS home: quick links (Business details, Photo library, SEO, Activity, Staff accounts), a "Waiting to be published" list, status badges and "View page ↗" on every section.
- Editor: one box per part of a section, length counters, "+ Add ..." and ↑ ↓ for lists, an "Unsaved changes" note and a warning before leaving, confirm before Publish.
- Photo picker (`components/admin/MediaPicker.tsx`): thumbnail, Change photo, search the library or upload with a description, in one window.
- Save and preview: Next.js draft mode (`/api/admin/cms/preview`), staff only. `getContent()` reads drafts only in preview. A yellow bar on the site offers Back to editor and Exit preview. Public pages stay static.
- Activity page `/admin/cms/activity` from the audit log. Staff accounts reuse `/admin/settings/staff`.
- No new package, no migration. Each section now has a `path` in `CMS_SECTIONS` (tested).
- Fixed while testing: Save and preview now opens with a full page load (`OpenPreview.tsx`), because a form redirect did not keep the preview cookie; the preview bar sits above the WhatsApp button on phones; after Discard, Undo or Restore the form shows the saved wording, not old typing (this was also wrong before); labels like "atAGlance" read "At a glance".
- Checked: lint, server lint, typecheck, 187 tests, build (public pages still static). Signed in on localhost with the live database at 390px and 1440px: CMS home, editor boxes and counters, Unsaved changes, photo picker window, Save and preview (draft shown, bar shown, no overlap on `/classic` and `/`), Back to editor, Exit preview, Activity, Discard draft. Test drafts were discarded.
- Not checked: uploading a photo (would go to the real photo store), Publish (would change the live site), a translated section, a real phone.

## One branch for the whole website (2026-11-12): `release/website`
Rohith asked for everything in one branch before merging to main. `release/website` = `fix/home-feedback` (which contains `feat/languages`) + `feat/cms-easy-editing` + the intro update. Merge only this branch into `main`.
- Draft languages are hidden on the live site until a native speaker checks them (`checked: true` in `src/lib/i18n.ts`). To see them locally, build and start with `NEXT_PUBLIC_SHOW_DRAFT_LANGUAGES=true`.
- Phone top bar: below 400px the menu button shows three lines only, and with the language button the 360° icon hides, so the bar fits at 320px in all six languages.
- Checked: lint, server lint, typecheck, 190 tests, build; intro first visit and a returning new session (no intro, world starts); top bar 320 to 1440px in all six languages. Not checked: a real phone, the live site.

## Vercel setting (2026-11-13)
`NEXT_PUBLIC_SHOW_DRAFT_LANGUAGES=true` is set for **Preview only**. Preview links show the language switch with all drafts; the live site shows only checked languages. Preview links need a Vercel login; to let a tester in, use the Share button in the Vercel toolbar on the preview page.

**Testing link for friends and testers:** branch `testing` always matches `main`. Its preview, https://worldofailu-git-testing-rohithofficial99.vercel.app, shows the language switch. After every merge to `main`, update it with `git push origin main:testing` (never edit `testing` directly). The `worldofailu-git-main-…` address follows the live build, so it does not show draft languages.

**How changes go live (Rohith, 2026-11-13): preview first, then main.**
1. Do the work on a new branch from `main` and push it. Vercel makes a preview link for that branch.
2. Rohith (or a tester) checks the preview link. Only after Rohith says it is fine, merge the branch into `main`.
3. Then update the testing link: `git push origin main:testing`.
- If Vercel does not build a push (the GitHub check stays "pending"), start the build with the Vercel API (POST /v13/deployments with gitSource ref = the branch, repoId 1439892129) or Redeploy in the dashboard.

## Next steps
0. Languages: have a native speaker check each language (start with Kannada at `/kn/classic`), and a lawyer the translated legal pages. Mark each checked language `checked: true` in `src/lib/i18n.ts`, merge `feat/languages` with Rohith's OK, and test CMS editing in one language on the live site.
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
