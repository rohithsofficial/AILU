# AILU | The Future of Celebrations
## Complete 3D Interactive Event Platform Website

### PROJECT OVERVIEW

Build a premium, immersive, animated 3D website for **AILU**, an event management and celebration company based in Udupi, Karnataka, India.

Existing website:
https://ailu-celebrations.sandeepkumarof388276.chatgpt.site/

AILU is an event-based company that creates celebrations, corporate events, entertainment experiences, community events, and memorable moments.

The new website should transform AILU from a traditional event management website into an interactive digital experience where visitors can:

1. Explore and book events.
2. Discover exclusive event offers.
3. Earn and redeem loyalty points.
4. Refer clients and earn referral rewards.
5. Apply for opportunities within AILU.
6. Become an event collaborator, performer, or sales partner.
7. Share their dreams and wishes with AILU.
8. Interact with a future AI character called AILU.
9. Discover special initiatives where AILU may help fulfill selected wishes.
10. Access their personal account, bookings, rewards, referrals, and applications.

The website must feel like entering the world of AILU, not simply opening a normal business website.

The overall experience should be emotional, modern, premium, friendly, interactive, and technically realistic.

---

# 1. BRAND IDENTITY AND DESIGN SYSTEM

Use the existing AILU branding as the foundation.

Do not create an unrelated brand identity.

### Brand name
AILU

### Existing tagline
Creating Moments. Delivering Smiles.

### Brand personality
- Friendly
- Creative
- Emotional
- Premium
- Innovative
- Trustworthy
- Celebratory
- Community-oriented

### Brand colors

Use the existing branding:

Signature AILU Yellow:
#F5C400

Signature Black:
#111111

Warm White:
#FFFDF7

Use yellow for important highlights, interactive elements, the hand symbol, buttons, reward points, and animation accents.

Use black for strong visual presence and premium sections.

Use warm white for readable content, cards, forms, and comfortable visual spacing.

Do not introduce unrelated colors that weaken the existing identity.

### Logo

Use the actual AILU logo from the existing website.

The existing hand-and-heart symbol must become the central visual identity of the new experience.

Do not replace it with a generic hand icon, emoji, or unrelated AI-generated logo.

If the original logo asset is unavailable, create a temporary logo placeholder and clearly structure the implementation so the original logo can be inserted later.

The hand symbol should appear in:

- Website opening animation.
- Main navigation.
- Loading animation.
- AILU AI character identity.
- Rewards section.
- Website footer.
- Special wish initiative.
- Mobile navigation.

The hand symbol should be recognizable throughout the experience.

### Typography

Use a modern, premium, highly readable typography system.

Recommended:
- Poppins for headings and branding.
- Inter for body text and application forms.

Use bold typography for major statements.

Keep paragraphs readable and avoid excessively small text.

---

# 2. TECHNOLOGY STACK

Build the website using a production-oriented architecture.

Recommended stack:

Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion for UI animations
- Three.js
- React Three Fiber
- Drei

Backend:
- Next.js API routes or server actions.
- Firebase Authentication.
- Cloud Firestore.
- Firebase Storage where required.

Optional future integrations:
- Razorpay for event payments.
- WhatsApp Business integration.
- Email notifications.
- AI API integration for the AILU assistant.

Use the existing repository and project structure if one is provided.

Do not unnecessarily replace existing working components.

Build reusable components, maintainable code, and a scalable structure.

The website must work on desktop, tablet, and mobile.

---

# 3. WEBSITE OPENING EXPERIENCE

This is the most important part of the website.

When someone opens the website URL, they should immediately experience a cinematic AILU introduction.

The opening should be a carefully designed 3D animation.

Do not immediately display a conventional navbar and hero section.

The animation should introduce the brand first.

### Scene 1: Black screen

When the visitor first opens the website:

Display a full-screen black background.

Keep the screen clean.

A subtle ambient sound toggle may be provided, but audio must never play automatically.

Show a small loading indicator only when necessary.

### Scene 2: AILU hand symbol appears

The AILU hand-and-heart logo symbol should slowly appear in the center.

Create a beautiful 3D-inspired animation.

The symbol should:

- Fade into view.
- Slowly rotate or move.
- Have subtle depth.
- Receive a soft yellow light.
- Create a premium cinematic feeling.

The animation should not distort the actual logo.

If the logo is a flat SVG or image, use it as a texture or plane while creating depth around it.

### Scene 3: Hand animation

Create an elegant animation where the AILU hand symbol appears to welcome the visitor.

