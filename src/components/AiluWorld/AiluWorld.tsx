"use client";

import { useEffect, useRef } from "react";
import "./ailu-world.css";
import "./world-brand.css";
import { startAilu } from "./engine";
import { HIDDEN_PLACES } from "./worldMarkup";
import { withLightRenderer } from "./worldRenderer";
import { steadyPhoneTurn } from "./phoneTurn";
import { roomSwipe } from "./roomSwipe";
import { levelView } from "./levelView";
import { worldSteps } from "./worldSteps";
import { ENTER_WORLD_EVENT, INTRO_SEEN_KEY, INTRO_STEPS_MS, whenIdle } from "@/lib/worldStart";
import { SITE_CONTENT } from "@/content/site";

// The engine builds a hotspot and a dock button for every place. Remove the ones the site has switched off.
function hidePlaces(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("#hots > *, #dock > *").forEach((el) => {
    if (HIDDEN_PLACES.includes(el.textContent?.trim() ?? "")) el.remove();
  });
}

// The engine renames the tab on every in-world route. The title comes from the page metadata instead.
const keepTitle = () => { document.title = SITE_CONTENT.worldTitle; };

// stop() ends the animation loop but does not dispose the three.js renderer. Release its WebGL context
// now, so repeated visits to the world do not pile up contexts (browsers drop the oldest after ~16).
function releaseWebGL(root: HTMLElement) {
  if (!root.classList.contains("has-world")) return; // no 3D world was built, so there is no context
  const canvas = root.querySelector<HTMLCanvasElement>("canvas#world");
  const gl = canvas?.getContext("webgl2") ?? canvas?.getContext("webgl");
  gl?.getExtension("WEBGL_lose_context")?.loseContext();
}

export default function AiluWorld({ markup }: { markup: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    const stopPhoneTurn = steadyPhoneTurn(root);
    const stopRoomSwipe = roomSwipe(root);
    const stopLevelView = levelView(root); // after roomSwipe, so a room flick still sees the real release
    const stopWorldSteps = worldSteps(root);
    const start = (THREE?: typeof import("three")) => {
      if (cancelled) return;
      root.classList.add("world-starting"); // the engine measures the page, so it must be in the layout
      try {
        stop = startAilu(root, THREE);
        hidePlaces(root);
      } finally {
        // The first frames are the slowest, so the poster stays until they are drawn. The timer covers a hidden
        // tab, where frames do not run. Even after an engine error, never leave a blank page.
        const ready = () => root.classList.add("world-ready");
        requestAnimationFrame(() => requestAnimationFrame(ready));
        setTimeout(ready, 3000);
      }
      keepTitle();
      // Registered after the engine's own listeners, so these run after it has changed the title.
      window.addEventListener("hashchange", keepTitle);
      window.addEventListener("popstate", keepTitle);
    };

    // three.js loads only in the browser; without it the page falls back to the scroll film.
    const loadThree = () => import("three");
    const boot = () => { loadThree().then((THREE) => start(withLightRenderer(THREE)), () => start(undefined)); };
    // A first visit starts the engine only when the visitor enters the world. three.js loads quietly once the
    // intro has reached its choices, so it never interrupts the text. A returning visitor starts when the browser is free.
    const firstVisit = !sessionStorage.getItem(INTRO_SEEN_KEY);
    let cancelIdle = () => {};
    let prefetch: ReturnType<typeof setTimeout> | undefined;
    if (firstVisit) {
      window.addEventListener(ENTER_WORLD_EVENT, boot, { once: true });
      prefetch = setTimeout(() => { cancelIdle = whenIdle(() => { void loadThree(); }, 3000); }, INTRO_STEPS_MS[2] + 400);
    } else cancelIdle = whenIdle(boot, 800);

    // The engine moves around with location.hash, which creates history entries without Next's state.
    // Next ignores those on Back, so the URL would change to /#place while the Normal World stayed on screen.
    const nextState = window.history.state;
    const keepNextState = () => {
      if (nextState && !window.history.state) window.history.replaceState(nextState, "", window.location.href);
    };
    window.addEventListener("hashchange", keepNextState);

    return () => {
      cancelled = true;
      clearTimeout(prefetch);
      cancelIdle();
      window.removeEventListener(ENTER_WORLD_EVENT, boot);
      stopPhoneTurn();
      stopRoomSwipe();
      stopLevelView();
      stopWorldSteps();
      window.removeEventListener("hashchange", keepNextState);
      window.removeEventListener("hashchange", keepTitle);
      window.removeEventListener("popstate", keepTitle);
      stop?.();                      // removes listeners, timers and the animation loop
      releaseWebGL(root);
      root.innerHTML = markup; // restore pristine markup (React Strict Mode / navigation)
      root.className = "ailu";
      root.removeAttribute("style");
      // Do not restore document.title here: on navigation Next has already set the next page's title.
    };
  }, [markup]);

  return <div ref={ref} className="ailu" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: markup }} />;
}
