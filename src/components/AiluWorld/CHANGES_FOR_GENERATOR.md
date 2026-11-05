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
3. Line ~615: canvas text uses `Manrope` and `Fraunces`. Use `Poppins` (headings) and `Inter` (body). Read the family names from `getComputedStyle(ROOT).getPropertyValue('--head')`, because next/font gives them generated names.
4. `GOLD='#f4bb25'`, `CREAM='#fff7e6'`, `FIG='#0b0c0a'` and the 3D colours (`0xffd27a` and similar): use `#F5C400`, `#FFFDF7`, `#111111`.
5. In `stop()`: call `r.dispose()` on the renderer and dispose geometries, materials and textures. `AiluWorld.tsx` currently releases the WebGL context from outside with `WEBGL_lose_context`.
6. Query from `ROOT` instead of `document` (`document.getElementById` and `document.querySelectorAll`, about 31 calls).
7. Stop setting `document.title` in `routeWorld` and `route`. `AiluWorld.tsx` currently sets the title back after each in-world route.
8. Speed: `setInside` calls `BUILD[name]()` during the click if the room is not ready, and `prepareNext` builds rooms and runs `r.compile(scene,cam)` on the main thread. Both block taps on slow devices. Split each room build into small steps, run them in `requestIdleCallback`, and pause while a pointer is down. Show the fade first, then build.
9. Speed: `buildWorld()` runs as one long task at start (513ms on a fast PC). Split it so the intro stays smooth on phones.
10. Speed: `low` only starts below about 28 frames a second (`slow>.036`). Raise that limit, and in `low` mode also cut particles, beams and crowd. `worldRenderer.ts` can only lower pixel density.

## CSS (`ailu-world.css`)

`world-brand.css` overrides the variables, but these need the source:

1. Delete line 1, the `@import url("https://fonts.googleapis.com/...")` for DM Sans, Fraunces and Manrope. It is render-blocking and loads fonts the brand does not use. The variables already point to the next/font Poppins and Inter.
2. Set `--head` / `--body` / `--accent` to `var(--font-poppins)` / `var(--font-inter)` / `var(--font-poppins)`, and the colours to `#F5C400`, `#111111` and `#FFFDF7`. Replace the hard-coded `#0e100d`, `#14130c`, `rgba(14,16,13,…)`, `rgba(244,193,61,…)` and `rgba(244,187,37,…)` values with the variables.
3. Prefix every `@keyframes` name and its `animation` uses with `ailu-`: `land`, `nudge`, `slide`, `ping`, `collect`, `rise`, `settle`. These names are global and stay loaded after leaving the world. `ping` clashes with Tailwind's `animate-ping`.
4. Add `h3` to the `.ailu h1,.ailu h2{font-family:var(--head)…}` rule. `world-brand.css` does this for now.

## Phone turning

`onGyro` in engine.ts writes raw sensor angles into `yaw`, which fights touch and room moves and shakes the view. phoneTurn.ts blocks those events and turns the view through wheel input. When regenerating, you can remove `onGyro` and the `deviceorientation` listener, but keep the button and its permission request.