The animation should communicate:

Welcome.

Care.

Celebration.

Connection.

Use a subtle glowing yellow particle effect.

Avoid excessive particles or flashy effects.

### Scene 4: AILU letters appear

After the hand symbol animation, introduce the AILU letters one by one.

A

I

L

U

Each letter should appear with a smooth animation.

Use a combination of:

- Motion.
- Opacity.
- Slight depth.
- Smooth easing.
- Subtle lighting.

The logo must eventually become a complete recognizable AILU brand.

### Scene 5: Welcome message

After the logo animation, display:

"HI, WELCOME TO AILU"

Then:

"Creating Moments. Delivering Smiles."

Then:

"Every celebration begins with a feeling."

Introduce the visitor to the AILU experience.

### Scene 6: Main entrance

Display two primary options:

"EXPLORE AILU"

"ENTER YOUR AILU WORLD"

The first option should take visitors to the main website.

The second should open the interactive account and discovery experience.

Provide a skip intro button.

Returning visitors should not be forced to watch the complete animation every time.

Use session-based preferences where appropriate.

### Animation performance

The animation must:

- Load efficiently.
- Support mobile devices.
- Respect reduced-motion accessibility preferences.
- Avoid excessive CPU and GPU usage.
- Provide a lightweight fallback.
- Never prevent the website from loading if WebGL is unavailable.

Do not use an extremely heavy 3D scene.

The animation must be impressive but practical for a company with a limited budget.

---

# 4. MAIN WEBSITE EXPERIENCE

After the opening animation, introduce the main website.

Create a cinematic hero section.

### Hero heading

"Every Moment Deserves Something Extraordinary."

Supporting text:

"From unforgettable celebrations to meaningful experiences, AILU brings people together through creativity, entertainment, and thoughtful event planning."

Primary CTA:

"Explore Events"

Secondary CTA:

"Become Part of AILU"

Third CTA:

"Meet AILU"

Use a subtle 3D environment inspired by celebrations.

Possible visual elements:

- Floating golden particles.
- Animated light.
- Abstract celebration objects.
- 3D hand symbol.
- Elegant event-inspired visuals.

Do not overcrowd the hero.

The focus must remain on the AILU brand.

---

# 5. MAIN NAVIGATION

Create a modern navigation system.

Desktop navigation:

- Home
- Events
- Offers & Rewards
- Opportunities
- Dreams & Wishes
- About AILU
- Login

Primary navigation button:

"Book an Event"

Include the AILU logo in the navigation.

When a user logs in, replace the login button with their profile avatar or account menu.

Mobile navigation should be simple and accessible.

Use a responsive menu with smooth animation.

---

# 6. VISITOR LOGIN AND REGISTRATION

Visitors should be able to explore public information without creating an account.

However, booking an event, saving rewards, applying for opportunities, submitting referrals, and accessing personal information should require authentication.

### Authentication methods

Implement:

- Phone number login.
- OTP verification.
- Optional email authentication.

Use Firebase Authentication.

Do not collect passwords or OTPs unnecessarily.

Phone number verification should be handled securely through the authentication provider.

### Account registration

Collect only necessary information.

Required fields:

- Full name.
- Phone number.
- Email address, if available.
- City.
- Account type.

Account types:

1. Event Customer
2. Event Collaborator
3. Sales Partner
4. Dreamer

Allow users to select multiple interests if appropriate.

### User profile

Every registered user should have a unique AILU user ID.

Example format:

AILU-USER-000001

The ID should be generated by the backend.

Never allow users to manually choose another person's ID.

The profile should display:

- Name.
- Unique user ID.
- Phone verification status.
- Available reward points.
- Total referrals.
- Event booking history.
- Application status.
- Account preferences.

Do not expose personal phone numbers or private profile information publicly.

---

# 7. EVENT DISCOVERY AND BOOKING

AILU is primarily an event management company.

Event discovery and booking must be the central business functionality.

Create an interactive event discovery experience.

### Event categories

Personal celebrations:

- Birthdays.
- Anniversaries.
- Engagements.
- Baby showers.
- Family celebrations.

Wedding celebrations:

- Engagement functions.
- Pre-wedding events.
- Intimate weddings.
- Wedding entertainment.

Corporate events:

- Annual days.
- Company celebrations.
- Product launches.
- Employee engagement.
- Team gatherings.

Entertainment:

- Hosting.
- Anchoring.
- Dance.
- Singing.
- DJs.
- Musicians.
- Performances.
- Interactive games.

