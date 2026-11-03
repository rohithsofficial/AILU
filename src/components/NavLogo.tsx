import Image from "next/image";
import { COMPACT_WIDTH, HAND_LEFT_COMPACT, LOGO_LAYERS, LOGO_RATIO } from "@/lib/logoLayers";

type Layer = (typeof LOGO_LAYERS)[keyof typeof LOGO_LAYERS];
const place = (l: Layer) => ({ left: `${l.left}%`, top: `${l.top}%`, width: `${l.width}%`, height: `${l.height}%` });

// Full logo at the top of the page. When `compact`, only the first and last parts remain: the A and the hand.
export default function NavLogo({ compact }: { compact: boolean }) {
  const { a, il, hand } = LOGO_LAYERS;
  // the hand's `left` comes from CSS (so it can slide on scroll), not from an inline style
  const { left: _handLeft, ...handBox } = place(hand);
  void _handLeft;
  return (
    <span className="nav-logo" data-compact={compact} style={{ "--r": LOGO_RATIO, "--compact-w": COMPACT_WIDTH } as React.CSSProperties}>
      <span className="nav-logo-img">
        <span className="absolute" style={place(a)}><Image src={a.src} alt="AILU" fill sizes="120px" className="object-contain" priority /></span>
        <span className="logo-il absolute" style={place(il)}><Image src={il.src} alt="" fill sizes="120px" className="object-contain" priority /></span>
        <span className="logo-hand absolute" style={{ ...handBox, "--hand-left": `${hand.left}%`, "--hand-left-compact": `${HAND_LEFT_COMPACT}%` } as React.CSSProperties}>
          <Image src={hand.src} alt="" fill sizes="120px" className="object-contain" priority />
        </span>
        {/* Landing spot for the intro hand (always where the hand sits in the full logo) */}
        <span data-ailu-hand aria-hidden className="pointer-events-none absolute" style={place(hand)} />
      </span>
    </span>
  );
}
