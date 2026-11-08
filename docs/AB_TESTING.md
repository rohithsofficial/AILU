# A/B testing on the AILU website

Last updated: 2026-11-08

## 1. What is A/B testing? (simple version)

You make **two versions of one page**: version A and version B.
Each visitor sees **only one** of them, picked at random, like a coin flip.
After some time, you count which version brought **more enquiries**.
The winner stays. Then you test the next idea against it.

Example: a shop puts two posters in its window, one on Monday and one on Tuesday, and counts who walks in.
A/B testing does the same, but on the same day. That is fairer, because the weather, the day and
the visitors are the same for both versions.

Why it matters: you stop guessing. "I think this headline is better" becomes "this headline got 40% more enquiries".

Words you will hear:

| Word | Meaning |
|---|---|
| Variant / version | One of the two pages (A or B) |
| Control | Version A, the one you already have |
| Challenger | Version B, the new idea |
| Conversion | The action you want. Here: **an enquiry sent from the landing page** |
| Conversion rate | Enquiries ÷ visitors |
| Statistical confidence | How sure we are that the winner is really better, and not lucky |
| Sticky | A visitor keeps the same version on every visit |

## 2. How it works in this project

```
Visitor opens /celebrate
        │
        ▼
src/middleware.ts ──► Has a cookie "ailu_ab_landing"? ──yes──► keep that version
        │ no
        ▼
Is it Google or a link preview? ──yes──► always version A, no cookie
        │ no
        ▼
Pick A or B at random (50/50), save it in the cookie for 60 days
        │
        ▼
src/app/(landing)/celebrate/page.tsx shows that version's hero
        │
        ▼
Visitor sends the enquiry form ──► /api/enquiries saves the enquiry
                                   AND a CRM note: "Landing page test landing-hero-1: version B"
        │
        ▼
/admin/experiments counts the notes per version and says who is winning
```

### The files

| File | What it does |
|---|---|
| `src/lib/experiments.ts` | The rules: test name, cookie, random split, bots, the CRM note, and the winner check. Tested by `experiments.test.ts`. |
| `src/middleware.ts` | Puts each visitor into A or B (function `allow`). Runs only on `/celebrate`. |
| `src/content/landing.ts` | The wording of version A and version B (`LANDING_VARIANTS`), and the rest of the page. |
| `src/app/(landing)/celebrate/page.tsx` | The landing page. Reads the version and shows the right hero. |
| `src/components/EnquiryForm.tsx` | Sends `landing: "a"` or `"b"` with the enquiry, only on the landing page. |
| `src/app/api/enquiries/route.ts` | Saves the version as a NOTE in the enquiry's history (same database transaction). |
| `src/server/experiments.ts` + `src/app/(admin)/admin/experiments/page.tsx` | The results screen in the CRM ("A/B test" in the sidebar). Owner and manager only. |

### What changes between A and B right now

Only the **hero** (the first screen): the small line on top, the big headline, the short text and the button text.

| | Version A: "Feeling" | Version B: "Next step" |
|---|---|---|
| Headline | Creating moments. **Delivering smiles.** | Tell us the occasion. **We'll shape the plan.** |
| Button | Plan my celebration | Get my tailored quote |
| Idea | Emotion and brand promise | Clear action and what happens next |

Everything else on the page is identical. That is on purpose: if only one thing changes, the difference
in enquiries can only come from that one thing.

## 3. Why we count enquiries and not page views

Counting visitors needs a new database table (a migration), and Rohith decides on migrations.
We do not need it yet: the split is **random and 50/50**, so both versions get about the same number of visitors.
That means **the version with more enquiries has the better conversion rate.**

The winner check (`compareVariants`) uses a simple rule. If A and B were really the same, each enquiry would be
a coin flip between them. The gap is then measured as `z = (B − A) / √(A + B)`. When `z` is above 1.96 (or below −1.96),
there is less than a 5% chance that the gap is luck. That is the usual "95% confidence".

## 4. How to run a test (step by step)

1. **Pick one idea** to test. Write it down: "I think B will get more enquiries because ...".
2. Edit the wording of B in `src/content/landing.ts`. Keep A as it is.
3. If it is a new test, **change the `id`** in `LANDING_TEST` (`src/lib/experiments.ts`), for example `landing-hero-2`.
   Old notes keep the old id, so old results are not mixed in.
4. Check both versions yourself: `/celebrate?v=a` and `/celebrate?v=b`. (`?v=` also saves that version in your browser.)
5. Send traffic to **`/celebrate`** (not `?v=`): Instagram bio, WhatsApp status, Google or Meta ads, QR codes on posters.
   Tip: add `?utm_source=instagram` and similar, so you also know where people came from.
6. Wait. Do not stop early. Rules of thumb:
   - at least **2 full weeks** (weekdays and weekends behave differently), and
   - at least **30 landing enquiries in total** (the screen says "Not enough data yet" until then).
7. Open **CRM → A/B test**. When it says "Version X is winning (95% confidence)", make X the new version A.
8. Write the result in `docs/HANDOFF.md` (what you tested, the numbers, the winner). Then test the next idea.

## 5. Good ideas to test next (one at a time)

1. Form first: a short 3-field form (name, phone, occasion) at the top, with "add more details" later.
2. Button text: "Plan my celebration" vs "Check my date".
3. WhatsApp first vs form first as the main button.
4. A real photo of an AILU event (with permission) vs the hand logo in the hero.
5. A Kannada or Tulu greeting line vs English only.

## 6. Rules (do not break)

- Never test fake things: no invented prices, reviews, ratings, "only 2 dates left" or similar. Both versions must be true.
- Do not change the page in the middle of a test. Start a new test id instead.
- Google always sees version A, so search results stay stable. The page is `noindex` anyway (see `LANDING_PAGE.md`).
- The cookie holds only `a` or `b`. No personal data. It is `httpOnly`.

## 7. Limits and future upgrades

- Only `/celebrate` has a test, and only one test runs at a time. To test another page, add its path in the middleware
  (`allow` in `src/middleware.ts`) and give it its own cookie and id.
- WhatsApp clicks and phone calls are not counted, only form enquiries.
- Upgrade path when traffic grows (needs Rohith's OK):
  1. A small `ExperimentEvent` table (test id, version, "view" or "enquiry", day) to count visitors too. Needs a migration.
  2. Or Vercel Web Analytics with custom events (needs the `@vercel/analytics` package and a paid plan for custom events).
  3. Or a tool like PostHog or GrowthBook (new dependency, more features: many tests, funnels, heatmaps).