Community events:

- College programs.
- Cultural events.
- Reunions.
- Association gatherings.

### Event discovery page

Display event categories using visually engaging cards.

Each card should include:

- Event category.
- Image or animation.
- Short description.
- Starting price only when verified.
- Available services.
- Explore button.

Do not invent prices or availability.

If pricing depends on requirements, display:

"Request a personalized quotation."

### Event details

When visitors select an event, display:

- Event overview.
- Available services.
- Entertainment options.
- Location.
- Estimated guest count.
- Budget preferences.
- Available dates.
- Booking requirements.
- Event planning process.

Allow visitors to submit an event enquiry.

### Event booking form

Fields:

- Customer name.
- Verified phone number.
- Email.
- Event category.
- Event date.
- Event location.
- Expected guest count.
- Estimated budget.
- Required services.
- Additional details.

After submission:

Generate a booking enquiry ID.

Example:

AILU-EVT-000001

Display:

"Thank you for choosing AILU. Our team will review your requirements and contact you."

The enquiry is not a confirmed booking.

A booking becomes confirmed only after the team verifies availability, agrees on scope and terms, and confirms the required payment.

### Booking dashboard

Users should be able to view:

- Enquiry submitted.
- Under review.
- Quotation prepared.
- Awaiting customer confirmation.
- Payment pending.
- Booking confirmed.
- Event completed.
- Cancelled.

Only authorized staff should update booking status.

---

# 8. AILU OFFERS AND REWARDS

Create a dedicated loyalty and rewards system.

The objective is to encourage repeat customers and community participation.

However, AILU is a growing company with limited initial capital.

The rewards system must be financially sustainable.

Do not promise unlimited rewards, guaranteed profits, or unrealistic monetary benefits.

### Rewards dashboard

Display:

- Available points.
- Total points earned.
- Total points redeemed.
- Pending points.
- Rewards history.
- Referral rewards.
- Event booking rewards.

### Reward points

Users may earn points through eligible activities.

Examples:

1. Completing an eligible event booking.
2. Referring a new customer.
3. Participating in approved AILU activities.
4. Completing an eligible campaign.
5. Receiving an approved special reward.

The backend must determine eligibility.

Do not automatically award points for every activity without an approved rule.

### Event booking rewards

When a user books and completes an eligible event:

The backend may award points according to the configured reward policy.

Example:

A customer books an event.

After the event is completed and the payment is verified:

The system calculates the eligible reward points.

Points should not be issued for cancelled or unpaid bookings.

### Reward redemption

Users may redeem points for:

- Eligible event discounts.
- Selected event experiences.
- Special gifts.
- Approved merchandise.
- Future AILU offers.

Provide a redemption catalogue.

Each reward must display:

- Reward name.
- Points required.
- Availability.
- Redemption conditions.
- Expiry date, if applicable.

Do not display rewards that AILU cannot currently provide.

### Donation option

Introduce an optional:

"Donate Your AILU Points"

Users may contribute eligible points to an AILU community initiative.

The donation system should clearly explain:

- What the initiative supports.
- How points are contributed.
- Whether the donation is reversible.
- Whether the points have monetary value.

Points should not be described as cash donations unless AILU has implemented a legitimate monetary donation process.

If actual money donations are introduced later, use a properly configured payment system and transparent information about the recipient and use of funds.

### Financial sustainability

Create an admin-configurable reward policy.

The system must support:

- Maximum reward limits.
- Minimum redemption thresholds.
- Expiry policies.
- Campaign budgets.
- Reward approval.
- Fraud prevention.
- Point adjustment logs.

Initially, prioritize small, practical rewards that AILU can genuinely fulfill.

---

# 9. REFERRAL PROGRAM

Create a separate referral system.

AILU customers and approved sales partners should be able to introduce new clients.

### Referral dashboard

Display:

- Unique referral ID.
- Referral link.
- Total referrals.
- Pending referrals.
- Qualified referrals.
- Completed referrals.
- Earned rewards.

Example:

AILU-REF-000001

Each user should receive a unique referral ID.

### Referral process

1. A registered user receives a referral ID.
2. The user shares the ID with a potential customer.
3. The new customer submits an event enquiry.
4. The referral ID is entered during the enquiry process.
5. The backend records the referral.
6. AILU reviews the enquiry.
7. If the customer books an eligible event and completes the required payment, the referral becomes qualified.
8. The approved referral reward is credited.

### Referral rewards

The admin must be able to configure:

