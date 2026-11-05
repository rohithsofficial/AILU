import type * as Three from "three";

type ThreeModule = typeof Three;

// Pixel density is the main cost of the world: the GPU falls behind, and taps and clicks then feel stuck.
// engine.ts is generated, so its renderer settings are limited here, through the THREE it is given.
export const START_RATIO = { phone: 1.15, desktop: 1.25 };
export const FLOOR_RATIO = 0.75;
const STEP = 0.15;
const SLOW_FRAME_MS = 24; // under about 40 frames a second
const CHECK_EVERY = 45; // frames
const IGNORE_GAP_MS = 250; // a hidden tab or a room being built says nothing about the GPU

/** Averages frame gaps and says when quality should drop. Never goes back up, so it cannot flicker. */
export function createFrameWatch() {
  let last = 0, average = 0, frames = 0;
  return (now: number) => {
    const gap = last ? now - last : 0;
    last = now;
    if (!gap || gap > IGNORE_GAP_MS) return false;
    average = average ? average + (gap - average) * 0.1 : gap;
    if (++frames < CHECK_EVERY) return false;
    frames = 0;
    return average > SLOW_FRAME_MS;
  };
}

export const nextRatio = (ratio: number) => Math.max(FLOOR_RATIO, Math.round((ratio - STEP) * 100) / 100);

/** Returns THREE with a lighter WebGLRenderer: lower pixel density that drops further on slow devices. */
export function withLightRenderer(THREE: ThreeModule): ThreeModule {
  class LightRenderer extends THREE.WebGLRenderer {
    constructor(params: Three.WebGLRendererParameters = {}) {
      // Antialiasing multiplies the pixel cost and is hard to see on high-density screens.
      super({ ...params, antialias: !!params.antialias && window.devicePixelRatio <= 1 });
      let cap = window.innerWidth < 700 ? START_RATIO.phone : START_RATIO.desktop;
      let wanted = cap;
      const watch = createFrameWatch();
      // three.js assigns these in its constructor, so they are wrapped here and not overridden as methods.
      const setPixelRatio = this.setPixelRatio.bind(this);
      const render = this.render.bind(this);
      this.setPixelRatio = (value) => { wanted = value; setPixelRatio(Math.min(wanted, cap)); };
      this.render = (scene, camera) => {
        render(scene, camera);
        if (cap > FLOOR_RATIO && watch(performance.now())) {
          cap = nextRatio(cap);
          setPixelRatio(Math.min(wanted, cap));
        }
      };
    }
  }
  return { ...THREE, WebGLRenderer: LightRenderer };
}
