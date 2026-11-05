// "Turn with my phone" for the AILU World.
// The generated engine writes raw sensor angles straight into the view, on top of touch, room moves and
// hotspot moves. Those fight each other and the screen shakes. This keeps the sensor away from the engine
// and turns the view through its normal wheel input instead, so every control adds up smoothly.

const TURN_STRENGTH = 800; // wheel units per radian, from the engine's speed (.0035) and slow-down (2.8)
const MAX_STEP = 0.35; // radians; a bigger jump between two readings is a sensor glitch
const STILL = 0.002; // radians; smaller changes are sensor noise

const rad = (deg: number) => (deg * Math.PI) / 180;

/** The compass direction the phone points in, in radians. It stays steady when the phone is held upright. */
export function phoneHeading(alpha: number, beta: number, gamma: number) {
  const [a, b, g] = [rad(alpha), rad(beta), rad(gamma)];
  const topX = -Math.sin(a) * Math.cos(b);
  const topY = Math.cos(a) * Math.cos(b);
  const backX = -(Math.cos(a) * Math.sin(g) + Math.sin(a) * Math.sin(b) * Math.cos(g));
  const backY = -(Math.sin(a) * Math.sin(g) - Math.cos(a) * Math.sin(b) * Math.cos(g));
  return Math.atan2(topX + backX, topY + backY);
}

/** The shortest turn from one heading to another, in radians. */
export function headingChange(from: number, to: number) {
  let change = (to - from) % (2 * Math.PI);
  if (change > Math.PI) change -= 2 * Math.PI;
  if (change < -Math.PI) change += 2 * Math.PI;
  return change;
}

/** Call before the engine starts. Returns a function that removes everything. */
export function steadyPhoneTurn(root: HTMLElement) {
  let last: number | null = null;
  let pressed = false;
  let listening = false;

  const onSensor = (event: DeviceOrientationEvent) => {
    event.stopImmediatePropagation(); // the engine must never see the raw sensor
    if (event.alpha == null || event.beta == null || event.gamma == null) return;
    const heading = phoneHeading(event.alpha, event.beta, event.gamma);
    if (last === null) { last = heading; return; }
    const change = headingChange(last, heading);
    if (Math.abs(change) < STILL) return;
    last = heading;
    if (pressed || Math.abs(change) > MAX_STEP) return;
    root.querySelector("canvas#world")?.dispatchEvent(new WheelEvent("wheel", { deltaX: change * TURN_STRENGTH, cancelable: true }));
  };

  // Listening in the capture phase puts this ahead of the engine's own sensor listener.
  const onClick = (event: MouseEvent) => {
    if (listening || !(event.target as Element | null)?.closest?.("#gyroBtn")) return;
    listening = true;
    window.addEventListener("deviceorientation", onSensor, true);
  };
  const onPress = (event: PointerEvent) => { if ((event.target as Element | null)?.matches?.("canvas#world")) pressed = true; };
  const onRelease = () => { pressed = false; };

  root.addEventListener("click", onClick, true);
  root.addEventListener("pointerdown", onPress, true);
  window.addEventListener("pointerup", onRelease, true);
  window.addEventListener("pointercancel", onRelease, true);

  return () => {
    root.removeEventListener("click", onClick, true);
    root.removeEventListener("pointerdown", onPress, true);
    window.removeEventListener("pointerup", onRelease, true);
    window.removeEventListener("pointercancel", onRelease, true);
    window.removeEventListener("deviceorientation", onSensor, true);
  };
}