- Fixed reward.
- Percentage-based reward.
- Point-based reward.
- Campaign-specific reward.

Do not promise a fixed commission before AILU defines its business policy.

If monetary rewards are introduced, calculate them only from verified eligible transactions and approved commission rules.

### Referral protection

Implement:

- Duplicate referral prevention.
- Self-referral prevention.
- Unique customer validation.
- Fraud detection.
- Reward approval.
- Referral history.

Do not allow users to create unlimited fake referrals.

---

# 10. OPPORTUNITIES WITH AILU

Create a dedicated section:

"Grow With AILU"

Supporting text:

"Bring your talent, ideas, and energy. Become part of the experiences we create."

This section should support two main participation paths.

## OPTION A: WORK WITH THE AILU TEAM

People interested in contributing to event delivery can apply.

Possible roles:

- Event coordination.
- Event planning.
- Hosting.
- Anchoring.
- Dance.
- Choreography.
- Singing.
- Musicians.
- DJs.
- Photography.
- Videography.
- Decoration.
- Creative production.
- Hospitality.
- Event logistics.
- Backstage coordination.
- Technical support.

### Application form

Collect:

- Full name.
- Phone number.
- Email.
- City.
- Preferred role.
- Skills.
- Experience.
- Portfolio URL, if available.
- Availability.
- Preferred event categories.
- Additional information.

For applicants who are new:

Allow them to select:

"I am a beginner and want to learn."

Do not reject beginners automatically.

### Unique applicant ID

Generate a backend-created application ID.

Example:

AILU-APP-000001

### Application status

Display:

- Application submitted.
- Under review.
- Shortlisted.
- Contacted.
- Selected for an opportunity.
- Not selected.
- Closed.

Submitting an application must not guarantee employment, a paid assignment, or an event booking.

Clearly communicate that actual assignments depend on suitability, availability, event requirements, and agreed terms.

### Team dashboard

The admin should be able to:

- View applications.
- Filter by role.
- Search by applicant ID.
- Review portfolios.
- Update status.
- Add internal notes.
- Contact applicants.
- Assign approved opportunities.

Only authorized staff can access applicant information.

---

# 11. OPTION B: SALES AND CLIENT REFERRAL PARTNERS

Create a separate section:

"Bring Opportunities. Grow Together."

This is for people who want to introduce clients to AILU.

The person does not need to perform event work.

They may introduce:

- Birthday event clients.
- Wedding clients.
- Corporate event clients.
- Entertainment clients.
- Community event clients.

### Sales partner registration

Collect:

- Full name.
- Verified phone number.
- Email.
- City.
- Preferred client categories.
- Relevant experience.
- Referral source.

Generate a unique sales partner ID.

Example:

AILU-SP-000001

### Sales partner dashboard

Display:

- Sales partner ID.
- Referral link.
- Total leads submitted.
- Leads under review.
- Qualified leads.
- Completed bookings.
- Approved commissions.
- Pending commissions.
- Payment history.

### Client referral form

When the sales partner submits a client:

Collect:

- Client name.
- Client contact details.
- Event category.
- Event date, if known.
- Location.
- Approximate budget.
- Additional requirements.
- Sales partner ID.

The backend must validate the partner ID.

### Commission system

Create an admin-configurable commission policy.

Commission may depend on:

- Event category.
- Completed booking.
- Verified customer payment.
- Actual business margin.
- Agreed partner terms.

The system must not promise a commission before the company approves the policy.

Do not display fake earnings or guaranteed income.

The admin must be able to approve or reject commissions.

The dashboard should show:

"Pending approval"

"Approved"

"Paid"

"Rejected"

---

# 12. DREAMS AND WISHES WITH AILU

Create a unique emotional section.

This is one of the most important parts of the AILU identity.

Section name:

"Dream With AILU"

Alternative tagline:

"Every dream deserves to be heard."

The concept:

People can share dreams, wishes, ideas, or something meaningful they would love to experience.

Examples:

- A child wants to experience a special celebration.
- Someone wants to organize a meaningful event for their family.
- Someone wants to surprise a parent.
- Someone wants to help their community.
- Someone has an idea for making people happy.
- Someone wishes to create a memorable moment for another person.

The purpose is to make AILU more than an event booking company.

AILU should become a brand that listens to people and creates meaningful experiences.

### Dream submission

Create a friendly submission experience.

Fields:

- Display name or preferred name.
- Age group.
- City.
- Dream category.
- Dream description.
- Why the dream matters.
- What kind of help would make a difference.
- Optional image.

