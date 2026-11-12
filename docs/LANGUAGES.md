# Languages on the AILU website

The Normal World (the classic website and `/celebrate`) can show six languages:
English, Kannada (`kn`), Hindi (`hi`), Malayalam (`ml`), Tamil (`ta`) and Telugu (`te`).
The AILU World (`/`) and the CRM stay English.

## Addresses
- English keeps the same addresses: `/events`, `/classic`, `/celebrate`.
- Other languages add a prefix: `/kn/events`, `/hi/classic`, `/ta/celebrate`.
- `/en/events` sends you to `/events`. `/kn` sends you to `/kn/classic`.
- Links on a Kannada page stay in Kannada. "Enter AILU World" always opens the English world.

## Is a translation live?
Every translation is a **draft** until a native speaker has read all of it.
A draft language:
- works when you open its address (so a checker can read it),
- is **not** in the language switcher on the live site,
- is kept out of Google (`noindex`, not in the sitemap, no hreflang),
- shows a short note at the top: "This translation is a draft… Read in English".

The switcher shows draft languages while developing (`npm run dev`), or on a site built with
`NEXT_PUBLIC_SHOW_DRAFT_LANGUAGES=true` (set it in Vercel for Preview only, if you want to review there).

### Mark a language as checked
1. A native speaker reads every page in that language and the CMS wording, and fixes what is wrong.
2. In `src/lib/i18n.ts`, set `checked: true` for that language in `LANGUAGES`.
3. Commit and deploy. The language then appears in the switcher, in Google (hreflang, sitemap) and loses the draft note.

Once any language is checked, English pages also get hreflang links, and the language button appears in the top bar on every page.

## What is translated now (all drafts)
All five languages (Kannada, Hindi, Malayalam, Tamil, Telugu) cover everything in the Normal World:
every page, the celebration types, FAQs, forms and errors, menu and footer, legal pages, SEO titles and `/celebrate`.
The AILU World stays English. Tamil and Malayalam use a short "AILU World" button label so it fits on phones.

Legal pages in another language show: "This translation is for your convenience. If it differs from the English version, the English version applies." A lawyer should also see the translations.

## Where the words live
- English wording: `src/content` (as before). Form labels, errors and menu words are in `src/content/uiText.ts` (CMS section "Buttons, forms and messages").
- Translations: `src/content/translations/kn.ts` (+ `kn.legal.ts`). Hindi, Malayalam, Tamil and Telugu each have three files:
  `hi.ts` (menu, footer, forms), `hi.pages.ts` (page text and `/celebrate`) and `hi.legal.ts` (legal pages); the same for `ml`, `ta`, `te`.
  Each file holds only text. Links, photos, ids and contact details always come from English.
  A missing line shows in English, so a page is never blank.
  Lists follow the English order: item 1 translates item 1.
- Keep `{phone}`, `{email}`, `{id}` and `{privacy}` exactly as written. A test checks this.

## Editing a translation in the CMS
In `/admin/cms`, pick the language at the top. Each field shows the English line under it.
Only text can be changed; links, photos and list order are shared with English, so change those in English.
Saving and publishing work as in English. "Restore original" goes back to the translation file.
A translated section is saved as its own row (`hero:kn`) in the existing `CmsSection` table: no migration.
If you add, remove or reorder items in an English list, update each language's list too.

## Fonts
Poppins and Inter have no Indian scripts. Translated pages use Noto Sans Kannada, Devanagari, Malayalam, Tamil and Telugu
(`src/app/layout.tsx`, `next/font`). They are not preloaded: a browser downloads one only when a page shows that script,
so English pages download nothing extra. Rules for line height and letter spacing are in `src/app/globals.css` (`.i18n-script`).

## Code map
- `src/lib/i18n.ts`: languages, `localePath`, middleware routing, hreflang, `overlayTranslation`. Tests: `i18n.test.ts`.
- `src/middleware.ts`: serves English from `/en/...` without changing the address.
- `src/app/(site)/[lang]/`, `src/app/(landing)/[lang]/`: the pages, built for every language.
- `src/components/LocaleLink.tsx`: use it instead of `next/link` on Normal World pages, so links keep the language.
- `src/components/LanguageSwitcher.tsx`, `LanguageRoot.tsx`, `DraftLanguageNote.tsx`.
- `src/server/cms.ts`: `getContent(locale)`, `buildContent(published, locale)`.
- Tests for the translation files: `src/content/translations/translations.test.ts`.

## Known limits
- The server sends `<html lang="en">`; a tiny script sets the right language before the page shows,
  and the page content is wrapped in `<div lang="kn">`. Search engines and screen readers read the wrapper.
- Form errors from the server are English. Other languages show the matching CMS message instead.
- The coming-soon page, the 404 page, the loading screen label and a few screen-reader-only labels are English.
- Values saved in the CRM (role, event types) stay English whatever the visitor's language.
