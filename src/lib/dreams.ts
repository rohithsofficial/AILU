// Rules for private dreams: categories, status steps, sensitive-number check and duplicate check. Tested in dreams.test.ts.
export const DREAM_CATEGORIES = [
  "MY_DREAM",
  "FAMILY",
  "CELEBRATION",
  "HELPING_SOMEONE",
  "COMMUNITY",
  "CREATIVE_IDEA",
  "SOMETHING_SPECIAL",
] as const;

export const DREAM_CATEGORY_LABELS: Record<(typeof DREAM_CATEGORIES)[number], string> = {
  MY_DREAM: "A personal dream",
  FAMILY: "Something for my family",
  CELEBRATION: "A celebration",
  HELPING_SOMEONE: "Helping someone",
  COMMUNITY: "A community idea",
  CREATIVE_IDEA: "A creative idea",
  SOMETHING_SPECIAL: "Something special",
};

export const DREAM_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "NEED_MORE_INFO",
  "SHORTLISTED",
  "IN_PROGRESS",
  "FULFILLED",
  "NOT_POSSIBLE",
  "CLOSED",
] as const;

export const DREAM_REVIEW_THRESHOLDS = { waitingDays: 3 } as const;

export type DreamStatusValue = (typeof DREAM_STATUSES)[number];
export type DreamCategoryValue = (typeof DREAM_CATEGORIES)[number];

const NEXT_DREAM_STATUSES: Record<DreamStatusValue, readonly DreamStatusValue[]> = {
  SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["NEED_MORE_INFO", "SHORTLISTED", "NOT_POSSIBLE"],
  NEED_MORE_INFO: ["UNDER_REVIEW", "SHORTLISTED", "NOT_POSSIBLE"],
  SHORTLISTED: ["IN_PROGRESS", "NOT_POSSIBLE"],
  IN_PROGRESS: ["FULFILLED", "NOT_POSSIBLE"],
  FULFILLED: [],
  NOT_POSSIBLE: [],
  CLOSED: [],
};

export function allowedDreamStatuses(status: DreamStatusValue): DreamStatusValue[] {
  return status === "CLOSED" ? [] : [...NEXT_DREAM_STATUSES[status], "CLOSED"];
}

export function isDreamTransitionAllowed(from: DreamStatusValue, to: DreamStatusValue): boolean {
  return allowedDreamStatuses(from).includes(to);
}

export function dreamStatusNeedsReason(status: DreamStatusValue): boolean {
  return status === "NOT_POSSIBLE" || status === "CLOSED";
}

export function containsSensitiveDreamPattern(value: string): boolean {
  if (/[A-Z]{5}\d{4}[A-Z]/i.test(value)) return true;
  return (value.match(/(?:\d[\s-]?){12,19}/g) ?? []).some((candidate) => candidate.replace(/\D/g, "").length >= 12);
}

function normalizedDreamText(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("en-IN").replace(/[\p{P}\p{S}\s]+/gu, "").trim();
}

export function isNearDuplicateDream(first: string, second: string): boolean {
  const a = normalizedDreamText(first);
  const b = normalizedDreamText(second);
  if (!a || !b) return false;
  if (a === b) return true;
  if (Math.min(a.length, b.length) < 24) return false;

  const bigrams = (value: string) => new Set(Array.from({ length: value.length - 1 }, (_, i) => value.slice(i, i + 2)));
  const left = bigrams(a);
  const right = bigrams(b);
  let shared = 0;
  for (const value of left) if (right.has(value)) shared += 1;
  return (2 * shared) / (left.size + right.size) >= 0.9;
}

export function isRecentDuplicateDream(existing: { dream: string; createdAt: Date }[], incomingDream: string, now = new Date()): boolean {
  const since = now.getTime() - 24 * 60 * 60 * 1000;
  return existing.some((row) => row.createdAt.getTime() >= since && row.createdAt.getTime() <= now.getTime() && isNearDuplicateDream(row.dream, incomingDream));
}

// Audit diffs deliberately contain no submitted text or contact details.
export function dreamSubmissionAuditDiff(category: DreamCategoryValue, isMinor: boolean) {
  return { status: "SUBMITTED" as const, category, isMinor };
}
