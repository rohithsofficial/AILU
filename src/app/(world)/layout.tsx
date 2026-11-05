import Intro from "@/components/Intro";
import WorldSwitch from "@/components/WorldSwitch";

// AILU World: the immersive 360° world. It has its own header and menu, so no site chrome here,
// only the switch to the Normal World. The intro plays once per session, only before the world.
export default function WorldLayout({ children }: { children: React.ReactNode }) {
  return <>{children}<WorldSwitch /><Intro /></>;
}
