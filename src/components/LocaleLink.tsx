"use client";

// A next/link that keeps the visitor in their language: on /kn pages, href="/events" goes to /kn/events.
// Use it for every internal link on Normal World pages. The AILU World ("/"), admin and outside links are left alone.
import Link from "next/link";
import { useParams } from "next/navigation";
import { forwardRef, type ComponentProps } from "react";
import { localePath, toLocale } from "@/lib/i18n";

/** The page language, read from the [lang] part of the route. English everywhere else. */
export function useLocale() {
  return toLocale(useParams<{ lang?: string }>()?.lang);
}

const LocaleLink = forwardRef<HTMLAnchorElement, ComponentProps<typeof Link>>(function LocaleLink({ href, ...props }, ref) {
  const locale = useLocale();
  return <Link ref={ref} href={typeof href === "string" ? localePath(locale, href) : href} {...props} />;
});

export default LocaleLink;
