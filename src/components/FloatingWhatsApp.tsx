"use client";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";

export default function FloatingWhatsApp() {
  const [avoid, setAvoid] = useState(false);
  useEffect(() => {
    const forms = [...document.querySelectorAll("main form"), ...document.querySelectorAll("footer")];
    if (!forms.length || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => setAvoid(entries.some((entry) => entry.isIntersecting)), { threshold: 0.01 });
    forms.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  if (avoid) return null;
  const href = `${BRAND.whatsapp}?text=${encodeURIComponent("Hi AILU, I would like to ask about planning a celebration.")}`;
  return <a className="whatsapp-float" href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat with AILU on WhatsApp">WhatsApp</a>;
}
