export default function PageHero({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-ailu-black text-ailu-cream">
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(50% 90% at 88% 0%, rgba(245,196,0,.25), transparent 70%)" }} />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <h1 className="text-4xl font-extrabold sm:text-5xl">{title}</h1>
        {children && <p className="mt-3 max-w-2xl text-lg text-ailu-cream/75">{children}</p>}
      </div>
    </section>
  );
}
