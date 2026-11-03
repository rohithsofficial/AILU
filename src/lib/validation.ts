import { z } from "zod";
import { EVENT_CATEGORIES } from "./events";
import { ROLES } from "./roles";

const PHONE = /^(\+91[\s-]?)?[6-9]\d{9}$/;
const phone = z.string().trim().regex(PHONE, "Enter a valid Indian mobile number");
const optionalEmail = z.union([z.literal(""), z.string().trim().email().max(120)]).optional();
const optionalUrl = z.union([z.literal(""), z.string().trim().url().max(300)]).optional();
const optionalText = (max: number) => z.string().trim().max(max).optional();

// "98765 43210", "+91 98765 43210" and "9876543210" all become "+919876543210"
export const normalizePhone = (p: string) => `+91${p.replace(/\D/g, "").slice(-10)}`;

export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone,
  email: optionalEmail,
  category: z.enum(EVENT_CATEGORIES.map((c) => c.slug) as [string, ...string[]]),
  eventDate: optionalText(20),
  location: z.string().trim().min(2).max(120),
  guests: z.coerce.number().int().min(1).max(100000).optional(),
  budget: optionalText(60),
  services: optionalText(300),
  details: optionalText(1500),
  referralId: z.union([z.literal(""), z.string().trim().regex(/^AILU-SP-\d{6}$/i, "Check the partner ID")]).optional(),
  website: z.string().max(0).optional(), // honeypot
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
