// Decides whether this device should run the 3D scenes on the Normal World pages (hero and home story).
// No 3D for reduced motion, weak devices (4 cores or less, 2 GB or less) or browsers without WebGL.
export function canUse3D() {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    // Browsers allow only about 16 WebGL contexts at once, so give this test one back straight away.
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl && navigator.hardwareConcurrency > 4 && mem > 2;
  } catch { return false; }
}
