# AILU project status

Last updated: 2026-11-08

Short snapshot only. Full details, setup steps and notes are in `docs/HANDOFF.md`.

## Where things stand
- `main` has all finished work: CRM, two worlds, CMS, speed work and the first two feedback fixes.
- The public site is still hidden by `COMING_SOON=true`. The CRM and CMS are live.

## Latest work (2026-11-08, branch `claude/new-session-x8qhdu`)
- World: dragging turns left and right only (no more blank sky or floor). Rooms show named, tappable steps.
- New landing page `/celebrate` with an A/B test. Results in CRM → A/B test.
- `/privacy` fixed on phones. Report: `docs/REPORT_2026-11-08.md`. Ideas: `docs/IMPROVEMENT_IDEAS.md`.
- Full code review: 11 bugs fixed (biggest: empty guests box blocked enquiries; CRM name search showed everything). `docs/CODE_REVIEW_2026-11-08.md`, map in `docs/CODE_MAP.md`.

## Earlier work (2026-11-06)
- Swipe added to the home story. Quick flick added in world rooms.
- A slow database can no longer hold up a page. Pages wait 4 seconds at most, then use the last good content.
- Website pages show a loading screen while they load.

## Not checked yet
- Swipe on a real phone. It was tested with simulated touch only.
- The loading screen on a slow connection.
- Rohith's own check of the Explore menu on localhost.

## Next
1. Rohith sends the friend's next feedback point. Fix it, then check the whole site for the same problem.
2. Follow the launch steps under Next steps in `docs/HANDOFF.md`.
