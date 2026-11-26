import { z } from "zod";

/**
 * The shape of everything the owner can edit. Every save from the owner editor
 * is validated against this on the server before it goes live, so a bad save
 * can never break the public page.
 */

const line = z.string().max(300);
const text = z.string().max(3000);
const mediaSrc = z
  .string()
  .max(400)
  .refine((v) => !/^\s*javascript:/i.test(v), "Invalid media source")
  .nullable();

export const imageSchema = z.object({
  src: mediaSrc,
  alt: z.string().max(200),
  caption: line.optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const batchStatuses = ["open", "few-seats", "starting-soon", "full"] as const;

export const contentSchema = z.object({
  showContentFlags: z.boolean(),

  name: line,
  shortName: line,
  tagline: line,
  taglineHi: line,
  description: text,
  admissionBadge: line,
  location: line,
  logo: imageSchema,

  contact: z.object({
    phone: line,
    whatsapp: line,
    whatsappDigits: z.string().regex(/^\d{0,15}$/, "WhatsApp link number must be digits only, with country code"),
    email: line,
    address: text,
    mapUrl: z.string().max(600).refine((v) => v === "" || /^https:\/\//.test(v), "Map link must start with https://"),
    hours: line,
    instagram: z.string().max(300).refine((v) => v === "" || /^https:\/\//.test(v), "Instagram link must start with https://"),
  }),

  tutor: z.object({
    name: line,
    role: line,
    experience: line,
    intro: text,
    philosophy: text,
    portrait: imageSchema,
  }),

  stats: z
    .array(z.object({ label: line, value: z.number().finite().min(0).max(10_000_000).nullable(), suffix: z.string().max(10).optional() }))
    .max(6),

  video: z.object({
    title: line,
    caption: text,
    src: mediaSrc,
    poster: imageSchema,
  }),

  about: z.object({
    heading: line,
    body: text,
    pillars: z.array(z.object({ title: line, text: text, draft: z.boolean().optional() })).max(8),
    expectations: z.array(line).max(10),
  }),

  achievements: z
    .array(
      z.object({
        student: line,
        achievement: line,
        year: line,
        caption: line.optional(),
        image: imageSchema.optional(),
      }),
    )
    .max(30),

  testimonials: z.array(z.object({ quote: text, name: line, context: line.optional() })).max(20),

  batches: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]{1,40}$/),
        title: line,
        level: line,
        schedule: line,
        startDate: line,
        mode: line,
        status: z.enum(batchStatuses),
        seats: line.optional(),
        fee: line.optional(),
      }),
    )
    .max(20),

  gallery: z.array(imageSchema).max(40),

  faqs: z.array(z.object({ q: line, a: text })).max(20),

  preferredTimes: z.array(z.string().max(40)).max(10),
});

export type SiteContent = z.infer<typeof contentSchema>;
export type ImageAsset = z.infer<typeof imageSchema>;
export type BatchStatus = (typeof batchStatuses)[number];
