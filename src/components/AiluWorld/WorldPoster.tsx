import Image from "next/image";
import { BRAND } from "@/lib/brand";

// Shown straight away while the 3D engine loads, so nobody waits on an empty screen.
// world-brand.css hides it once the world is ready.
export default function WorldPoster({ tagline }: { tagline: string }) {
  return <div className="world-poster" aria-hidden="true">
    <Image src={BRAND.logo} alt="" width={260} height={87} priority sizes="260px" />
    <p>{tagline}</p>
    <span>Opening the AILU world…</span>
  </div>;
}
