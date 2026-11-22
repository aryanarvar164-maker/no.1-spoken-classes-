import { z } from "zod";

const phoneRe = /^\+?[0-9][0-9\s-]{8,16}[0-9]$/;

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80, "Name is too long."),
  phone: z
    .string()
    .trim()
    .regex(phoneRe, "Please enter a valid phone / WhatsApp number."),
  email: z
    .string()
    .trim()
    .max(120)
    .email("Please enter a valid email, or leave it blank.")
    .optional()
    .or(z.literal("")),
  batch: z.string().trim().max(120).optional().or(z.literal("")),
  preferredTime: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(1000, "Please keep your message under 1000 characters.").optional().or(z.literal("")),
  // Spam traps — must stay empty / be a plausible fill time.
  company: z.string().max(0).optional().or(z.literal("")),
  startedAt: z.number().int().optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export type EnquiryResponse =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
