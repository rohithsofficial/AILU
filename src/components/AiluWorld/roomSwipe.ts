import { QUICK_FLICK, swipeStep } from "@/lib/swipe";

/** In a room, a quick flick moves to the next or previous stop. A slow drag still looks around. */
export function roomSwipe(root: HTMLElement) {
  let start: { x: number; y: number; at: number } | null = null;

  const onDown = (event: PointerEvent) => {
    const onCanvas = (event.target as Element | null)?.matches?.("canvas#world");
    start = onCanvas && event.pointerType === "touch" && root.classList.contains("is-inside") ? { x: event.clientX, y: event.clientY, at: performance.now() } : null;
  };
  const onUp = (event: PointerEvent) => {
    if (!start) return;
    const step = swipeStep(event.clientX - start.x, event.clientY - start.y, performance.now() - start.at, QUICK_FLICK);
    start = null;
    if (!step) return;
    const button = root.querySelector<HTMLButtonElement>(step > 0 ? "#stopNext" : "#stopPrev");
    if (button && !button.disabled) button.click();
  };

  root.addEventListener("pointerdown", onDown, true);
  root.addEventListener("pointerup", onUp, true);
  return () => {
    root.removeEventListener("pointerdown", onDown, true);
    root.removeEventListener("pointerup", onUp, true);
  };
}
