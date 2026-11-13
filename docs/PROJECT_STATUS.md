# AILU project status

Last updated: 2026-11-13

Short snapshot only. Full details, setup steps and notes are in `docs/HANDOFF.md`. Daily logs: `docs/SESSION_LOG_*.md`.

## Where things stand
- `main` has all finished work: CRM, two worlds, CMS (easier editing with preview), six languages (drafts), home and phone fixes.
- The public site is still hidden by `COMING_SOON=true`. The CRM and CMS are live at worldofailu.com/admin.
- Languages: switch hidden on the live site until a language is marked `checked` in `src/lib/i18n.ts`.
- **Testing link** (always matches `main`, shows the language switch): https://worldofailu-git-testing-rohithofficial99.vercel.app
- **Rule:** every change is checked on a preview link first, then merged into `main`, then `git push origin main:testing`.

## Latest work (2026-11-12 and 13, merged to `main` on 2026-11-13)
- Languages: English, Kannada, Hindi, Malayalam, Tamil, Telugu (machine drafts, need a native speaker check).
- Easier CMS: page status, boxed editor, photo picker, Save and preview, Activity page.
- Home: compact idea cards, smaller phone gaps, one-line services list, 360° tour card and icon, three-line menu button.
- Intro: glowing World card; plays on a first visit, then every 30 days.
- Phone overflow fixed at every width 320–768px (top bar and Explore menu were too wide on 400–480px phones).

## Not checked yet
- Everything on a real phone (only browser checks so far).
- CMS Publish and photo upload on the live site.
- Translations by a native speaker.

## Next
1. A friend checks the testing link (languages, phone layout). Fix their notes on a branch, preview, then merge.
2. Unfinished tasks in `docs/SESSION_LOG_2026-11-12.md`: language suggestion bar, analytics and pixels with consent, SEO keywords, A to Z growth guide.
3. Launch steps under Next steps in `docs/HANDOFF.md`.
