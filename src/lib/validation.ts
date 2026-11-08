// Rules for the public forms (enquiry, team application, partner, private dream). The API routes in
// src/app/api/* check every submission with these schemas on the server, whatever the browser sent.
import { z } from "zod";
import { todayInIndia } from "@/lib/dates";
import { LANDING_TEST } from "@/lib/experiments";
import { EVENT_CATEGORIES } from "./events";
import { ROLES } from "./roles";
import { containsSensitiveDreamPattern, DREAM_CATEGORIES } from "./dreams";

const PHONE = /^(\+91[\s-]?)?[6-9](?:[\s-]?\d){9}$/;
export const indianPhoneSchema = z.string().trim().regex(PHONE, "Enter a valid Indian mobile number");
const phone = indianPhoneSchema;
const optionalEmail = z.union([z.literal(""), z.string().trim().email().max(120)]).optional();
const optionalUrl = z.union([z.literal(""), z.string().trim().url().max(300)]).optional();
const optionalText = (max: number) => z.string().trim().max(max).optional();

// "98765 43210", "+91 98765 43210" and "9876543210" all become "+919876543210"
export const normalizePhone = (p: string) => `+91${p.replace(/\D/g, "").slice(-10)}`;
export const isPartnerReferralId = (value: string) => /^AILU-SP-\d{6}$/i.test(value.trim());
// todayInIndia lives in lib/dates.ts; it is re-exported here because forms and tests import it from this file.
export { todayInIndia } from "@/lib/dates";

export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone,
  email: optionalEmail,
  category: z.enum(EVENT_CATEGORIES.map((c) => c.slug) as [string, ...string[]]),
  eventDate: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid event date").refine((v) => {
    const date = new Date(`${v}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === v;
  }, "Enter a valid event date").refine((v) => v >= todayInIndia(), "Choose today or a future date")]).optional(),
  location: z.string().trim().min(2).max(120),
  // An empty "Expected guests" box arrives as "". It means "not given", so it must not become 0 and fail min(1).
  guests: z.preprocess((value) => (value === "" || value === null ? undefined : value), z.coerce.number().int().min(1).max(100000).optional()),
  budget: optionalText(60),
  services: optionalText(300),
  details: optionalText(1500),
  referralId: z.union([z.literal(""), z.string().trim().regex(/^AILU-SP-\d{6}$/i, "Check the partner ID")]).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Please agree before sending your enquiry" }) }),
  website: z.string().max(0).optional(), // honeypot
  landing: z.enum(LANDING_TEST.variants).optional(), // A/B test version, only sent by the landing page
});
export type EnquiryInput = z.infer<typeof enquirySchema>;

export const applicationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone,
  email: optionalEmail,
  city: z.string().trim().min(2).max(80),
  role: z.enum(ROLES),
  skills: z.string().trim().min(3).max(800),
  experience: optionalText(1000),
  portfolioUrl: optionalUrl,
  availability: optionalText(300),
  eventCategories: optionalText(300),
  beginner: z.boolean().optional(),
  notes: optionalText(1000),
  consent: z.literal(true, { errorMap: () => ({ message: "Please tick this box so we can contact you" }) }),
  website: z.string().max(0).optional(),
});

export const partnerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone,
  email: optionalEmail,
  city: z.string().trim().min(2).max(80),
  clientCategories: optionalText(300),
  experience: optionalText(1000),
  referralSource: optionalText(300),
  consent: z.literal(true, { errorMap: () => ({ message: "Please tick this box so we can contact you" }) }),
  website: z.string().max(0).optional(),
});

const optionalDreamText = (max: number) => z.union([
  z.literal(""),
  z.string().trim().max(max).refine((value) => !containsSensitiveDreamPattern(value), "Please remove identity, card or financial details and try again."),
]).optional();
const requiredDreamText = (max: number) => z.string().trim().min(1, "Tell us a little about the dream.").max(max)
  .refine((value) => !containsSensitiveDreamPattern(value), "Please remove identity, card or financial details and try again.");
const optionalDreamPhone = z.union([z.literal(""), indianPhoneSchema]).optional();
const optionalDreamEmail = z.union([z.literal(""), z.string().trim().email().max(120)]).optional();
const dreamName = z.string().trim().max(80).refine((value) => !containsSensitiveDreamPattern(value), "Please remove identity or financial details.");

export const dreamSubmissionSchema = z.object({
  isMinor: z.boolean(),
  displayName: dreamName.optional(),
  guardianName: dreamName.optional(),
  guardianPhone: optionalDreamPhone,
  guardianConsent: z.boolean().optional(),
  contactPhone: optionalDreamPhone,
  contactEmail: optionalDreamEmail,
  city: z.string().trim().min(2).max(80).refine((value) => !containsSensitiveDreamPattern(value), "Please remove identity or financial details."),
  category: z.enum(DREAM_CATEGORIES),
  dream: requiredDreamText(2000),
  whyItMatters: optionalDreamText(1500),
  helpNeeded: optionalDreamText(1500),
  consentToContact: z.literal(true, { errorMap: () => ({ message: "Please agree before sending your dream." }) }),
  website: z.string().max(0).optional(),
}).strict().superRefine((value, context) => {
  if (value.isMinor) {
    if (!value.guardianName || value.guardianName.trim().length < 2) context.addIssue({ code: z.ZodIssueCode.custom, path: ["guardianName"], message: "Enter the parent or guardian's name." });
    if (!value.guardianPhone || !value.guardianPhone.trim()) context.addIssue({ code: z.ZodIssueCode.custom, path: ["guardianPhone"], message: "Enter the parent or guardian's mobile number." });
    if (value.guardianConsent !== true) context.addIssue({ code: z.ZodIssueCode.custom, path: ["guardianConsent"], message: "A parent or guardian must agree before submitting." });
    if (value.contactPhone || value.contactEmail) context.addIssue({ code: z.ZodIssueCode.custom, path: ["contactPhone"], message: "For a dreamer under 18, only the guardian's contact details may be sent." });
  } else {
    if (!value.displayName || value.displayName.trim().length < 2) context.addIssue({ code: z.ZodIssueCode.custom, path: ["displayName"], message: "Enter your name or nickname." });
    if (!value.contactPhone?.trim() && !value.contactEmail?.trim()) context.addIssue({ code: z.ZodIssueCode.custom, path: ["contactPhone"], message: "Enter a phone number or email so AILU can contact you privately." });
    if (value.guardianName || value.guardianPhone || value.guardianConsent) context.addIssue({ code: z.ZodIssueCode.custom, path: ["guardianName"], message: "Guardian details are only used when the dreamer is under 18." });
  }
});
export type DreamSubmissionInput = z.infer<typeof dreamSubmissionSchema>;
