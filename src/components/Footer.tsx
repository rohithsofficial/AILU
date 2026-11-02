import { BRAND } from "@/lib/brand";
export default function Footer() {
  return (
    <footer id="contact" className="bg-ailu-black text-ailu-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-bold text-ailu-yellow">{BRAND.tagline}</h2>
          <p className="mt-3 max-w-md text-ailu-cream/80">Based in Udupi, with selected bookings across South India.</p>
        </div>
        <ul className="space-y-2 text-lg">
          <li><a className="underline decoration-ailu-yellow" href={`tel:${BRAND.phone.replace(/\s/g, "")}`}>{BRAND.phone}</a></li>
          <li><a className="underline decoration-ailu-yellow" href={BRAND.whatsapp}>Chat on WhatsApp</a></li>
          <li><a className="underline decoration-ailu-yellow" href={`mailto:${BRAND.email}`}>{BRAND.email}</a></li>
        </ul>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-sm text-ailu-cream/60">© 2026 AILU, Udupi, Karnataka</p>
    </footer>
  );
}
