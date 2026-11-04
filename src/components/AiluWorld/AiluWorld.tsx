"use client";

import { useEffect, useRef } from "react";
import "./ailu-world.css";
import { startAilu } from "./engine";
import { HIDDEN_PLACES, WORLD_MARKUP } from "./worldMarkup";

// The engine builds a hotspot and a dock button for every place. Remove the ones the site has switched off.
function hidePlaces(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("#hots > *, #dock > *").forEach((el) => {
    if (HIDDEN_PLACES.includes(el.textContent?.trim() ?? "")) el.remove();
  });
}

export default function AiluWorld() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const title = document.title;
    let stop: (() => void) | undefined;
    let cancelled = false;

    // three.js loads only in the browser; without it the page falls back to the scroll film.
    import("three").then(
      (THREE) => { if (!cancelled) { stop = startAilu(root, THREE); hidePlaces(root); } },
      () => { if (!cancelled) { stop = startAilu(root, undefined); hidePlaces(root); } },
    );

    return () => {
      cancelled = true;
      stop?.();                      // removes listeners, timers and the animation loop
      root.innerHTML = WORLD_MARKUP; // restore pristine markup (React Strict Mode / navigation)
      root.className = "ailu";
      root.removeAttribute("style");
      document.title = title;
    };
  }, []);

  return <div ref={ref} className="ailu" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: WORLD_MARKUP }} />;
}
