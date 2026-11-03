import Link from "next/link";
import PageHero from "@/components/PageHero";
import { metadataForPath } from "@/lib/public-metadata";
export const metadata = metadataForPath("/join");

export default function Join() {
  return (
    <>
    <PageHero title="Grow with AILU">Bring your talent, your ideas or your network. There are two ways to be part of what we build.</PageHero>
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="text-2xl font-bold">Join the AILU team</h2>
          <p className="mt-2 text-black/75">For people who want to work with us directly: coordination, hosting, dance, music, photography, decoration, logistics and more. Beginners who want to learn are welcome to apply.</p>
          <p className="mt-3 text-sm text-black/60">Please give accurate details about your skills and experience. Applying does not guarantee work or a paid assignment. Assignments depend on suitability, availability and agreed terms.</p>
          <Link href="/join/team" className="mt-5 inline-block rounded-full bg-ailu-yellow px-6 py-3 font-semibold">Apply to join the team</Link>
        </section>
        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="text-2xl font-bold">Become an external sales partner</h2>
          <p className="mt-2 text-black/85">Not joining the team, but know people planning an event? You can register as an external sales partner and introduce them to AILU.</p>
          <p className="mt-3 text-sm text-black/80">A reward is considered only after a verified, completed, and paid booking under terms AILU confirms in writing. No earnings are guaranteed.</p>
          <Link href="/join/partner" className="mt-5 inline-block rounded-full bg-ailu-yellow px-6 py-3 font-semibold">Register as a partner</Link>
        </section>
      </div>
      <p className="mt-8"><Link href="/events" className="font-semibold underline decoration-ailu-yellow decoration-2">Looking for an event instead?</Link></p>
    </div>
    </>
  );
}