Categories:

1. My Dream.
2. Family.
3. Celebration.
4. Helping Someone.
5. Community.
6. Creative Idea.
7. Something Special.

Allow anonymous public-facing submissions where appropriate.

However, the backend must maintain appropriate privacy and moderation controls.

### Privacy

Dreams must not automatically become public.

The user should explicitly choose whether their dream can be considered for public display.

Do not publish:

- Personal phone numbers.
- Home addresses.
- School information.
- Sensitive family information.
- Private messages.

For children, use an age-appropriate submission process with appropriate parent or guardian consent and review.

Do not allow children to publicly share personal contact information.

---

# 13. AILU WISH INITIATIVE

Create a special initiative:

"One Dream. One Smile. One AILU Moment."

The concept:

People submit meaningful wishes.

The AILU team reviews the submissions.

From time to time, the team may select a wish and try to fulfill it through an appropriate celebration, experience, or community initiative.

### Important

Do not promise that every wish will be fulfilled.

Do not display fake completed wishes.

Do not create artificial emotional stories.

Clearly communicate:

"Submitting a wish does not guarantee fulfillment. Selected wishes depend on suitability, available resources, safety, and the AILU team's decision."

### Wish selection

Create an admin dashboard where authorized staff can:

- Review wishes.
- Approve submissions.
- Reject inappropriate submissions.
- Request additional information.
- Shortlist wishes.
- Select a wish.
- Record fulfillment progress.
- Mark completed wishes.
- Publish approved stories.

### Selection process

The AILU team may select wishes based on:

- Feasibility.
- Available resources.
- Meaningfulness.
- Safety.
- Community impact.
- Available event partners.

Random selection may be used only among suitable, reviewed wishes when appropriate.

Do not create an automated public lottery or promise random selection.

### Fulfillment stages

Display:

- Submitted.
- Under review.
- Shortlisted.
- Selected.
- Planning.
- Fulfilled.

A completed wish may be displayed only after actual fulfillment and appropriate permission.

### Public stories

Create an optional:

"Dreams AILU Made Possible"

This section may contain verified stories.

Each story should include:

- Approved story title.
- General description.
- What AILU helped with.
- Images only with appropriate permission.
- A thank-you message, if provided.

Never expose the identity of a child or vulnerable person without appropriate consent.

---

# 14. INTRODUCING THE AILU AI CHARACTER

AILU should eventually have its own recognizable digital character.

The character should become the friendly face of the brand.

It should not be a generic chatbot.

It should feel like a welcoming guide inside the AILU website.

### Character concept

Create a friendly, expressive, celebration-inspired character based on the AILU hand-and-heart identity.

Possible design direction:

- Rounded, friendly silhouette.
- Signature AILU yellow.
- Black and warm-white details.
- Soft animated movements.
- Expressive eyes, if appropriate.
- Simple, recognizable character shape.

Do not modify the existing AILU logo into an unrelated character.

Keep the character visually consistent with the actual brand.

### AILU character introduction

Display:

"Meet AILU"

"Your little guide to celebrations, dreams, and unforgettable moments."

The character may:

- Welcome visitors.
- Explain event categories.
- Help visitors find suitable event services.
- Explain the rewards system.
- Guide users through registration.
- Explain referral opportunities.
- Help users understand application forms.
- Help visitors submit a dream.
- Answer general questions about AILU.

### AI chat interface

Create an interactive chat interface.

Example:

AILU:

"Hey! Welcome to AILU. What brings you here today?"

Suggested options:

- I want to plan an event.
- I want to explore offers.
- I want to join AILU.
- I want to become a sales partner.
- I want to share a dream.
- I want to know about AILU.

The AI should guide visitors to the correct page.

### AI behavior

The assistant must:

- Provide accurate information about AILU.
- Use approved company information.
- Avoid inventing event prices.
- Avoid inventing reward policies.
- Avoid promising employment.
- Avoid promising commission.
- Avoid promising wish fulfillment.
- Avoid confirming event availability without backend verification.

If the AI cannot answer:

"Let me connect you with the AILU team."

### Future development

Initially, create the character and chat UI with predefined responses.

Do not require an expensive AI integration to launch the first version.

Later, connect the character to an AI API and an approved AILU knowledge base.

The architecture should support this future upgrade.

---

# 15. AILU CHARACTER ANIMATIONS

The AILU character should appear naturally throughout the website.

Possible interactions:

