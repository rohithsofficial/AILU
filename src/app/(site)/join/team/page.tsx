import PageHero from "@/components/PageHero";
import ApplicationForm from "@/components/forms/ApplicationForm";
import { metadataForPath } from "@/lib/public-metadata";
export const metadata = metadataForPath("/join/team");

export default function TeamPage() {
  return (
    <>
      <PageHero title="Join the AILU team">Hosting, dance, music, photography, decoration, coordination and more. Beginners who want to learn are welcome.</PageHero>
      <div className="mx-auto max-w-3xl px-4 py-14">
        <p className="mb-6 rounded-lg bg-ailu-yellow/30 p-4 text-sm">Please give accurate details. Applying does not guarantee work or a paid assignment. Assignments depend on suitability, availability, event requirements and agreed terms.</p>
        <ApplicationForm />
      </div>
    </>
  );
}
