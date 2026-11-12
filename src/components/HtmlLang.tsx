"use client";

// Keeps <html lang> right while moving between pages without a reload, and puts English back on the way out
// (for example when a visitor goes from a Kannada page into the AILU World).
import { useEffect } from "react";

export default function HtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    return () => { document.documentElement.lang = "en"; };
  }, [locale]);
  return null;
}
