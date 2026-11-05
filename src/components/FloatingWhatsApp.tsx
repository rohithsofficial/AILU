"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useContent } from "@/components/ContentProvider";

export default function FloatingWhatsApp() {
  const { settings } = useContent();
  const pathname = usePathname();
  const [avoid, setAvoid] = useState(false);
  // The site chrome stays mounted across client navigation, so look for the new page's forms on every route.
  useEffect(() => {
    setAvoid(false);
    const competingActions = [
      ...document.querySelectorAll("main form"),
      ...document.querySelectorAll('#celebration-world a[href="/events#enquire"]'),
    ];
    if (!competingActions.length || !("IntersectionObserver" in window)) return;
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      setAvoid(visible.size > 0);
    }, { threshold: 0.01 });
    competingActions.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);
  if (avoid) return null;
  const href = `${settings.whatsapp}?text=${encodeURIComponent(settings.whatsappMessage)}`;
  return <a className="whatsapp-float" href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat with AILU on WhatsApp">WhatsApp</a>;
}
