export default function EventsLoading() {
  return <div className="mx-auto max-w-6xl animate-pulse px-4 py-16" aria-busy="true" aria-label="Loading events"><div className="h-40 rounded-3xl bg-ailu-black/10" /><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-44 rounded-2xl bg-black/10" />)}</div></div>;
}
