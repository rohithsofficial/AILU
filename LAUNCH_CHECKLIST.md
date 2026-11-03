# AILU public website launch checklist

Complete these checks before opening the public site. Keep `COMING_SOON=true` until all production checks are complete.

## Vercel project and environment

- [ ] Connect the intended AILU GitHub repository and production branch to the Vercel project.
- [ ] Set production `DATABASE_URL` to the Neon pooled connection string and `DIRECT_URL` to the Neon direct connection string. Store these only in Vercel/local secret storage; never in Git.
- [ ] Set `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `ADMIN_BOOTSTRAP_EMAIL` for staff sign-in and first OWNER bootstrap.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the final canonical HTTPS domain, with no trailing path.
- [ ] Set a strong server-only `RATE_LIMIT_SALT`; do not reuse `PREVIEW_SECRET` or expose it publicly.
- [ ] Set `PREVIEW_SECRET` to a long random value and retain `COMING_SOON=true`.
- [ ] Set `NEXT_PUBLIC_WHATSAPP_NUMBER` only if AILU needs to override the phone configured in `src/lib/brand.ts`.
- [ ] Confirm Preview and Development environments use appropriate non-production secrets and database branches.
- [ ] Review `npm audit --omit=dev` and clear production advisories before opening the site. As of this launch pass, it reports 9 production vulnerabilities (including a critical Next.js advisory); the suggested automatic fix crosses major versions and needs a separate compatibility review and full CRM regression before approval.

## Neon and schema

- [ ] Select and back up the correct Neon production branch before deployment.
- [ ] Inspect `prisma/schema.prisma` and `prisma/migrations/`; confirm the migration status before deploy.
- [ ] Deploy the additive form-rate-limit migration from the release build with `npx prisma migrate deploy`. It is named `20261103111506_website_rate_limit`.
- [ ] Confirm `npx prisma migrate status` reports the production database up to date. Never run `migrate reset` or drop data.

## Domain, OAuth, and staff access

- [ ] Add the final domain to Vercel and configure DNS records at the domain provider.
- [ ] Confirm HTTPS works and `NEXT_PUBLIC_SITE_URL` matches the canonical domain exactly.
- [ ] Add `https://<production-domain>/api/auth/callback/google` to the Google OAuth authorized redirect URIs.
- [ ] Test the first OWNER sign-in with the configured bootstrap email, then add the right staff accounts and roles.
- [ ] Verify OWNER, MANAGER, STAFF, and ACCOUNTS access boundaries, especially CRM finance and commission visibility.

## Website and form checks

- [ ] Test a real event enquiry, including the required privacy consent and a future/today event date.
- [ ] Test category and partner-ID prefill with `?category=<category-slug>&ref=<valid-partner-id>`; confirm invalid IDs are ignored quietly.
- [ ] Confirm a sixth event enquiry from one IP in an hour receives HTTP 429 and a `Retry-After` header; confirm the per-phone limit too.
- [ ] Test a team application and partner registration, their required consent, duplicate checks, and honeypot behavior.
- [ ] Test missing database configuration returns the existing friendly HTTP 503 response.
- [ ] Confirm no payment is taken, no dream submission form is open, and Donation Box stays off.
- [ ] Test the WhatsApp message and its prefilled text on mobile and desktop.
- [ ] Check all public pages, the 404 page, and friendly error/retry pages.
- [ ] Check keyboard-only navigation, focus indicators, mobile navigation Escape behavior, screen-reader labels, and forms at 360 px width.
- [ ] Check no horizontal overflow at 360 px, tap target sizing, and reduced-motion behavior.
- [ ] Verify the intro does not hide content with JavaScript disabled; confirm the Skip intro flow, reduced-motion path, hand landing, compact logo, and 3D fallback on real devices.
- [ ] Confirm the floating WhatsApp button is absent on `/coming-soon` and `/admin` and hidden while a form/footer is in view.
- [ ] Check canonical metadata, Open Graph image, JSON-LD, robots, sitemap, and `noindex` on `/my-ailu`.

## Legal, content, and discoverability

- [ ] Have an Indian privacy lawyer review `/privacy`, `/terms`, and `/referral-policy`, including the DPDP Act and rules applicable at launch.
- [ ] Decide and document data-retention periods and the process for access, correction, and deletion requests.
- [ ] Confirm the enquiry/application/partner consent wording and whether consent evidence should be retained in the database in a future additive change.
- [ ] Supply AILU-approved About/story content. Founder/team profiles remain absent until real details are supplied.
- [ ] Add approved, real event images to `src/content/site.ts` and `public/gallery/`; use alt text and retain permission for identifiable people.
- [ ] Confirm the traditions and services list with AILU; event categories currently describe intended services but do not promise availability.
- [ ] Add official social URLs to `src/content/site.ts` only after AILU supplies them.
- [ ] Create or verify AILU's Google Business Profile if applicable and ensure its public details are accurate.
- [ ] Set up Google Search Console and submit `https://<production-domain>/sitemap.xml` after launch.

## Open the site and rollback

- [ ] Confirm the production build, deployed forms, owner sign-in, legal pages, metadata, rate limits, and WhatsApp contact work on the production domain.
- [ ] Change `COMING_SOON=false` only after the checklist is complete; redeploy and verify the public site is indexable.
- [ ] Roll back quickly by setting `COMING_SOON=true` and redeploying if a launch issue requires hiding the public site. Keep `/admin` staff access protected and verify the middleware behavior.

## Business decisions still needed

- [ ] Referral reward policy: eligible event types, amount/basis, and written partner terms.
- [ ] Customer data retention and response expectations.
- [ ] Whether loyalty points will exist (not built).
- [ ] Donation legal entity and licensed payment provider (donations remain off).
- [ ] When to switch coming-soon mode off.