- Wave when the website opens.
- Welcome the visitor.
- Point toward the event section.
- Celebrate after a successful booking enquiry.
- Introduce the rewards system.
- Explain how referrals work.
- Guide users through forms.
- Introduce the Dreams and Wishes section.

Animations must remain subtle.

Do not make the character block the user's access to important information.

The website must remain usable even when character animations are disabled.

---

# 16. USER DASHBOARD

Create a dedicated personal dashboard.

After login, display:

"Welcome to your AILU World."

Dashboard sections:

### Overview

- User name.
- AILU user ID.
- Reward points.
- Event enquiries.
- Referral summary.
- Recent activity.

### My Events

- Event enquiries.
- Quotations.
- Confirmed bookings.
- Completed events.
- Booking details.

### My Rewards

- Available points.
- Earned points.
- Redeemed points.
- Reward catalogue.
- Redemption history.

### My Referrals

- Referral ID.
- Referral link.
- Referred customers.
- Qualified referrals.
- Reward history.

### My Opportunities

For applicants and collaborators:

- Application ID.
- Submitted application.
- Application status.
- Available approved opportunities.

### My Dreams

- Submitted dreams.
- Private submission status.
- Selected wish status.
- Approved public story, if applicable.

### Account Settings

- Profile.
- Phone verification.
- Email.
- Privacy settings.
- Notification preferences.
- Account deletion request.

Use clear navigation.

The dashboard should be functional, not just a visual mockup.

---

# 17. ADMIN DASHBOARD

Create a secure administration system.

Only authorized AILU staff should access it.

The admin dashboard should manage the actual business operations.

### Admin overview

Display:

- Total event enquiries.
- Confirmed bookings.
- Upcoming events.
- New applications.
- Sales partner referrals.
- Reward points issued.
- Pending reward approvals.
- Dream submissions.
- Selected wishes.
- Website enquiries.

### Event management

Admin can:

- Create events.
- Edit event categories.
- Update event information.
- Manage event enquiries.
- Prepare quotations.
- Update booking status.
- Record payment status.
- Manage event availability.

### Rewards management

Admin can:

- Configure earning rules.
- Configure redemption rules.
- Create reward catalogue items.
- Set campaign limits.
- Approve point awards.
- Approve redemptions.
- Review point history.
- Reverse incorrect transactions.

### Referral management

Admin can:

- View referrals.
- Verify clients.
- Assign sales partners.
- Approve commissions.
- Reject invalid referrals.
- Record payments.

### Opportunity management

Admin can:

- View applications.
- Search applicants.
- Filter by role.
- Update application status.
- Create opportunities.
- Assign collaborators.
- Add internal notes.

### Dreams management

Admin can:

- Review dream submissions.
- Moderate content.
- Shortlist wishes.
- Approve selected wishes.
- Record progress.
- Mark fulfilled.
- Manage public story permissions.

### Content management

Admin can manage:

- Homepage banners.
- Event categories.
- Offers.
- Rewards.
- FAQ.
- Company information.
- Approved stories.
- Website announcements.

All sensitive operations must be protected by server-side authorization.

---

# 18. 3D INTERACTION DESIGN

The website should have a distinctive 3D experience.

Use 3D where it creates meaningful value.

### Main experience

- Cinematic hand symbol.
- Floating AILU logo.
- Animated event-inspired elements.
- Subtle depth.
- Interactive character.
- Smooth transitions.

### Event cards

Create premium event cards with subtle depth.

When a visitor hovers over a card:

- The card may slightly tilt.
- The image may move subtly.
- A yellow highlight may appear.
- The card may reveal additional information.

Do not use exaggerated rotation.

### Navigation

Use smooth page transitions.

Do not make navigation excessively slow.

### Rewards section

Use subtle animated points.

Example:

A small point animation may appear when the dashboard displays verified earned points.

Do not animate fake transactions.

### Dreams section

Use a softer, more emotional visual design.

Avoid aggressive gamification.

### 3D technical requirements

Use React Three Fiber and Three.js for actual 3D scenes.

Use Framer Motion for interface animations.

Avoid rendering the entire website inside a single 3D canvas.

Use normal HTML and CSS for:

- Navigation.
- Forms.
- Text.
- Buttons.
- Dashboard.
- Accessibility.

3D should enhance the website, not replace its functionality.

---

# 19. MOBILE EXPERIENCE

The website must be designed mobile-first.

Most users may access AILU through WhatsApp, Instagram, or shared event links.

The mobile experience must be excellent.

Requirements:

