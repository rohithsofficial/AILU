import PageHero from "@/components/PageHero";
export const metadata = { title: "Donation Box | AILU" };

export default function Donate() {
  return (
    <>
    <PageHero title="The AILU donation box">A place for people to contribute towards helping individuals who are going through difficult times.</PageHero>
    <div className="mx-auto max-w-3xl px-4 py-14">
      <p className="rounded-lg bg-ailu-yellow/30 p-4"><strong>Not open yet.</strong> We will switch donations on only once the proper payment and legal setup is ready, so that every rupee is handled openly.</p>
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
