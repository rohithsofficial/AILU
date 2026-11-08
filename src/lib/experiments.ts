// A/B testing for the landing page (see docs/AB_TESTING.md).
// Each new visitor is put into version A or B at random, half and half, and a cookie keeps them there.
// When a landing-page enquiry arrives, the version is saved as a note on that enquiry in the CRM.
// Because the split is random and even, both versions get about the same number of visitors,
// so comparing the number of enquiries per version is a fair test.

export const LANDING_TEST = {
  /** Change the id when you start a new test, so old results are not mixed in. */
  id: "landing-hero-1",
  cookie: "ailu_ab_landing",
  /** The middleware passes the version to the page in this request header on the first visit. */
  header: "x-ailu-landing",
  path: "/celebrate",
  variants: ["a", "b"] as const,
  /** Days the cookie lasts. A returning visitor keeps seeing the same version. */
  days: 60,
};

export type Variant = (typeof LANDING_TEST.variants)[number];

export const isVariant = (value: unknown): value is Variant => LANDING_TEST.variants.includes(value as Variant);

/** Picks a version from a random number between 0 and 1. Half go to A, half to B. */
export const pickVariant = (random: number): Variant => (random < 0.5 ? "a" : "b");

// Search engines and link previews always see version A, so the page they index never changes.
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|lighthouse/i;
export const isBot = (userAgent: string | null | undefined) => BOT.test(userAgent ?? "");

/**
 * Which version a request should see.
 * - `?v=a` or `?v=b` forces a version (for checking both versions yourself).
 * - Otherwise a valid cookie wins, so the visitor keeps their version.
 * - Bots always get A. Everyone else gets a random version.
 * `assign` is true when the cookie should be (re)written.
 */
export function chooseVariant(input: { forced?: string | null; cookie?: string | null; userAgent?: string | null; random: number }): { variant: Variant; assign: boolean } {
  const forced = input.forced?.toLowerCase();
  if (isVariant(forced)) return { variant: forced, assign: forced !== input.cookie };
  if (isVariant(input.cookie)) return { variant: input.cookie, assign: false };
  if (isBot(input.userAgent)) return { variant: "a", assign: false };
  return { variant: pickVariant(input.random), assign: true };
}

const NOTE_PREFIX = "Landing page test";

/** The CRM note saved with a landing-page enquiry. */
export const experimentNote = (variant: Variant) => `${NOTE_PREFIX} ${LANDING_TEST.id}: version ${variant.toUpperCase()}`;

/** Reads a CRM note back. Returns null for any other note. */
export function readExperimentNote(body: string): { test: string; variant: Variant } | null {
  const match = /^Landing page test (\S+): version ([AB])$/.exec(body.trim());
  if (!match) return null;
  return { test: match[1], variant: match[2].toLowerCase() as Variant };
}

export const MIN_RESULTS = 30;

export type Verdict = { leader: Variant | null; confident: boolean; z: number; message: string };

/**
 * Compares two enquiry counts from an even, random split.
 * If the versions were really the same, each enquiry is a coin flip between A and B, so
 * z = (b - a) / sqrt(a + b). Beyond 1.96 there is less than a 5% chance the gap is luck.
 */
export function compareVariants(a: number, b: number): Verdict {
  const total = a + b;
  const z = total ? (b - a) / Math.sqrt(total) : 0;
  const leader: Variant | null = a === b ? null : b > a ? "b" : "a";
  if (total < MIN_RESULTS) {
    return { leader, confident: false, z, message: `Not enough data yet: ${total} of at least ${MIN_RESULTS} enquiries. Keep the test running.` };
  }
  if (Math.abs(z) >= 1.96) {
    return { leader, confident: true, z, message: `Version ${leader!.toUpperCase()} is winning, and the gap is unlikely to be luck (95% confidence).` };
  }
  return { leader, confident: false, z, message: leader ? `Version ${leader.toUpperCase()} is ahead, but the gap could still be luck. Keep the test running.` : "Both versions are level. Keep the test running." };
}
