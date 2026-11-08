// Turns an error from a CRM server action into a short message for the screen.
// Used by every src/app/(admin)/admin/**/actions.ts file, so all of them behave the same way.
//
// - redirect() and notFound() work by throwing a special error. Those are thrown again, untouched.
// - Our own errors (throw new Error("Choose an active vendor.")) are already written for staff, so they are shown as they are.
// - Database errors are technical. They are replaced by plain English, and the details go to the server log.

type MaybeNextError = { digest?: unknown; code?: unknown; name?: unknown; message?: unknown };

const DATABASE_MESSAGES: Record<string, string> = {
  P2002: "That already exists. Another record uses the same phone, email or ID.",
  P2003: "This record is linked to other records, so it cannot be changed this way.",
  P2025: "That record no longer exists. Refresh the page and try again.",
};

export function actionMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const e = (error ?? {}) as MaybeNextError;
  if (typeof e.digest === "string" && (e.digest.startsWith("NEXT_REDIRECT") || e.digest === "NEXT_NOT_FOUND")) throw error;

  const name = typeof e.name === "string" ? e.name : "";
  if (name.startsWith("PrismaClient")) {
    console.error("CRM action database error", typeof e.code === "string" ? e.code : name);
    return (typeof e.code === "string" && DATABASE_MESSAGES[e.code]) || fallback;
  }
  return typeof e.message === "string" && e.message ? e.message : fallback;
}
