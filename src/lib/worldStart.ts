// When the AILU World may start. The 3D engine is the heaviest thing on the site, so a first-time visitor
// starts it only by choosing the world in the intro. Anyone who picks the website never runs it.

export const INTRO_SEEN_KEY = "ailu-intro-seen";

/** The intro plays on a visitor's first visit, then again only after this many days. */
export const INTRO_REPEAT_DAYS = 30;

/** True when the intro should play: never seen, or last seen INTRO_REPEAT_DAYS ago or more. */
export function introDue(lastSeen: number | null, now = Date.now()) {
  return !lastSeen || !Number.isFinite(lastSeen) || now - lastSeen >= INTRO_REPEAT_DAYS * 24 * 60 * 60 * 1000;
}

/** Reads the browser's memory. Private windows or blocked storage mean "show it", never an error. */
export function introSeen() {
  try {
    if (sessionStorage.getItem(INTRO_SEEN_KEY)) return true;
    return !introDue(Number(localStorage.getItem(INTRO_SEEN_KEY)) || null);
  } catch {
    return false;
  }
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    localStorage.setItem(INTRO_SEEN_KEY, String(Date.now()));
  } catch {
    // Storage blocked: the intro simply shows again next time.
  }
}
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
