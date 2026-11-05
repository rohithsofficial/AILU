"use client";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";

export default function FloatingWhatsApp() {
  const [avoid, setAvoid] = useState(false);
  useEffect(() => {
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
  }, []);
  if (avoid) return null;
  const href = `${BRAND.whatsapp}?text=${encodeURIComponent("Hi AILU, I would like to ask about planning a celebration.")}`;
  return <a className="whatsapp-float" href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat with AILU on WhatsApp">WhatsApp</a>;
}
