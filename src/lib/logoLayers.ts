// The logo is stored as three pieces cut from the original artwork, each cropped to its own box.
// Boxes are pixel positions inside the 1400x468 master logo, turned into percentages here.
const W = 1400;
const H = 468;
const box = (x0: number, y0: number, x1: number, y1: number) => ({
  left: (x0 / W) * 100,
  top: (y0 / H) * 100,
  width: ((x1 - x0) / W) * 100,
  height: ((y1 - y0) / H) * 100,
});

export const LOGO_RATIO = W / H;
export const LOGO_LAYERS = {
  a: { src: "/brand/logo-a.png", ...box(51, 64, 524, 421) },
  il: { src: "/brand/logo-il.png", ...box(524, 66, 986, 422) },
  hand: { src: "/brand/logo-hand.png", ...box(899, 49, 1368, 429) },
};

// On scroll the "I" and "L" fold away and the hand slides left to sit beside the "A".
const GAP = 2.5; // percent of full logo width between the A and the hand when compact
export const HAND_LEFT_COMPACT = (524 / W) * 100 + GAP;
export const COMPACT_WIDTH = (HAND_LEFT_COMPACT + LOGO_LAYERS.hand.width + 1) / 100; // share of full width kept
