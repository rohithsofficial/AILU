import { z } from "zod";
import { EVENT_CATEGORIES } from "./events";
export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid Indian mobile number"),
  email: z.union([z.literal(""), z.string().trim().email().max(120)]).optional(),
  category: z.enum(EVENT_CATEGORIES.map((c) => c.slug) as [string, ...string[]]),
  eventDate: z.string().trim().max(20).optional(),
  location: z.string().trim().min(2).max(120),
  guests: z.coerce.number().int().min(1).max(100000).optional(),
  budget: z.string().trim().max(60).optional(),
  services: z.string().trim().max(300).optional(),
  details: z.string().trim().max(1500).optional(),
  website: z.string().max(0).optional(), // honeypot
});
export type EnquiryInput = z.infer<typeof enquirySchema>;
