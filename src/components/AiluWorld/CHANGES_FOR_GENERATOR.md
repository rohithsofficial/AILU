# Changes for the next world regeneration

`body.ts`, `engine.ts` and `ailu-world.css` are generated and are not edited by hand.
The site applies its own changes in `worldMarkup.ts` (markup) and `AiluWorld.tsx` (wrapper).
When you regenerate, please make these edits in the source so the workarounds can be removed.

## Markup (source of `body.ts`)

Already handled by `worldMarkup.ts`; once the source has them, the matching patch does nothing.

1. Remove the three `<form class="waForm">` blocks (`enqForm`, `jobForm`, `dreamForm`). Keep an element with the same id, holding a link to `/events#enquire`, `/join/team` or `/dreams`.
2. Remove the Rewards nav link, the footer "Rewards" link, the "AILU Rewards / Try the preview" card and the whole points preview in `rewardsView`.
3. Replace "Field sales and referrals … not open yet" with the open partner programme (`/join/partner`, rewards only for verified, completed, paid bookings, no guaranteed earnings).
4. Replace the `policiesView` text: it mentions Netlify, Google Fonts and a closed referral programme. Link to `/privacy`, `/terms`, `/referral-policy` instead.
5. Dreams: say a parent or guardian must be involved for anyone under 18. Do not say "Private submissions for adults".

## Engine (`engine.ts`)

1. Remove `['rewards','Rewards']` from `PLACES` and `'rewards'` from `prepList`, and delete the rewards sub-world and the `hands` / `rwFx` / `tally` / `rwReset` code. Until then `AiluWorld.tsx` removes the Rewards hotspot and dock button after start, and `worldMarkup.ts` keeps hidden stub elements so the engine does not crash.
2. Remove the `.waForm` submit handler (including the `fetch('/')` POST) and the "Forms become short steps" block.
