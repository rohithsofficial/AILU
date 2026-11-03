import Link from "next/link";

export default function NotAllowed() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-display text-2xl font-bold">Not allowed</h1>
      <p className="mt-2 text-sm text-ailu-cream/60">Your role does not open that page. Ask an owner if you believe you need it.</p>
      <Link href="/admin" className="mt-6 inline-block rounded-full bg-ailu-yellow px-6 py-2.5 text-sm font-semibold text-ailu-black">Back to dashboard</Link>
    </div>
  );
}
