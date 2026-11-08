# The AILU landing page (`/celebrate`)

Last updated: 2026-11-08

## 1. Web page vs landing page

| | Normal web page (home, events, about) | Landing page (`/celebrate`) |
|---|---|---|
| Goal | Many: explore, learn, join, contact | **One**: get an enquiry |
| Who comes | Anyone (Google, friends, curious people) | People from a **campaign**: an ad, an Instagram post, a WhatsApp message, a QR code |
| Menu | Full menu and footer | Almost none, so people do not wander off |
| Content | Everything about AILU | Only what helps someone decide to enquire |
| Measured by | General visits | **Conversion rate** (enquiries ÷ visitors) |

Simple picture: the website is AILU's **shop**. The landing page is the **counter** where a customer
who already walked in from an advert is helped to place an order.

## 2. What is on the page, and why

Research points used (sources at the end): most event visitors are on phones; slow pages lose visitors
(phone bounce rate rises sharply after about 3 seconds); one clear action; the main message on the first screen;
trust signals; the page should match the advert that brought people there.

| Section | Why it is there |
|---|---|
| Small header: logo, **Enter AILU World**, **Call** | Few exits. The world switch stays visible (project rule). Calling is one tap on phones. |
| Hero (headline, short text, main button, WhatsApp) | Says in 5 seconds what AILU does and what to do next. **This part is A/B tested.** |
| Four honest trust points | Based in Udupi · No payment to enquire · North and South Indian traditions · A quotation made for your event. True facts only. No fake reviews. |
| "What are you celebrating?" | Visitors see their own occasion and feel "this is for me". Titles come from the CMS (Celebrations). |
| How it works (3 steps) | Removes fear: what happens after I enquire? Says clearly that an enquiry is not a booking. |
| Why AILU (3 points) | The reasons to choose AILU, in plain words. |
| The enquiry form | The goal of the page. The same form as `/events`, so enquiries go to the same CRM inbox. |
| Short FAQ (3 questions) | Answers the top doubts: what happens next, is it a booking, what does it cost. |
| Final call to action | For people who read to the end. |
| Sticky bar on phones: **Enquire** and **WhatsApp us** | The two main actions are always under the thumb. Hidden on desktop. |

Speed: no 3D, no video, one image (the hand, desktop only). The page is light so it opens fast on mobile data.

## 3. Search engines

The page is set to `noindex` (Google does not list it) and is not in the sitemap. Reasons:
it is made for campaigns, the main pages already cover search, and two versions of a page
should not compete in Google. If you want it in Google later, change `robots` in
`src/app/(landing)/celebrate/page.tsx` and add the path to the sitemap.

## 4. How to use it

- Share the link `https://www.worldofailu.com/celebrate` in ads, Instagram bio, WhatsApp, posters (QR code).
- Add tracking words so you know the source, for example
  `https://www.worldofailu.com/celebrate?utm_source=instagram&utm_campaign=wedding-season`.
- While `COMING_SOON=true`, the page is hidden like the rest of the site.
- See the A/B test results in the CRM: **A/B test** in the sidebar. Details in `docs/AB_TESTING.md`.

## 5. How to change the wording

All text is in `src/content/landing.ts`:
- `LANDING_VARIANTS.a` and `.b`: the hero of each version.
- `LANDING`: everything else (trust points, titles, why AILU, FAQ count, button labels).
The FAQ answers and the 3 steps come from `src/content/site.ts`, so they stay the same as the rest of the site.

Rules: no prices, reviews, ratings, booking counts or promises AILU has not confirmed.

Later idea: move this wording into the CMS so it can be edited without code. Note: changing it during a test
breaks the test, so the CMS screen should warn about that.

## 6. Files

- `src/app/(landing)/layout.tsx`: the small header and footer, used only by landing pages.
- `src/app/(landing)/celebrate/page.tsx`: the page.
- `src/content/landing.ts`: the wording.
- A new landing page (for example `/wedding` for a wedding campaign) can be added next to `celebrate/` in `src/app/(landing)/`.

## Sources

- [Landing Page Best Practices for 2026 (LearnyBox)](https://learnybox.com/en/blog/landing-page-best-practices/)
- [Mobile landing page (Webstacks)](https://webstacks.com/blog/mobile-landing-page)
- [How to Build an Event Landing Page That Converts](https://delraybeach.com/2022/01/06/how-to-build-an-event-landing-page-that-converts/)
- [Create a successful landing page (Eminence)](https://eminence.ch/en/create-successful-landing-page-increase-conversion-rate/)
- [17 Event Landing Pages That Convert in 2026 (Perspective)](https://www.perspective.co/article/event-landing-page)

Most of these are marketing blogs, so treat their numbers as rough guides. Our own A/B test results are the real answer.
