/**
 * ─────────────────────────────────────────────────────────────
 *  SITE CONTENT — edit this file to update the website.
 * ─────────────────────────────────────────────────────────────
 *  • Any text wrapped in [square brackets] is a PLACEHOLDER. It is
 *    rendered with a dashed outline so it is impossible to miss.
 *    Replace it with verified information from the owner.
 *  • Image / video `src` can be:
 *      – a Cloudinary public ID, e.g. "no01/tutor/portrait"  (recommended —
 *        run `npm run upload-media -- ./media` and paste the IDs it prints)
 *      – a file in /public, e.g. "/images/tutor.jpg"
 *    `src: null` shows a labelled placeholder tile.
 *  • Never publish achievements, reviews, credentials or schedules
 *    that the owner has not confirmed. Student names/photos need consent.
 *  • Items with `draft: true` are suggested copy awaiting approval;
 *    they show a small "Draft" chip while `showContentFlags` is true.
 *    Set `showContentFlags: false` before launch.
 */

export type ImageAsset = {
  src: string | null;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
};

export type Stat = { label: string; value: number | null; suffix?: string };

export type Achievement = {
  student: string; // name only with the student's permission
  achievement: string;
  year: string;
  caption?: string;
  image?: ImageAsset; // optional score card / certificate photo
};

export type Testimonial = { quote: string; name: string; context?: string };

export type BatchStatus = "open" | "few-seats" | "full" | "starting-soon";

export type Batch = {
  id: string;
  title: string;
  level: string;
  schedule: string;
  startDate: string;
  mode: string; // "Offline" | "Online" | "Hybrid"
  status: BatchStatus;
  seats?: string;
  fee?: string; // only if the owner wants fees public
};

export type Faq = { q: string; a: string };

export const site = {
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
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  logo: { src: null, alt: "No. 01 Spoken English Classes logo" } as ImageAsset,

  contact: {
    phone: "[+91 phone number]",
    whatsapp: "[+91 WhatsApp number]",
    // digits only, with country code, for the wa.me link — e.g. "919876543210"
    whatsappDigits: "" as string,
    email: "[owner@email.com]",
    address: "[Full address of the institute]",
    mapUrl: "" as string, // a Google Maps share link, optional
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
    } as ImageAsset,
  },

  // Counters animate only when `value` is a real number.
  stats: [
    { label: "Students coached", value: '10K+', suffix: "+" },
    { label: "Years of teaching", value: '5+', suffix: "" },
    { label: "Students per batch", value: 25, suffix: "" },
    { label: "Batches running now", value: 5, suffix: "" },
  ] as Stat[],

  video: {
    title: "Inside a No. 01 class",
    caption: "Coaching Tour: spoken English class at No.01.",
    // A Cloudinary video public ID, e.g. "no01/video/coaching-film" (recommended),
    // or an MP4 URL. If poster.src is null, a frame from the video is used.
    src: "no01/video/coahing-film",
    poster: { src: null, alt: "A spoken English class in session" } as ImageAsset,
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
  ] as Achievement[],

  testimonials: [
    { quote: "[Paste a real review excerpt here.]", name: "[Reviewer name]", context: "[Batch / year]" },
    { quote: "[Paste a real review excerpt here.]", name: "[Reviewer name]", context: "[Batch / year]" },
  ] as Testimonial[],

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
  ] as Batch[],

  // Shown in display order. Use real classroom photos (with consent).
  gallery: Array.from({ length: 8 }, (_, i) => ({
    src: "no01/gallery/class-" + (i + 1),
    alt: `Coaching moment ${i + 1}`,
    caption: "[Caption]",
  })) as ImageAsset[],

  faqs: [
    { q: "[Question students often ask]", a: "[Answer]" },
    { q: "[Question students often ask]", a: "[Answer]" },
    { q: "[Question students often ask]", a: "[Answer]" },
  ] as Faq[],

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
