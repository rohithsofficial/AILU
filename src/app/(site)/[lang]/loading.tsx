import Image from "next/image";
import { BRAND } from "@/lib/brand";

// Shows at once after any link is clicked, so a slow connection never looks like a dead link.
export default function SiteLoading() {
  return <div className="grid min-h-[70svh] place-items-center bg-ailu-black" role="status" aria-label="Loading the page">
    <Image src={BRAND.hand} alt="" width={96} height={72} className="animate-pulse object-contain" priority />
  </div>;
}
