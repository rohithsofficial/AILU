export function canUse3D() {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    return !!gl && navigator.hardwareConcurrency > 4 && mem > 2;
  } catch { return false; }
}
