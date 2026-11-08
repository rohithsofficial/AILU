import { getPrisma } from "@/lib/db";
import { LANDING_TEST, readExperimentNote, type Variant } from "@/lib/experiments";

/** Landing-page enquiries per version for the current test, read from the notes saved with each enquiry. */
export async function landingResults(testId: string = LANDING_TEST.id) {
  const notes = await getPrisma().activity.findMany({
    where: { kind: "NOTE", body: { startsWith: `Landing page test ${testId}:` } },
    select: { body: true, at: true, enquiryId: true },
    orderBy: { at: "desc" },
  });
  const counts: Record<Variant, number> = { a: 0, b: 0 };
  const recent: { variant: Variant; at: Date; enquiryId: string | null }[] = [];
  for (const note of notes) {
    const read = readExperimentNote(note.body);
    if (!read || read.test !== testId) continue;
    counts[read.variant] += 1;
    if (recent.length < 20) recent.push({ variant: read.variant, at: note.at, enquiryId: note.enquiryId });
  }
  return { counts, recent, firstAt: notes.at(-1)?.at ?? null };
}
