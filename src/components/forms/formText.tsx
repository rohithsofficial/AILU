"use client";

// Small helpers so form wording can come from the CMS ("Buttons, forms and messages") in any language.
import Link from "@/components/LocaleLink";

/** Puts the Privacy Policy link where {privacy} is written in a sentence. */
export function withPrivacy(text: string, linkLabel: string) {
  const [before, after = ""] = text.split("{privacy}");
  return <>{before}<Link href="/privacy" className="font-semibold underline">{linkLabel}</Link>{after}</>;
}

/** Puts a reference ID where {id} is written, in bold. */
export function withId(text: string, id?: string, className?: string) {
  const [before, after = ""] = text.split("{id}");
  return <>{before}<strong className={className}>{id}</strong>{after}</>;
}

export type ServerMessages = { check: string; duplicate: string; tooMany: string; closed: string; failed: string };

/**
 * The servers answer in English. English pages show that answer as before;
 * other languages show the matching message in their own language instead.
 */
export function serverMessage(locale: string, status: number, english: string | undefined, text: ServerMessages) {
  if (locale === "en" && english) return english;
  if (status === 400) return text.check;
  if (status === 409) return text.duplicate;
  if (status === 429) return text.tooMany;
  if (status === 503) return text.closed;
  return text.failed;
}
