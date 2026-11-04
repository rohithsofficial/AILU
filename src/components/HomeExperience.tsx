import Image from "next/image";
import Link from "next/link";
import { SITE_CONTENT } from "@/content/site";
import { EVENT_CATEGORIES } from "@/lib/events";
import { BRAND } from "@/lib/brand";

const disciplines = [
  { title: "Coastal Karnataka", detail: "Yakshagana, Pili Vesha and Chande, rooted in the coast." },
  { title: "Kerala", detail: "Kathakali, Chenda and cultural programmes." },
  { title: "South Indian classical", detail: "Bharatanatyam, Kuchipudi and Mohiniyattam." },
  { title: "North and West India", detail: "Bhangra, Garba, Dandiya and Kathak." },
  { title: "Contemporary and fusion", detail: "Contemporary dance, hip-hop, DJs and live music." },
];

const conceptDirections = [
  { tag: "Personal celebrations", title: "A little golden gathering", copy: "Warm colour, shared tables and small details shaped around your people.", art: "from-ailu-yellow/35 via-ailu-yellow/10 to-ailu-cream/5", mark: "01" },
  { tag: "Corporate events", title: "Business, with a bright side", copy: "A clear stage, welcoming spaces and a programme planned around the occasion.", art: "from-white/15 via-ailu-black to-ailu-yellow/25", mark: "02" },
  { tag: "Entertainment", title: "An evening with energy", copy: "Music, movement and moments for guests to share together.", art: "from-ailu-yellow/30 via-ailu-black to-white/10", mark: "03" },
];

const featuredFaqs = SITE_CONTENT.faqs.slice(0, 5);

