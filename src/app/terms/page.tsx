import LegalPage from "@/components/LegalPage";
import { BRAND } from "@/lib/brand";
import { metadataForPath } from "@/lib/public-metadata";

export const metadata = metadataForPath("/terms");
const sections = [
  { title: "Using this website", paragraphs: ["Use the website and forms lawfully, provide accurate information, and do not submit another person's information without permission. AILU may update public information as its services change."] },
  { title: "Enquiries and quotations", paragraphs: ["An enquiry asks AILU to review an event request. It is not an offer acceptance or a confirmed booking. Any event depends on availability, agreed scope and terms, and required payment. A quotation is specific to the requirements discussed and is subject to the validity and terms communicated with it. No payment is taken on this website."] },
  { title: "Applications and partner registrations", paragraphs: ["A team application is not an offer of employment, work, or a paid assignment. A partner registration does not guarantee approval, referrals, earnings, or rewards. A reward is considered only under the referral terms AILU confirms, after the applicable booking has been verified, completed, and paid."] },
  { title: "Dream support and donations", paragraphs: ["Dream support requests are not accepted through a form on this website. Any future support is private and is not guaranteed. The Donation Box is not open and this website does not collect donations."] },
  { title: "Website content", paragraphs: ["AILU names, logo, copy, and original website materials are provided for this site. Do not reproduce AILU materials or imply endorsement without permission. Event category descriptions are general and do not guarantee a service or availability."] },
  { title: "Contact", paragraphs: [`Questions about these terms can be sent to ${BRAND.email} or ${BRAND.phone}. These terms should be reviewed by an Indian lawyer before launch.`] },
];
export default function TermsPage() { return <LegalPage title="Website terms" intro="Terms for event enquiries and other public forms on the AILU website." sections={sections} />; }
