// Keeps the AILU World view level: dragging turns left and right only.
// The generated engine tilts the camera up and down with a vertical drag. Tilted up, the screen shows only the empty
// sky; tilted down, only the floor. Visitors read both as a blank page. engine.ts is generated, so instead of
// changing it, every drag move on the canvas is passed on with the finger's height fixed at where the press began.
// Room stops still set their own camera angle, so planned views (like "Up among the balloons") are unchanged.

/** The engine treats a press that moved more than this (x + y, in pixels) as a drag, not a tap. */
export const TAP_SLOP = 9;

type Press = { x: number; y: number; moved: boolean; sideways: boolean };

/** Updates a press with a new finger position. `moved`: the finger really moved. `sideways`: the engine saw it move. */
export function trackPress(press: Press, x: number, y: number): Press {
  return {
    ...press,
    moved: press.moved || Math.abs(x - press.x) + Math.abs(y - press.y) > TAP_SLOP,
    sideways: press.sideways || Math.abs(x - press.x) > TAP_SLOP,
  };
}

/**
 * A press the engine would take for a tap, although the finger moved up or down. Its release must not open
 * whatever glows under the finger.
 */
export const isHiddenDrag = (press: Press) => press.moved && !press.sideways;

/** Call before the engine starts. Returns a function that removes everything. */
export function levelView(root: HTMLElement) {
  const presses = new Map<number, Press>();
  const ours = new WeakSet<Event>();

  const onCanvas = (event: Event) => (event.target as Element | null)?.matches?.("canvas#world") ?? false;
  const pass = (event: PointerEvent, type: string, clientY: number) => {
    const copy = new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      isPrimary: event.isPrimary,
      buttons: event.buttons,
      clientX: event.clientX,
      clientY,
    });
    ours.add(copy);
    event.target?.dispatchEvent(copy);
  };

  const onDown = (event: PointerEvent) => {
    if (onCanvas(event)) presses.set(event.pointerId, { x: event.clientX, y: event.clientY, moved: false, sideways: false });
  };
  const onMove = (event: PointerEvent) => {
    const press = presses.get(event.pointerId);
    // Hover moves (no press) and our own copies go through untouched.
    if (!press || ours.has(event) || !onCanvas(event)) return;
    presses.set(event.pointerId, trackPress(press, event.clientX, event.clientY));
    if (event.clientY === press.y) return;
    event.stopImmediatePropagation();
    pass(event, "pointermove", press.y);
  };
  const onUp = (event: PointerEvent) => {
    const press = presses.get(event.pointerId);
    presses.delete(event.pointerId);
    if (!press || ours.has(event) || !onCanvas(event) || !isHiddenDrag(press)) return;
    event.stopImmediatePropagation();
    pass(event, "pointercancel", press.y);
  };
  const onCancel = (event: PointerEvent) => { if (!ours.has(event)) presses.delete(event.pointerId); };

  // Capture on the root runs before the engine's own listeners on the canvas.
  root.addEventListener("pointerdown", onDown, true);
  root.addEventListener("pointermove", onMove, true);
  root.addEventListener("pointerup", onUp, true);
  root.addEventListener("pointercancel", onCancel, true);

  return () => {
    root.removeEventListener("pointerdown", onDown, true);
    root.removeEventListener("pointermove", onMove, true);
    root.removeEventListener("pointerup", onUp, true);
    root.removeEventListener("pointercancel", onCancel, true);
  };
}
