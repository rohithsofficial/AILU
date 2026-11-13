# Session log: 2026-11-12

Read this with `CLAUDE.md` and `docs/HANDOFF.md` to continue on any computer.
Owner: Rohith. Simple English, short sentences.

## The one branch
**`release/website`** has everything not yet on `main`. Merged into `main` on 2026-11-13, with Rohith's OK.
It contains `feat/languages`, `feat/cms-easy-editing` and `fix/home-feedback`. No other branch has missing work.
Merging to `main` makes it live on Vercel (public site still hidden by `COMING_SOON`).

## Done today
1. **Test enquiry** from `/celebrate?v=b` saved with its A/B note (`AILU-EVT-000002`, name "TEST Claude check - delete me"). Delete or archive it in the CRM before real traffic. It counts as one version B result.
2. **Languages** (another session): English, Kannada, Hindi, Malayalam, Tamil, Telugu on the website and `/celebrate`. All five are drafts, hidden on the live site until `checked: true` in `src/lib/i18n.ts`. See `docs/LANGUAGES.md`.
3. **Easier CMS**, modelled on the Western Terrain Coffee Roasters CMS: quick links, status badges, boxed editor, photo picker, Save and preview (draft mode), activity page. Tested signed in. See `docs/CMS_GUIDE.md`.
4. **Friend feedback 5 to 8**: compact idea cards (CMS photo optional), smaller gaps on phones on every page, one-line services list, 360° icon and "Take the 360° tour" card.
5. **Intro**: glowing "Enter AILU World" card; intro plays on a first visit, then again after 30 days.
6. **Phone top bar** fits at 320px in all six languages.

Checks on `release/website` at the last commit: lint, server lint, typecheck, 190 tests, build. Not tested on a real phone or the live site.

## Decided by Rohith
- Language switch: **yes on the website, no in the AILU World** (the world stays English).
- Build on `feat/languages`; keep "Enter AILU World" wording; icon + tour card for the world button.

## Started, not finished (continue here)
Rohith asked for these. Only the first file pair exists so far.

1. **Suggest a language by usage and location** (never a forced redirect: CLAUDE.md rule).
   - Done: `src/lib/langSuggest.ts` (rule: the visitor's own choice, then browser languages, then Indian state) and `src/lib/langSuggest.test.ts`. **Not yet run or wired in.**
   - To do: middleware sets cookie `ailu_region` from Vercel headers `x-vercel-ip-country` and `x-vercel-ip-country-region` (only on website pages). A small suggestion bar under the top bar in `src/app/(site)/[lang]/layout.tsx` ("This page is in ಕನ್ನಡ too: Read in ಕನ್ನಡ / Keep English"), not fixed, so nothing overlaps. Save the choice in localStorage `ailu-lang-choice`, also when the language switcher is used. Only switched-on languages are suggested, so nothing shows live until a language is checked.
2. **Analytics and pixels**: Google Analytics 4, Google Ads tag, Meta Pixel.
   - Plan: `src/lib/analytics.ts` + `components/Analytics.tsx` in the root layout, using `next/script` (no new package). Load only when IDs exist: `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_META_PIXEL_ID`. Never on `/admin`.
   - Consent bar (Google Consent Mode v2, default denied; Meta loads only after "Accept"). Raise the WhatsApp button while the bar shows.
   - Events: page views on route change; `generate_lead` on enquiry, team and partner form success (in `components/forms/useFormSubmit.ts`, no personal data, nothing for the dreams form); clicks on WhatsApp, phone and email links; entering the AILU World.
   - Needs from Rohith: the three IDs, and a lawyer-checked privacy policy update about cookies before the IDs go live.
3. **SEO keywords**: better titles and descriptions in `src/lib/public-metadata.ts` (PUBLIC_PAGE_CONTENT), e.g. "Event Management in Udupi", birthday, wedding and corporate event planners in Udupi, Manipal, Mangaluru. Hero eyebrow "Event management · Udupi, Karnataka". Keep within 60/160 characters, all true. No street address in structured data until Rohith gives the real one.
4. **A to Z growth guide**: `docs/GROWTH_GUIDE.md` in simple English: everything beyond building a site (Google Business Profile, Search Console, sitemap, SEO, keywords, speed, analytics, pixels, conversion tracking, A/B tests, landing pages, WhatsApp, reviews (real only), social, content/blog, local listings, ads, email/WhatsApp follow-up, privacy and consent, backups, uptime, accessibility), with what AILU already has and what is left.

## Local setup on the office PC (not needed on another computer)
- `D:\Rohith S Moolya\ailu-home`: folder on `release/website`. Local site: `localhost:3109` (draft languages visible).
- `D:\Rohith S Moolya\ailu-cms`: folder on `feat/cms-easy-editing`, `localhost:3108`.
- `D:\Rohith S Moolya\ailu`: the usual folder, on `feat/languages`.
- On another computer: `git fetch`, then `git switch release/website`, `npm install`, copy `.env.local` privately.
- To see draft languages locally: build and start with `NEXT_PUBLIC_SHOW_DRAFT_LANGUAGES=true`.

## Still open from before
- Native speaker check for each language (Kannada first); lawyer check for legal pages.
- Try the site and the world on a real phone.
- First live CMS publish; real photos; Google verification code; `COMING_SOON=false` at launch.
- Waiting on decisions: listed in `docs/HANDOFF.md`.
