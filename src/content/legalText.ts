// Default wording for the legal pages. {phone} and {email} are filled in from Contact details.
export const LEGAL_TEXT = {
  privacy: {
    title: "Privacy policy",
    intro: "How AILU uses the details you choose to share through this website.",
    lastUpdated: "3 November 2026",
    sections: [
      {
        title: "Information you send",
        paragraphs: [
          "The event enquiry form asks for your name, mobile number, optional email, event category, optional event date, location, optional guest count, budget, services, additional details, optional AILU partner ID, and consent to be contacted about the event.",
          "The team application form asks for your name, mobile number, optional email, city, role, skills, optional experience, portfolio URL, availability, event interests, beginner selection, optional notes, and consent to be contacted about the application.",
          "The partner registration form asks for your name, mobile number, optional email, city, client categories, optional experience, referral source, and consent to be contacted about partner terms.",
          "When the private dream form is open, an adult may provide a name or nickname, city, phone and/or email, dream category and description, optional context about why it matters and what help would make a difference, and consent to private contact. For someone under 18, the parent or guardian provides their own name and phone, the child's optional first name or nickname, the city, dream details and required guardian consent. The form does not request the child's phone, email, school, address, photos or identity documents. Do not send Aadhaar, PAN, bank or card details, medical records, home addresses or identity documents; obvious patterns are rejected by the form."
        ]
      },
      {
        title: "How information is used and stored",
        paragraphs: [
          "Form data is stored in AILU's Neon PostgreSQL database and used to review and respond to event enquiries, plan events, assess team applications, manage partner registrations and referral attribution, and privately review a dream request if that form is open. Dream details are restricted to authorized OWNER and MANAGER staff. They are not used in public content, stories, search, analytics or advertising.",
          "The site also uses salted HMAC hashes of request IP addresses and contact details to apply temporary abuse-protection limits. Raw IP addresses and contact values are not stored in the rate-limit table. Old counters are cleaned up opportunistically; AILU has not set a fixed retention period for submissions.",
          "The optional introduction answers (name, city, visitor type, and selected intent) are stored in your browser's local storage on your device. They are not sent to AILU's database by the intro."
        ]
      },
      {
        title: "Consent, contact, and your choices",
        paragraphs: [
          "Each public form asks for permission before AILU contacts you about that form's purpose. The current application and partner APIs do not store the checkbox as a separate database field; the event enquiry API also does not retain a separate consent timestamp. This implementation detail should be reviewed before launch.",
          "To ask about access, correction, or deletion of information you submitted, email {email} from an address or number that helps AILU identify the relevant submission. AILU will review the request and respond. The site does not yet provide a self-service account or deletion control."
        ]
      },
      {
        title: "Cookies and similar storage",
        paragraphs: [
          "AILU does not add advertising or analytics tracking cookies in the public-site code. Browser local storage is used only for the optional intro answers and the intro-seen preference. When the site is in coming-soon mode, a preview cookie can remember an authorized preview in that browser. Staff sign-in uses authentication cookies."
        ]
      },
      {
        title: "Private dreams and children",
        paragraphs: [
          "Dream submissions are private and are never published. Only AILU's authorized OWNER and MANAGER staff can review them; they do not appear in public stories, search or analytics. Sharing a dream does not guarantee support. AILU decides based on suitability, safety and available resources. The form is not for emergencies or urgent medical or financial crises; if anyone is in immediate danger in India, call 112.",
          "For a dreamer under 18, a parent or guardian must submit the request, provide their own contact details and give consent. The child's own contact details are not requested. The form does not independently verify the guardian relationship; AILU needs to decide what verification and handling safeguards are appropriate before enabling submissions.",
          "To request deletion, contact {email} or {phone} and provide the private reference ID. AILU has not set a retention period and does not promise how long closed records are kept. Do not email the dream text or share the reference ID publicly."
        ]
      },
      {
        title: "Privacy approach",
        paragraphs: [
          "AILU aims to explain why information is requested, use it for that purpose, limit collection, protect it with restricted staff access, and respond to requests about personal information. These statements are intended to align with applicable Indian data-protection requirements, including the Digital Personal Data Protection Act, 2023 and rules as they take effect. Read the official Act: https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf. This page needs review by an Indian privacy lawyer before launch; it is not legal advice."
        ]
      },
      {
        title: "Contact",
        paragraphs: [
          "For privacy questions, contact {email} or call {phone}."
        ]
      }
    ]
  },
  terms: {
    title: "Website terms",
    intro: "Terms for event enquiries and other public forms on the AILU website.",
    lastUpdated: "3 November 2026",
    sections: [
      {
        title: "Using this website",
        paragraphs: [
          "Use the website and forms lawfully, provide accurate information, and do not submit another person's information without permission. AILU may update public information as its services change."
        ]
      },
      {
        title: "Enquiries and quotations",
        paragraphs: [
          "An enquiry asks AILU to review an event request. It is not an offer acceptance or a confirmed booking. Any event depends on availability, agreed scope and terms, and required payment. A quotation is specific to the requirements discussed and is subject to the validity and terms communicated with it. No payment is taken on this website."
        ]
      },
      {
        title: "Applications and partner registrations",
        paragraphs: [
          "A team application is not an offer of employment, work, or a paid assignment. A partner registration does not guarantee approval, referrals, earnings, or rewards. A reward is considered only under the referral terms AILU confirms, after the applicable booking has been verified, completed, and paid."
        ]
      },
      {
        title: "Dream support and donations",
        paragraphs: [
          "Dream submissions are accepted only when the private form is open. A submission does not guarantee fulfilment; AILU decides based on suitability, safety and available resources. Submissions are for private review and are never published. A parent or guardian must submit and consent for a dreamer under 18. Do not submit identity documents, financial account or card details, medical records, a home address, or other sensitive documents. The form is not for emergencies or urgent medical or financial crises; call 112 if anyone is in immediate danger in India. The Donation Box is not open and this website does not collect donations."
        ]
      },
      {
        title: "Website content",
        paragraphs: [
          "AILU names, logo, copy, and original website materials are provided for this site. Do not reproduce AILU materials or imply endorsement without permission. Event category descriptions are general and do not guarantee a service or availability."
        ]
      },
      {
        title: "Contact",
        paragraphs: [
          "Questions about these terms can be sent to {email} or {phone}. These terms should be reviewed by an Indian lawyer before launch."
        ]
      }
    ]
  },
  referralPolicy: {
    title: "Referral policy",
    intro: "How partner attribution works and when AILU may consider a referral reward.",
    lastUpdated: "3 November 2026",
    sections: [
      {
        title: "Recording a referral",
        paragraphs: [
          "An AILU sales partner may share their AILU-SP partner ID with someone making an event enquiry. The visitor can enter that ID in the event enquiry form. The server records attribution only when the ID matches a partner record that is not rejected or suspended and the enquiry phone does not match the partner's own phone. Invalid or ineligible IDs are ignored quietly."
        ]
      },
      {
        title: "When a reward may be considered",
        paragraphs: [
          "Partner registration does not guarantee earnings. A reward is considered only after AILU verifies the referral and the referred event is completed and fully paid. AILU's staff workflow also checks partner approval and an accepted quotation before a commission can be proposed. AILU confirms the reward amount and basis in writing under the terms agreed with the partner."
        ]
      },
      {
        title: "No fixed reward formula",
        paragraphs: [
          "There is no published fixed amount or percentage. AILU has not promised a reward for every event type. Do not describe a possible reward as guaranteed income. Commission proposals are reviewed and approved by authorized AILU staff."
        ]
      },
      {
        title: "Questions",
        paragraphs: [
          "For partner questions, contact {email} or {phone}. This policy should be reviewed by an Indian lawyer before launch."
        ]
      }
    ]
  }
};
