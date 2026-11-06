type SwipeLimits = { distance: number; ms: number };

/** A relaxed swipe, for screens where sideways movement has no other job. */
export const EASY_SWIPE: SwipeLimits = { distance: 50, ms: 700 };
/** A quick flick, for the 3D rooms, where a slow drag looks around instead. */
export const QUICK_FLICK: SwipeLimits = { distance: 60, ms: 350 };

/** Returns 1 for next (finger moved left), -1 for previous (finger moved right), 0 for not a swipe. */
export function swipeStep(dx: number, dy: number, ms: number, limits: SwipeLimits = EASY_SWIPE): -1 | 0 | 1 {
  if (ms > limits.ms || Math.abs(dx) < limits.distance || Math.abs(dx) < Math.abs(dy) * 1.5) return 0;
  return dx < 0 ? 1 : -1;
}