- Responsive layout.
- Fast loading.
- Simple navigation.
- Large buttons.
- Easy login.
- Easy booking enquiry.
- Readable event cards.
- Lightweight animations.
- Accessible forms.
- No horizontal scrolling.
- No excessive 3D effects.

The opening animation must adapt to mobile devices.

If the device is slow, use a lightweight 2D or CSS-based animation.

Do not require a powerful device to access AILU.

---

# 20. FINANCIAL AND BUSINESS REALITY

AILU is a growing event company.

The website must be designed around realistic business operations.

Do not build a rewards system that creates unnecessary financial liabilities.

### Launch priorities

First implement:

1. Website and brand introduction.
2. Event discovery.
3. Event enquiries.
4. Login.
5. User dashboard.
6. Opportunities.
7. Referral tracking.
8. Basic reward points.
9. Dreams and wishes.
10. Admin management.

### Rewards policy

The rewards system must support configurable rules.

AILU should decide actual reward values before activating them.

Do not invent:

- Guaranteed cashback.
- Guaranteed commission.
- Guaranteed monetary value of points.
- Guaranteed employment.
- Guaranteed event discounts.
- Guaranteed dream fulfillment.

Use clear terms.

### Reward limits

Support:

- Maximum reward budget.
- Point expiry.
- Minimum redemption.
- Maximum redemption.
- Event-specific rewards.
- Manual approval.

### Operational transparency

Display accurate status information.

Do not display fake:

- Booking counts.
- Customer reviews.
- Rewards earned.
- Referral earnings.
- Completed wishes.
- Event availability.

---

# 21. SECURITY AND PRIVACY

Implement security from the beginning.

### Authentication

Use secure authentication.

### Authorization

Use role-based access control.

Roles:

- Visitor.
- Customer.
- Collaborator.
- Sales partner.
- Admin.

A user may have more than one approved role.

### Data protection

Protect:

- Phone numbers.
- Email addresses.
- Applications.
- Referral information.
- Dream submissions.
- Booking information.
- Payment information.

### Firestore

Implement appropriate Firestore security rules.

Users should only access their own private records.

Admins should have access only through authorized roles.

Do not rely on frontend visibility controls for security.

### Input validation

Validate all forms on the frontend and backend.

Protect against:

- Duplicate submissions.
- Invalid phone numbers.
- Invalid referral IDs.
- Unauthorized point modifications.
- Unauthorized application changes.
- Fake booking status changes.

### Children and dream submissions

Provide an age-appropriate experience.

For children:

- Do not request unnecessary personal information.
- Do not publicly display submissions by default.
- Provide appropriate parent or guardian consent.
- Review content before publication.
- Do not allow unrestricted direct messaging with the AI.
- Do not collect precise home or school information.
- Do not encourage children to meet unknown people.

The AI character must not request sensitive information.

---

# 22. WEBSITE PAGES

Create the following pages.

### Public pages

1. Home.
2. Events.
3. Event details.
4. Offers and rewards.
5. About AILU.
6. Opportunities.
7. Work with AILU.
8. Sales partner program.
9. Dreams and wishes.
10. Selected AILU stories.
11. Contact.
12. Privacy policy.
13. Terms and conditions.
14. Rewards policy.
15. Referral policy.

### Authentication pages

1. Login.
2. Phone verification.
3. Registration.
4. Profile setup.

### Customer dashboard

1. Overview.
2. My events.
3. My rewards.
4. My referrals.
5. My dreams.
6. Settings.

### Partner dashboard

1. Overview.
2. Client referrals.
3. Referral status.
4. Commission history.
5. Profile.

### Applicant dashboard

1. My applications.
2. Application status.
3. Approved opportunities.
4. Profile.

### Admin pages

1. Admin overview.
2. Event management.
3. Booking management.
4. User management.
5. Reward management.
6. Referral management.
7. Sales partner management.
8. Application management.
9. Dream management.
10. Content management.
11. Reports.
12. Settings.

---

# 23. VISUAL QUALITY

The final website must look premium and professionally designed.

Avoid:

- Generic AI website layouts.
- Excessive gradients.
- Random colors.
- Unrelated 3D models.
- Overloaded dashboards.
- Excessive animations.
- Fake testimonials.
- Fake event photos.
- Unverified pricing.
- Unnecessary popups.

Use high-quality event imagery.

Use the actual AILU logo.

Use realistic event concepts.

Maintain consistent spacing.

Create clear visual hierarchy.

Every page must feel like part of the same AILU experience.

---

