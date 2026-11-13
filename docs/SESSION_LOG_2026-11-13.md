# Session log: 2026-11-13

Read with `CLAUDE.md`, `docs/HANDOFF.md` and `docs/PROJECT_STATUS.md`. Yesterday's log (with the unfinished task plans): `docs/SESSION_LOG_2026-11-12.md`.

## Done
- Merged `release/website` into `main` (languages, easier CMS, home feedback, intro). Live build checked.
- Removed the extra folders `ailu-home` and `ailu-cms` (git worktrees). One folder again: `ailu` on `main`.
- Vercel: `NEXT_PUBLIC_SHOW_DRAFT_LANGUAGES=true` moved from Production to **Preview only**. Preview links show the language switch; the live site does not.
- Fixed phone overflow (`fix/mobile-overflow`, merged): on 400–480px phones the top bar was ~70px too wide and stretched the Explore menu. Scanned 320–768px, all pages, menu open, six languages: all fit.
- New branch `testing` with a permanent preview link for testers. Update it after each merge: `git push origin main:testing`.
- Rule from Rohith: **preview first, then `main`** (written in HANDOFF).

## Learned
- `NEXT_PUBLIC_*` settings are fixed when Vercel builds. Changing one needs a new build, and the old build keeps the old value.
- After a push to `main`, the `worldofailu-git-main-…` address follows the production build, so Preview-only settings do not apply there. Use the `testing` branch link.
- Test every phone width from 320 to 480px, not only 375/390: many Android phones are 400–430px.
- Vercel sometimes misses a GitHub push (check stays "pending"). Start the build with the Vercel API or Redeploy.
- Preview links need a Vercel login; testers need a Share link from the Vercel toolbar on the preview page.

## Blocked / waiting
- A native speaker check before any language goes live.
- IDs for Google Analytics, Google Ads and Meta Pixel, and a lawyer-checked privacy policy update, before tracking goes live.

## Next
1. Friend checks the testing link; fix their notes (branch → preview → merge).
2. Continue the unfinished tasks in `docs/SESSION_LOG_2026-11-12.md`.
