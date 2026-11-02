import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PageHero from "@/components/PageHero";
export const metadata = { title: "Join AILU" };

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
          <p className="mt-4 rounded-lg bg-ailu-yellow/30 p-3 text-sm">Online applications open soon. Until then, message us on <a className="font-semibold underline" href={BRAND.whatsapp}>WhatsApp</a>.</p>
        </section>
        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="text-2xl font-bold">Become an external sales partner</h2>
          <p className="mt-2 text-black/75">Not joining the team, but know people planning an event? Introduce them to AILU. When a client you referred books an event with us, you receive a monetary reward.</p>
          <p className="mt-3 text-sm text-black/60">The reward amount depends on the event and the partner terms AILU confirms with you. No earnings are guaranteed, and a reward applies only to a verified, completed booking.</p>
          <p className="mt-4 rounded-lg bg-ailu-yellow/30 p-3 text-sm">Partner registration opens soon. Message us on <a className="font-semibold underline" href={BRAND.whatsapp}>WhatsApp</a> to register interest.</p>
        </section>
      </div>
      <p className="mt-8"><Link href="/events" className="font-semibold underline decoration-ailu-yellow decoration-2">Looking for an event instead?</Link></p>
    </div>
    </>
  );
}