# 24. PERFORMANCE

The website must be optimized for real users.

Requirements:

- Lazy-load 3D scenes.
- Compress images.
- Use responsive images.
- Optimize fonts.
- Avoid unnecessary dependencies.
- Avoid excessive animation.
- Minimize loading time.
- Use caching where appropriate.
- Support mobile devices.
- Provide accessible fallback experiences.

Do not allow the 3D introduction to prevent users from accessing the website.

---

# 25. IMPLEMENTATION PHASES

Do not attempt to implement every feature simultaneously.

Build the project in phases.

## Phase 1: AILU website and event enquiries

Build:

- Branding.
- Opening animation.
- Homepage.
- Event categories.
- Event details.
- Contact.
- Event enquiry form.
- Responsive layout.

Goal:

Create the main AILU experience.

## Phase 2: Authentication and user dashboard

Build:

- Phone authentication.
- User registration.
- User IDs.
- Profile.
- Event enquiry history.
- Dashboard.

Goal:

Allow users to manage their event enquiries.

## Phase 3: Opportunities and sales partners

Build:

- Team applications.
- Sales partner registration.
- Referral IDs.
- Client referrals.
- Application tracking.
- Admin management.

Goal:

Create a structured collaboration system.

## Phase 4: Rewards and loyalty

Build:

- Points ledger.
- Reward policies.
- Booking rewards.
- Referral rewards.
- Redemption catalogue.
- Admin approvals.

Goal:

Create a sustainable loyalty system.

## Phase 5: Dreams and wishes

Build:

- Dream submission.
- Privacy controls.
- Moderation.
- Selection process.
- Fulfillment tracking.
- Approved public stories.

Goal:

Introduce the emotional community side of AILU.

## Phase 6: AILU AI character

Build:

- Character design.
- Welcome animation.
- Chat interface.
- Event discovery assistance.
- Rewards assistance.
- Opportunity assistance.
- Dream submission guidance.

Goal:

Introduce AILU as an interactive brand character.

---

# 26. REQUIRED DATABASE STRUCTURE

Create a structured backend.

Suggested collections:

users

events

eventEnquiries

bookings

payments

rewardTransactions

rewardCatalog

referrals

salesPartners

applications

opportunities

dreamSubmissions

dreamSelections

dreamFulfillment

notifications

adminSettings

auditLogs

### Important data rules

Every user must have a unique ID.

Every booking enquiry must have a unique ID.

Every referral must have a unique ID.

Every application must have a unique ID.

Every reward transaction must have a unique transaction ID.

Reward balances must be derived from verified transactions.

Do not allow users to directly update their point balances.

Do not allow users to modify their own booking status.

Do not allow users to approve their own commissions.

Use backend transactions for important financial and reward operations.

Maintain an audit trail for administrative changes.

---

# 27. FINAL DESIGN DIRECTION

The final experience should combine:

The emotional identity of a celebration company.

The premium feeling of a modern 3D website.

The usability of a practical event booking platform.

The engagement of a loyalty system.

The opportunities of a community platform.

The personality of a future AI character.

AILU should feel like a brand that creates celebrations, connects people, rewards meaningful participation, and listens to dreams.

The website must not feel like a generic event marketplace.

It should feel like entering the AILU universe.

### Final homepage experience

When a visitor opens the website:

1. The screen starts with the AILU hand symbol.
2. The hand symbol appears through a cinematic animation.
3. AILU letters appear one by one.
4. The welcome message appears.
5. The visitor enters the main website.
6. The AILU character introduces the available experiences.
7. The visitor chooses between exploring events, joining AILU, discovering rewards, or sharing a dream.
8. The visitor can browse freely.
9. Login is requested only when needed for a personalized action.

### Final objective

Create a complete, visually stunning, responsive, interactive, and financially sustainable AILU website.

The website must preserve the existing AILU branding while introducing a new digital experience.

Do not build only a static frontend mockup.

Implement working navigation, authentication, forms, database structure, user dashboards, admin functionality, validation, and backend-connected features.

If a feature requires future business decisions, create an admin-configurable system and clearly identify the feature as inactive until the company approves its rules.

Start by inspecting the existing website and available assets.

Then create the design system, opening animation, homepage, and core event enquiry functionality.

Build the remaining features in phases without compromising the quality of the main website.

The final result should be:

**AILU: Creating Moments. Delivering Smiles.**

A celebration brand where people can explore events, become part of the team, earn meaningful rewards, connect with opportunities, and share their dreams.
