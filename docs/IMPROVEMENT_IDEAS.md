# Ideas to make AILU better

Last updated: 2026-11-08. Ordered by value for the effort. Each item says what it needs from Rohith.

## A. Must do before launch

1. **Security upgrade.** `npm audit` reports a critical advisory in Next.js 14 and high ones in zod 3 and `@vercel/blob`.
   Plan: a separate branch to move to Next 15 (and React 19), zod 4 and the latest `@vercel/blob`; run every check; test the CRM login,
   forms and the world. *Needs: Rohith's OK (major upgrade).*
2. **Real photos.** Nothing sells events like real events. 6 to 12 photos of AILU events, with the people's permission,
   in the CMS gallery and on the landing page. This will likely beat any headline in the A/B test. *Needs: photos and permission.*
3. **Real phone test** of the world (drag, step chips, swipe) on one cheap Android and one iPhone. *Needs: 15 minutes with two phones.*
4. **Measure visits.** Turn on Vercel Web Analytics (free plan counts page views; one script tag or the `@vercel/analytics` package).
   Then we know how many people open `/celebrate` and the conversion rate, not only the enquiry counts. *Needs: OK for the package, or a migration for our own counter (see `AB_TESTING.md` §7).*

## B. Get more customers

5. **One landing page per campaign**: `/wedding`, `/birthday`, `/corporate`. The page must match the ad. A wedding ad that opens a wedding page converts better than a general page. The layout in `src/app/(landing)/` is ready for this.
6. **Google Business Profile** for AILU Udupi: most local customers search "event planners in Udupi" on Google Maps. Add photos, hours, the WhatsApp number and the `/celebrate` link. Ask happy clients for **real** Google reviews. *Needs: Rohith or the AILU team, no code.*
7. **WhatsApp first.** In India most enquiries end on WhatsApp. Test "WhatsApp us" as the main button (A/B idea 3). Later: WhatsApp Business catalogue with event types.
8. **A short form.** The enquiry form has 10 fields. Test a 3-field version (name, phone, occasion) on the landing page; staff ask the rest on the call.
9. **Speed follow-up in the CRM.** A "reply within 1 hour" rule in Needs attention for new enquiries. Fast replies win most event bookings.
10. **Kannada (and Tulu) text** for the landing page hero and key buttons. Many families in Udupi prefer it. *Needs: approved translations.*

## C. AILU World

11. **Regenerate the world** with the list in `src/components/AiluWorld/CHANGES_FOR_GENERATOR.md`. It removes the workarounds, the Google Fonts import, the off-brand colours and the Rewards scene, and makes it faster on slow phones.
12. **Lighter first visit on slow phones.** Show a 2D version of the world (the existing poster plus the step cards) when the device is slow, and the 3D only on capable devices.
13. **Sound** (optional, off by default): soft chande or nadaswaram in rooms, with a clear mute button.
14. **Guided tour button**: "Show me around" plays the stops of a room one after another, for people who do not want to drag.

## D. CRM and CMS

15. **Landing text in the CMS** (with a warning not to change a running test).
16. **Enquiry source** field: store `utm_source` with each enquiry, so the CRM shows which ads and posts bring customers. *Needs: a migration (one new column).*
17. **Daily summary email** to the owner: new enquiries, tasks due, payments due.
18. **Backups**: a Neon branch snapshot schedule, and a written restore test.

## E. Quality habits

19. Run `npm run lint`, `npx tsc --noEmit`, `npm test` and `npm run build` in a GitHub Action on every push, so a broken change never reaches `main`.
20. Lighthouse check on `/classic`, `/events` and `/celebrate` before each release (phone mode). Target: 90+.

## Questions for Rohith

1. Can I plan the Next.js 15 / zod 4 security upgrade on its own branch? (Item 1)
2. Do you have event photos we may publish? (Item 2)
3. Which counter do you prefer for visits: Vercel Web Analytics, or our own small table? (Item 4)
4. Which campaign comes first: weddings, birthdays or corporate? I can build its landing page next. (Item 5)
