/**
 * ─────────────────────────────────────────────────────────────
 *  DEFAULT SITE CONTENT
 * ─────────────────────────────────────────────────────────────
 *  The owner normally edits everything from the private editor at
 *  /owner/<OWNER_SECRET> — no code changes needed. Saved edits are
 *  stored in Cloudinary and override these defaults.
 *
 *  This file is the starting content (and the fallback if nothing has
 *  been saved yet, or storage is unreachable).
 *
 *  • Text in [square brackets] is a PLACEHOLDER and shows with a dashed
 *    outline on the page until it is replaced.
 *  • Image / video `src`: a Cloudinary public ID ("no01/tutor/portrait"),
 *    a /public path ("/images/tutor.jpg"), or null for a placeholder tile.
 *  • Never publish achievements, reviews, credentials or schedules the
 *    owner has not confirmed. Student names/photos need consent.
 */

import type { SiteContent } from "@/lib/content-schema";

export type { SiteContent, ImageAsset, BatchStatus } from "@/lib/content-schema";

/** Public URL of the site (from env, not editable in the owner editor). */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const defaultContent: SiteContent = {
  showContentFlags: true,

  name: "No. 01 Spoken English Classes",
  shortName: "No. 01",
  tagline: "Speak English with confidence.",
  // Hindi line shown under the hero headline and in the footer.
  taglineHi: "अंग्रेज़ी बोलो — बेझिझक, हर दिन।",
  description:
    "Structured spoken English coaching for students, job-seekers and working professionals who understand English but hesitate to speak it.",
  // Small badge above the hero headline. Set to "" to hide it.
  admissionBadge: "Admissions open · [Month]",
  location: "[Area, City]",
  logo: { src: null, alt: "No. 01 Spoken English Classes logo" },

  contact: {
    phone: "[+91 phone number]",
    whatsapp: "[+91 WhatsApp number]",
    // digits only, with country code, for the wa.me link — e.g. "919876543210"
    whatsappDigits: "",
    email: "[owner@email.com]",
    address: "[Full address of the institute]",
    mapUrl: "", // a Google Maps share link, optional
    hours: "[Office hours, e.g. Mon–Sat]",
    instagram: "https://instagram.com/no.01_spoken_english_classes",
  },

  tutor: {
    name: "[Tutor name]",
    role: "Founder & lead trainer",
    experience: "[X years of teaching]",
    intro:
      "[Two or three sentences in the tutor's own voice — who they are, why they started No. 01, and who they teach.]",
    philosophy:
      "[The tutor's teaching philosophy in one line, e.g. a belief about how people learn to speak.]",
    portrait: {
      src: "no01/tutor/portrait",
      alt: "Portrait of the tutor of No. 01 Spoken English Classes",
      width: 1200,
      height: 1500,
    },
  },

  // Counters animate only when `value` is a real number.
  stats: [
    { label: "Students coached", value: 10, suffix: "K+" },
    { label: "Years of teaching", value: 5, suffix: "+" },
    { label: "Students per batch", value: 25, suffix: "" },
    { label: "Batches running now", value: 5, suffix: "" },
  ],

  video: {
    title: "Inside a No. 01 class",
    caption: "Coaching Tour: spoken English class at No.01.",
    // A Cloudinary video public ID, e.g. "no01/video/coaching-film" (recommended),
    // or an MP4 URL. If poster.src is null, a frame from the video is used.
    src: "no01/video/coahing-film",
    poster: { src: null, alt: "A spoken English class in session" },
  },

  about: {
    heading: "Fluency is a habit. We build it in the room.",
    body: "[A short paragraph about the classes: the environment, batch size, and what a typical session looks like.]",
    pillars: [
      {
        title: "Speak from day one",
        text: "Every session is built around speaking time, not lectures.",
        draft: true,
      },
      {
        title: "Fix the fundamentals",
        text: "Grammar, pronunciation and vocabulary — taught through use, not memorisation.",
        draft: true,
      },
      {
        title: "Real-life practice",
        text: "Interviews, presentations and everyday conversations, rehearsed until they feel natural.",
        draft: true,
      },
      {
        title: "Feedback you can use",
        text: "Clear, personal corrections so every class moves you forward.",
        draft: true,
      },
    ],
    expectations: [
      "[What students can expect — point 1]",
      "[What students can expect — point 2]",
      "[What students can expect — point 3]",
    ],
  },

  achievements: [
    {
      student: "[Student name — with permission]",
      achievement: "[Milestone, e.g. cleared an interview / exam score]",
      year: "[Year]",
      caption: "[Optional one-line story]",
      image: { src: "no01/achivements/student-1", alt: "Student achievement" },
    },
    {
      student: "[Student name — with permission]",
      achievement: "[Milestone]",
      year: "[Year]",
      image: { src: "no01/achivements/student-2", alt: "Student achievement" },
    },
    {
      student: "[Student name — with permission]",
      achievement: "[Milestone]",
      year: "[Year]",
      image: { src: "no01/achivements/student-3", alt: "Student achievement" },
    },
  ],

  testimonials: [
    { quote: "[Paste a real review excerpt here.]", name: "[Reviewer name]", context: "[Batch / year]" },
    { quote: "[Paste a real review excerpt here.]", name: "[Reviewer name]", context: "[Batch / year]" },
  ],

  batches: [
    {
      id: "batch-1",
      title: "[Batch name]",
      level: "[Level]",
      schedule: "[Days · time]",
      startDate: "[Start date]",
      mode: "[Offline / Online]",
      status: "open",
      seats: "[Seats left]",
    },
    {
      id: "batch-2",
      title: "[Batch name]",
      level: "[Level]",
      schedule: "[Days · time]",
      startDate: "[Start date]",
      mode: "[Offline / Online]",
      status: "few-seats",
      seats: "[Seats left]",
    },
    {
      id: "batch-3",
      title: "[Batch name]",
      level: "[Level]",
      schedule: "[Days · time]",
      startDate: "[Start date]",
      mode: "[Offline / Online]",
      status: "starting-soon",
    },
  ],

  // Shown in display order. Use real classroom photos (with consent).
  gallery: Array.from({ length: 8 }, (_, i) => ({
    src: "no01/gallery/class-" + (i + 1),
    alt: `Coaching moment ${i + 1}`,
    caption: "[Caption]",
  })),

  faqs: [
    { q: "[Question students often ask]", a: "[Answer]" },
    { q: "[Question students often ask]", a: "[Answer]" },
    { q: "[Question students often ask]", a: "[Answer]" },
  ],

  preferredTimes: ["Morning", "Afternoon", "Evening", "Weekend", "Flexible"],
};

export const nav = [
  { href: "#about", label: "About" },
  { href: "#videos", label: "Videos" },
  { href: "#achievements", label: "Achievements" },
  { href: "#batches", label: "Batches" },
  { href: "#gallery", label: "Gallery" },
  { href: "#enquiry", label: "Enquiry" },
] as const;

export const isPlaceholder = (v: string | null | undefined) =>
  !v || /^\s*\[.*\]\s*$/.test(v);
