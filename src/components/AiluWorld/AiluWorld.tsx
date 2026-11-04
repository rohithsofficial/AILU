"use client";

import { useEffect, useRef } from "react";
import "./ailu-world.css";
import { BODY_HTML } from "./body";
import { startAilu } from "./engine";

/**
 * Links inside the world that should open a REAL page of your site.
 * Left side: the link used inside the world. Right side: your Next.js route.
 * Anything not listed here stays inside the world (wedding room, people, culture ...).
 * Edit this table freely.
 */
const ROUTES: Record<string, string> = {
  "#jobs": "/join/team",
  "#apply": "/join/team",
  "#dreams": "/dreams",
  "#share": "/dreams",
  "#enquire": "/events#enquire",
  "#policies": "/privacy",
  "#rewards": "/referral-policy",
};
const WORLD_MARKUP = BODY_HTML.replace(/href="(#jobs|#apply|#dreams|#share|#enquire|#policies|#rewards)"/g, (_match, path: string) => `href="${ROUTES[path]}"`);

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
      (THREE) => { if (!cancelled) stop = startAilu(root, THREE); },
      () => { if (!cancelled) stop = startAilu(root, undefined); },
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
