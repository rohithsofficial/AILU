import Link from "next/link";
import Hero from "@/components/Hero";
import Reveal from "@/components/Reveal";
import { EVENT_CATEGORIES } from "@/lib/events";

const WORDS = ["Birthdays", "Weddings", "Corporate events", "Hosting", "Dance", "Music", "Cultural celebrations", "Community programmes"];

export default function Home() {
  return (
    <>
      <Hero />

      <div className="overflow-hidden border-y border-black/10 bg-ailu-yellow py-4" aria-hidden>
        <div className="marquee-track flex w-max gap-10 whitespace-nowrap font-display text-xl font-bold uppercase tracking-wide text-ailu-black">
          {[...WORDS, ...WORDS, ...WORDS, ...WORDS].map((w, i) => (<span key={i} className="flex items-center gap-10">{w}<span>✦</span></span>))}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <h2 className="text-4xl font-extrabold sm:text-5xl">What AILU is</h2>
          <p className="mt-4 max-w-3xl text-lg text-black/75">AILU is more than event management. We bring people together through celebrations, open doors for people who want to work with us or bring us clients, and stand beside people&apos;s dreams.</p>
        </Reveal>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ["Events", "Celebrations across India's North and South traditions, planned around your people and your customs."],
            ["Opportunities", "Join the team, or become an external sales partner and be rewarded when a client you introduce books with us."],
            ["Dreams & giving", "Share a dream and we will try to help, privately and with dignity. A donation box will support people in need."],
          ].map(([t, d], i) => (
            <li key={t}><Reveal delay={i * 0.12} className="h-full"><div className="h-full rounded-3xl bg-ailu-black p-7 text-ailu-cream shadow-xl"><h3 className="text-2xl font-bold text-ailu-yellow">{t}</h3><p className="mt-3 text-ailu-cream/80">{d}</p></div></Reveal></li>
          ))}
        </ul>
      </section>

      <section className="relative overflow-hidden bg-ailu-black py-20 text-ailu-cream">
        <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(45% 50% at 50% 0%, rgba(245,196,0,.16), transparent 70%)" }} />
        <div className="relative mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="text-4xl font-extrabold sm:text-5xl">Every occasion, its own kind of magic</h2>
            <p className="mt-4 max-w-2xl text-lg text-ailu-cream/70">Every event is scoped individually. Share your idea and we will prepare a tailored quotation.</p>
          </Reveal>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {EVENT_CATEGORIES.map((c, i) => (
              <li key={c.slug}>
                <Reveal delay={(i % 3) * 0.1} className="h-full">
                  <Link href={`/events/${c.slug}`} className="group relative block h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition duration-500 hover:-translate-y-1.5 hover:border-ailu-yellow/70 hover:bg-white/[0.08]">
                    <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-ailu-yellow/0 blur-3xl transition duration-500 group-hover:bg-ailu-yellow/30" />
                    <span className="font-display text-5xl font-extrabold text-ailu-yellow/30">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-3 text-2xl font-bold">{c.title}</h3>
                    <p className="mt-2 text-ailu-cream/70">{c.blurb}</p>
                    <p className="mt-5 text-sm font-semibold text-ailu-yellow">Request a personalised quotation →</p>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-ailu-yellow">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <Reveal><h2 className="text-4xl font-extrabold">From &ldquo;what if&rdquo; to &ldquo;what a day&rdquo;</h2></Reveal>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {[["Tell us your idea", "Share your occasion, date, location and what you have in mind."], ["Shape the plan", "We discuss details, check availability and prepare a quotation."], ["Make it happen", "Once scope, terms and booking payment are agreed, planning begins."]].map(([t, d], i) => (
              <li key={t}><Reveal delay={i * 0.12}><span className="font-display text-6xl font-extrabold text-ailu-black/20">{i + 1}</span><h3 className="text-xl font-bold">{t}</h3><p className="mt-1">{d}</p></Reveal></li>
            ))}
          </ol>
          <p className="mt-8 text-sm">An enquiry is not a confirmed booking.</p>
        </div>
      </section>

      <section className="bg-ailu-black py-20 text-center text-ailu-cream">
        <Reveal className="mx-auto max-w-3xl px-4">
          <h2 className="text-4xl font-extrabold sm:text-5xl">Ready when you are.</h2>
          <p className="mt-3 text-lg text-ailu-cream/70">Planning a celebration, or want to be part of AILU?</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/events#enquire" className="rounded-full bg-ailu-yellow px-8 py-4 font-semibold text-ailu-black transition hover:scale-105">Book an event</Link>
            <Link href="/join" className="rounded-full border border-ailu-yellow/70 px-8 py-4 font-semibold text-ailu-yellow transition hover:bg-ailu-yellow/10">Join AILU</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