export default function HomeExperience() {
  return (
    <>
      <div className="overflow-hidden bg-ailu-yellow py-3 text-ailu-black" aria-label="Creating moments. Delivering smiles.">
        <div className="marquee-track flex w-max items-center gap-7 whitespace-nowrap text-[10px] font-bold uppercase tracking-[.2em] sm:gap-9 sm:text-xs">
          {[0, 1, 2, 3].map((item) => <span key={item} aria-hidden="true" className="inline-flex items-center gap-7 sm:gap-9">Creating moments <span className="text-sm">✳</span> Delivering smiles <span className="text-sm">✳</span> The AILU way <span className="text-sm">✳</span></span>)}
        </div>
        <span className="sr-only">Creating moments. Delivering smiles. The AILU way.</span>
      </div>
      <section className="bg-ailu-black px-6 text-ailu-cream sm:px-10 lg:px-16" aria-label="AILU at a glance">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 border-b border-white/15 py-2 sm:grid-cols-4">
          {[
            ["Based in", "Udupi, Karnataka"],
            ["Gatherings", "Personal to community"],
            ["Planning", "Shaped around your occasion"],
            ["Enquiries", "No payment to enquire"],
          ].map(([label, value], index) => <li key={label} className={`border-t border-white/15 py-4 pr-4 ${index % 2 ? "pl-4" : ""} ${index < 2 ? "max-sm:border-t-0" : ""} sm:border-t-0 sm:py-5 ${index > 0 ? "sm:border-l sm:border-white/15 sm:pl-5" : ""}`}><span className="block text-xs font-semibold text-ailu-cream">{label}</span><span className="mt-1 block text-xs leading-relaxed text-ailu-cream/50">{value}</span></li>)}
        </ul>
      </section>
      <section id="services" className="scroll-mt-20 bg-ailu-black px-6 py-16 text-ailu-cream sm:px-10 sm:py-20 lg:px-16" aria-labelledby="services-title">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">What we do</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_.8fr] lg:items-end">
            <h2 id="services-title" className="max-w-[13ch] font-display text-[clamp(2.3rem,4.5vw,3.6rem)] font-semibold leading-[.98] tracking-[-.055em]">Every occasion.<br /><span className="text-ailu-yellow">Its own kind of magic.</span></h2>
            <p className="max-w-xl leading-relaxed text-ailu-cream/65">From a close-knit celebration to a room full of people, we shape the conversation around your occasion, your priorities and the details that matter to you.</p>
          </div>
          <ul className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {EVENT_CATEGORIES.map((category, index) => <li key={category.slug} className="group border-t border-white/15 py-5 transition-colors hover:border-ailu-yellow">
              <div className="flex items-baseline justify-between gap-4"><span className="text-xs font-semibold text-ailu-cream/40">0{index + 1}</span><Link href={`/events/${category.slug}`} className="min-h-11 flex-1 font-display text-lg font-semibold tracking-tight after:ml-2 after:text-ailu-yellow after:content-['↗'] group-hover:text-ailu-yellow">{category.title}</Link></div>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ailu-cream/60">{category.blurb}</p>
            </li>)}
          </ul>
          <p className="mt-5 max-w-3xl text-xs leading-relaxed text-ailu-cream/45">Every event is scoped individually. Services, performers, suppliers and dates depend on suitability and availability and are confirmed with you before booking.</p>
        </div>
      </section>

      <section id="people" className="scroll-mt-20 bg-ailu-black px-6 py-20 text-ailu-cream sm:px-10 sm:py-28 lg:px-16" aria-labelledby="people-title">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">Many hands make a moment</p><h2 id="people-title" className="mt-4 max-w-[11ch] font-display text-[clamp(2.3rem,4.5vw,3.6rem)] font-semibold leading-[.96] tracking-[-.055em]">The right people, together.</h2></div>
            <p className="max-w-xl leading-relaxed text-ailu-cream/65">An event can bring planners, hosts, performers, makers and technical teams into one shared rhythm. Tell AILU what your occasion needs; the plan and any collaborators are discussed with you individually.</p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-px overflow-hidden border border-white/15 bg-white/15 md:grid-cols-4">
            {["Hosting and coordination", "Dance and performance", "Music and sound", "Décor and making", "Photography coordination", "Stage and lighting", "Games and participation", "Behind-the-scenes support"].map((item, index) => <li key={item} className="flex min-h-32 flex-col justify-between bg-ailu-black p-4 sm:min-h-40 sm:p-6"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-ailu-yellow/75">0{index + 1}</span><span className="max-w-[14ch] font-display text-base font-semibold leading-tight sm:text-lg">{item}</span></li>)}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-ailu-cream/45">AILU does not promise specific performers or availability on this page. Details are confirmed as part of an agreed event plan.</p>
        </div>
      </section>

      <section id="culture" className="scroll-mt-20 bg-ailu-black px-6 py-16 text-ailu-cream sm:px-10 sm:py-20 lg:px-16" aria-labelledby="culture-title">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <div className="bg-ailu-yellow p-6 text-ailu-black sm:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[.3em] text-black/60 sm:text-xs">Rooted in culture. Open to every rhythm.</p>
              <h2 id="culture-title" className="mt-4 max-w-[11ch] font-display text-[clamp(2.2rem,4.5vw,3.5rem)] font-semibold leading-[.96] tracking-[-.055em]">Many traditions. Room for your story.</h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-black/75">Share the customs and context that matter to your family or community. Regional art forms keep their own identities; any programme is discussed with care and confirmed individually.</p>
              <div className="mt-7 flex items-center gap-4 border-t border-black/20 pt-4"><Image src={BRAND.hand} alt="AILU golden hand symbol" width={74} height={56} className="h-12 w-[4.5rem] object-contain" /><span className="text-[10px] font-semibold uppercase tracking-[.18em]">Celebrations shaped around people</span></div>
            </div>
          </div>
          <ul className="border-t border-white/15">
            {disciplines.map((item) => <li key={item.title} className="grid gap-2 border-b border-white/15 py-5 sm:grid-cols-[.8fr_1.2fr] sm:gap-8 sm:py-6"><h3 className="font-display text-lg font-semibold sm:text-xl">{item.title}</h3><p className="max-w-lg text-sm leading-relaxed text-ailu-cream/60">{item.detail}</p><span className="sr-only">Traditions and performance ideas to discuss with AILU; availability is not implied.</span></li>)}
          </ul>
        </div>
      </section>

      <section id="inspiration" className="scroll-mt-20 bg-ailu-black px-6 py-16 text-ailu-cream sm:px-10 sm:py-20 lg:px-16" aria-labelledby="inspiration-title">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">Imagine it with AILU</p><h2 id="inspiration-title" className="mt-4 font-display text-[clamp(2.3rem,4.5vw,3.6rem)] font-semibold leading-[.96] tracking-[-.055em]">A feeling first.<br /><span className="text-ailu-yellow">Then all the details.</span></h2><p className="mt-5 max-w-2xl text-sm leading-relaxed text-ailu-cream/60">A few visual directions to help start a conversation. These are design concepts, not photographs of completed AILU events or promises of a particular setup.</p></div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {conceptDirections.map((item) => <article key={item.mark} className="group min-w-0">
              <div aria-hidden className={`relative aspect-[4/3] overflow-hidden rounded-sm bg-gradient-to-br ${item.art}`}><div className="absolute inset-4 border border-white/25 transition-transform duration-700 group-hover:scale-[.96] sm:inset-6" /><div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ailu-black/65 to-transparent" /><span className="absolute left-6 top-5 font-display text-5xl font-extrabold tracking-[-.08em] text-white/70">{item.mark}</span><span className="absolute bottom-5 left-6 text-[9px] font-bold uppercase tracking-[.22em] text-white">Concept direction · not event photography</span></div>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[.2em] text-ailu-yellow">{item.tag}</p><h3 className="mt-2 font-display text-lg font-semibold tracking-tight sm:text-xl">{item.title}</h3><p className="mt-2 max-w-sm text-sm leading-relaxed text-ailu-cream/60">{item.copy}</p>
            </article>)}
          </div>
          <p className="mt-6 text-xs text-ailu-cream/40">Concept artwork is illustrative. Real event photographs will be added only when approved and permissioned.</p>
        </div>
      </section>

      <section id="about" className="scroll-mt-20 bg-ailu-black px-6 py-20 text-ailu-cream sm:px-10 sm:py-24 lg:px-16" aria-labelledby="about-title">
        <div className="mx-auto grid max-w-7xl gap-8 border-y border-white/15 py-8 sm:py-12 lg:grid-cols-2 lg:gap-16">
          <div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">The AILU story</p><h2 id="about-title" className="mt-4 max-w-[10ch] font-display text-[clamp(2.3rem,4.5vw,3.6rem)] font-semibold leading-[.96] tracking-[-.055em]">Starting with a feeling. Caring about the details.</h2></div>
          <div className="space-y-4 self-end leading-relaxed text-ailu-cream/70"><p>AILU is an event management and celebration company based in Udupi, Karnataka. We believe a meaningful celebration starts with listening to your ideas, your people and the feeling you want to create.</p><p>We bring together event planning, creative opportunities and private dream support with care. Your traditions and priorities guide the conversation.</p><Link href="/about" className="inline-flex min-h-11 items-center gap-2 border-b border-ailu-yellow font-semibold text-ailu-yellow">More about AILU <span aria-hidden>↗</span></Link></div>
        </div>
      </section>

      <section id="how" className="scroll-mt-20 bg-ailu-black px-6 py-16 text-ailu-cream sm:px-10 sm:py-20 lg:px-16" aria-labelledby="how-title">
        <div className="mx-auto max-w-7xl"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">How it comes together</p><h2 id="how-title" className="mt-4 max-w-[12ch] font-display text-[clamp(2.3rem,4.5vw,3.6rem)] font-semibold leading-[.96] tracking-[-.055em]">From “what if” to “what a day.”</h2>
          <ol className="mt-10 grid gap-7 border-t border-white/15 pt-6 md:grid-cols-3 md:gap-10">{SITE_CONTENT.process.map((step, index) => <li key={step.title} className="flex flex-col items-start"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-ailu-yellow">Step 0{index + 1}</span><h3 className="mt-4 font-display text-xl font-semibold tracking-tight">{step.title}</h3><p className="mt-3 max-w-sm text-sm leading-relaxed text-ailu-cream/60">{step.body}</p></li>)}</ol>
          <Link href="/events#enquire" className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-sm bg-ailu-yellow px-5 font-semibold text-ailu-black transition hover:bg-ailu-cream">Tell us about your event <span aria-hidden>↗</span></Link>
        </div>
      </section>

      <section id="opportunities" className="scroll-mt-20 bg-ailu-black px-6 py-16 text-ailu-cream sm:px-10 sm:py-20 lg:px-16" aria-labelledby="opportunities-title">
        <div className="mx-auto max-w-7xl"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">More from AILU</p><h2 id="opportunities-title" className="mt-4 max-w-[12ch] font-display text-[clamp(2.3rem,4.5vw,3.6rem)] font-semibold leading-[.96] tracking-[-.055em]">Bring your spark. Find your people.</h2>
          <div className="mt-8 grid gap-px border border-white/15 bg-white/15 md:grid-cols-3">
            <article className="flex flex-col bg-ailu-black p-5 sm:p-7"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-ailu-yellow">Work with the team</span><h3 className="mt-4 font-display text-xl font-semibold leading-tight">Your talent belongs in the room.</h3><p className="mt-3 flex-1 text-sm leading-relaxed text-ailu-cream/60">Share what you can do, what you enjoy and what you hope to learn. An application is not a job offer.</p><Link href="/join/team" className="mt-5 inline-flex min-h-11 items-center gap-2 border-b border-ailu-yellow/60 font-semibold text-ailu-yellow">Introduce yourself <span aria-hidden>↗</span></Link></article>
            <article className="flex flex-col bg-ailu-black p-5 sm:p-7"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-ailu-yellow">External sales partner</span><h3 className="mt-4 font-display text-xl font-semibold leading-tight">Know someone planning a day?</h3><p className="mt-3 flex-1 text-sm leading-relaxed text-ailu-cream/60">Refer a client to AILU. Any reward applies only to a verified, completed booking under terms AILU confirms; registration does not guarantee earnings.</p><Link href="/join/partner" className="mt-5 inline-flex min-h-11 items-center gap-2 border-b border-ailu-yellow/60 font-semibold text-ailu-yellow">Explore partnering <span aria-hidden>↗</span></Link></article>
            <article className="flex flex-col bg-ailu-black p-5 sm:p-7"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-ailu-yellow">Private dream support</span><h3 className="mt-4 font-display text-xl font-semibold leading-tight">A place to be heard with care.</h3><p className="mt-3 flex-1 text-sm leading-relaxed text-ailu-cream/60">Dream submissions stay private and support is not guaranteed. The submission form is closed until AILU’s review is complete.</p><Link href="/dreams" className="mt-5 inline-flex min-h-11 items-center gap-2 border-b border-ailu-yellow/60 font-semibold text-ailu-yellow">How dream support works <span aria-hidden>↗</span></Link></article>
          </div>
          <p className="mt-6 max-w-3xl text-xs leading-relaxed text-black/55">Donations are not being collected. Learn about the Donation Box only on the <Link href="/donate" className="font-semibold underline underline-offset-2">information page</Link>.</p>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 bg-ailu-black px-6 py-20 text-ailu-cream sm:px-10 sm:py-28 lg:px-16" aria-labelledby="faq-title">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.75fr_1.25fr]">
          <div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">Good questions. Clear answers.</p><h2 id="faq-title" className="mt-4 max-w-[9ch] font-display text-[clamp(2.8rem,6vw,5rem)] font-extrabold leading-[.88] tracking-[-.075em]">A few things to know.</h2><Link href="/faq" className="mt-7 inline-flex min-h-11 items-center gap-2 border-b border-ailu-yellow font-semibold text-ailu-yellow">All questions <span aria-hidden>↗</span></Link></div>
          <div className="divide-y divide-white/15 border-y border-white/15">{featuredFaqs.map((item) => <details key={item.question} className="group py-4"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-5 font-display text-base font-semibold sm:text-lg [&::-webkit-details-marker]:hidden">{item.question}<span aria-hidden className="shrink-0 text-2xl font-normal text-ailu-yellow transition-transform group-open:rotate-45">+</span></summary><p className="max-w-2xl pb-3 pr-8 text-sm leading-relaxed text-ailu-cream/65">{item.answer}</p></details>)}</div>
        </div>
      </section>

      <section id="enquire" className="scroll-mt-20 bg-ailu-black px-6 py-16 text-ailu-cream sm:px-10 sm:py-20 lg:px-16" aria-labelledby="enquire-title">
        <div className="mx-auto grid max-w-7xl gap-8 border-t border-white/15 pt-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs">Let’s begin</p><h2 id="enquire-title" className="mt-4 max-w-[12ch] font-display text-[clamp(2.3rem,4.5vw,3.6rem)] font-semibold leading-[.96] tracking-[-.055em]">Something good starts with hello.</h2><p className="mt-5 max-w-xl text-sm leading-relaxed text-ailu-cream/60">Tell us about your occasion. AILU can review the details and discuss availability, scope, terms and a quotation. An enquiry is not a confirmed booking.</p></div><div className="flex flex-wrap gap-3"><Link href="/events#enquire" className="inline-flex min-h-12 items-center gap-3 rounded-sm bg-ailu-yellow px-5 font-semibold text-ailu-black">Plan an event <span aria-hidden>↗</span></Link><a href={`${BRAND.whatsapp}?text=${encodeURIComponent("Hi AILU, I would like to ask about planning a celebration.")}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center border border-white/20 px-5 text-sm font-semibold text-ailu-cream/80">WhatsApp AILU</a></div></div>
      </section>
    </>
  );
}
