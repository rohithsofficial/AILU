import PageHero from "@/components/PageHero";
import { metadataForPath } from "@/lib/public-metadata";
export const metadata = metadataForPath("/donate");

export default function Donate() {
  return (
    <>
    <PageHero title="The AILU Donation Box">AILU hopes to support individuals in need, but the Donation Box is not open and no donations are collected through this website.</PageHero>
    <div className="mx-auto max-w-3xl px-4 py-14">
      <p className="rounded-lg bg-ailu-yellow/50 p-4 text-black"><strong>Not open.</strong> AILU will consider accepting donations only after the appropriate legal structure, transparent operating process, and licensed payment provider are in place. No donation is collected here.</p>
      <h2 className="mt-8 text-2xl font-bold">What we will explain here before opening</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6">
        <li>Who receives donations and how AILU decides who is helped.</li>
        <li>How funds are recorded and reported.</li>
        <li>Whether a donation is eligible for any tax benefit. We will not claim this unless it applies.</li>
        <li>Secure online payment through a licensed payment provider.</li>
      </ul>
    </div>
    </>
  );
}
