import { BRAND } from "@/lib/brand";
import PageHero from "@/components/PageHero";
export const metadata = { title: "Fulfil Your Dreams | AILU" };

export default function Dreams() {
  return (
    <>
    <PageHero title="Fulfil your dreams">Some dreams wait because of money or circumstances. If you have one, tell us. When AILU is able to help, we help privately.</PageHero>
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h2 className="text-2xl font-bold">Our promise</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6">
        <li>Your story is never published or shared publicly. There are no public stories on this site.</li>
        <li>We help with dignity and respect.</li>
        <li>We will not ask for sensitive details such as identity documents or bank information.</li>
      </ul>
      <p className="mt-6 text-sm text-black/65">Sharing a dream does not guarantee it can be fulfilled. What we can do depends on suitability, safety and available resources. If the dreamer is under 18, a parent or guardian should be involved.</p>
      <p className="mt-6 rounded-lg bg-ailu-yellow/30 p-4">The private dream form opens soon. To reach us now, call <a className="font-semibold underline" href={`tel:${BRAND.phone.replace(/\s/g, "")}`}>{BRAND.phone}</a> or write to <a className="font-semibold underline" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>.</p>
    </div>
    </>
  );
}
