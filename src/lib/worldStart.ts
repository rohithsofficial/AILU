// When the AILU World may start. The 3D engine is the heaviest thing on the site, so a first-time visitor
// starts it only by choosing the world in the intro. Anyone who picks the website never runs it.

export const INTRO_SEEN_KEY = "ailu-intro-seen";
export const ENTER_WORLD_EVENT = "ailu:enter-world";

/** When the intro shows the welcome, the feeling line and the two choices. Each line stays long enough to read. */
export const INTRO_STEPS_MS = [300, 2300, 5000];

/** Runs when the browser is free, and returns a function that cancels it. */
export function whenIdle(work: () => void, timeout: number) {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(work, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(work, Math.min(timeout, 300));
  return () => clearTimeout(id);
}
