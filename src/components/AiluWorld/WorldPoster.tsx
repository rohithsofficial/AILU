import Image from "next/image";
import { BRAND } from "@/lib/brand";

// Shown straight away while the 3D engine loads, so nobody waits on an empty screen. The hand matches the
// intro hand in size and image, so the intro appears over it without a jump.
// world-brand.css hides it once the world is ready.
export default function WorldPoster({ tagline }: { tagline: string }) {
  return <div className="world-poster" aria-hidden="true">
    <div className="relative aspect-[4/3] w-[min(56vw,240px)]"><Image src={BRAND.hand} alt="" fill sizes="240px" className="object-contain" priority /></div>
    <p>{tagline}</p>
    <span>Opening the AILU world…</span>
  </div>;
}
