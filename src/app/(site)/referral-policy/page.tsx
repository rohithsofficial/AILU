import LegalPage from "@/components/LegalPage";
import { BRAND } from "@/lib/brand";
import { metadataForPath } from "@/lib/public-metadata";

export const metadata = metadataForPath("/referral-policy");
const sections = [
  { title: "Recording a referral", paragraphs: ["An AILU sales partner may share their AILU-SP partner ID with someone making an event enquiry. The visitor can enter that ID in the event enquiry form. The server records attribution only when the ID matches a partner record that is not rejected or suspended and the enquiry phone does not match the partner's own phone. Invalid or ineligible IDs are ignored quietly."] },
  { title: "When a reward may be considered", paragraphs: ["Partner registration does not guarantee earnings. A reward is considered only after AILU verifies the referral and the referred event is completed and fully paid. AILU's staff workflow also checks partner approval and an accepted quotation before a commission can be proposed. AILU confirms the reward amount and basis in writing under the terms agreed with the partner."] },
  { title: "No fixed reward formula", paragraphs: ["There is no published fixed amount or percentage. AILU has not promised a reward for every event type. Do not describe a possible reward as guaranteed income. Commission proposals are reviewed and approved by authorized AILU staff."] },
  { title: "Questions", paragraphs: [`For partner questions, contact ${BRAND.email} or ${BRAND.phone}. This policy should be reviewed by an Indian lawyer before launch.`] },
];
export default function ReferralPolicyPage() { return <LegalPage title="Referral policy" intro="How partner attribution works and when AILU may consider a referral reward." sections={sections} />; }
