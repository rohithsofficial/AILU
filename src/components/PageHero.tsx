export default function PageHero({ title, children, marker = "A moment, made yours" }: { title: string; children?: React.ReactNode; marker?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-ailu-black text-ailu-cream">
      <div aria-hidden className="absolute inset-y-0 right-[12%] w-px bg-ailu-yellow/10" />
      <div aria-hidden className="absolute inset-y-0 right-[24%] w-px bg-white/[.04]" />
      <div className="relative mx-auto flex min-h-[300px] max-w-7xl items-center px-6 py-16 sm:min-h-[360px] sm:px-10 sm:py-20 lg:px-16">
        <div className="relative z-10">
          <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.3em] text-ailu-yellow sm:text-xs"><span aria-hidden className="h-px w-9 bg-ailu-yellow" />{marker}</p>
          <h1 className="mt-6 max-w-5xl font-display text-[clamp(2.7rem,6vw,4.8rem)] font-semibold leading-[.94] tracking-[-.06em]">{title}</h1>
          {children && <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ailu-cream/65 sm:text-base">{children}</p>}
        </div>
      </div>
    </section>
  );
}
