// A small globe with a turning orbit: the sign for the 360° AILU World. Turns slowly unless the visitor prefers less motion.
export default function World360Icon({ className = "h-4 w-4" }: { className?: string }) {
  return <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <circle cx="12" cy="12" r="4.5" />
    <g style={{ transformOrigin: "12px 12px" }} className="motion-safe:animate-[spin_6s_linear_infinite]">
      <ellipse cx="12" cy="12" rx="10" ry="4.5" />
      <path d="M20.5 9.2l1.5 2.8-3 .6" />
    </g>
  </svg>;
}
