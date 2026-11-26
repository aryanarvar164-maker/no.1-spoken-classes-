/**
 * Describes every editable part of the site for the owner editor.
 * To make a new field editable, add it to lib/content-schema.ts, give it a
 * default in content/site.ts, then list it here — the form builds itself.
 */

export type FieldType = "text" | "textarea" | "number" | "select" | "toggle" | "image" | "video";

export type FieldDef = {
  /** Dotted path inside the section's object, e.g. "portrait.src". "" = the item itself (string lists). */
  key: string;
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** Hindi text etc. */
  lang?: string;
};

type Base = { id: string; title: string; help?: string };

export type ObjectSection = Base & { kind: "object"; path: string; fields: FieldDef[] };
export type ListSection = Base & {
  kind: "list";
  path: string;
  singular: string;
  max: number;
  fields: FieldDef[];
  newItem: () => unknown;
  itemTitle: (item: unknown, index: number) => string;
};
export type SectionDef = ObjectSection | ListSection;

const str = (v: unknown, k: string) =>
  v && typeof v === "object" && typeof (v as Record<string, unknown>)[k] === "string" ? ((v as Record<string, string>)[k] || "") : "";

const alt = (label = "Photo description (for screen readers and Google)"): FieldDef => ({ key: "", label, type: "text" });

export const sections: SectionDef[] = [
  {
    id: "basics",
    kind: "object",
    path: "",
    title: "Basics",
    help: "The institute's name and the main lines at the top of the page.",
    fields: [
      { key: "name", label: "Institute name", type: "text" },
      { key: "shortName", label: "Short name", type: "text" },
      { key: "tagline", label: "Tagline (browser tab and Google)", type: "text" },
      { key: "taglineHi", label: "Hindi line (under the big headline and in the footer)", type: "text", lang: "hi" },
      { key: "description", label: "Introduction under the headline", type: "textarea" },
      { key: "admissionBadge", label: "Small badge above the headline", type: "text", help: "Leave empty to hide it." },
      { key: "location", label: "Area, city", type: "text" },
      {
        key: "showContentFlags",
        label: "Show “Draft” labels on the page",
        type: "toggle",
        help: "Turn this off once all the text is final.",
      },
    ],
  },
  {
    id: "contact",
    kind: "object",
    path: "contact",
    title: "Contact details",
    fields: [
      { key: "phone", label: "Phone number (as shown)", type: "text", placeholder: "+91 98765 43210" },
      { key: "whatsapp", label: "WhatsApp number (as shown)", type: "text", placeholder: "+91 98765 43210" },
      {
        key: "whatsappDigits",
        label: "WhatsApp number for the chat link",
        type: "text",
        placeholder: "919876543210",
        help: "Digits only, starting with 91. Makes the WhatsApp number clickable.",
      },
      { key: "email", label: "Email", type: "text" },
      { key: "address", label: "Full address", type: "textarea" },
      { key: "mapUrl", label: "Google Maps link", type: "text", help: "Optional. In Google Maps: Share → Copy link." },
      { key: "hours", label: "Office hours", type: "text", placeholder: "Mon–Sat, 7 AM – 8 PM" },
      { key: "instagram", label: "Instagram link", type: "text" },
    ],
  },
  {
    id: "tutor",
    kind: "object",
    path: "tutor",
    title: "Tutor",
    fields: [
      { key: "portrait.src", label: "Tutor photo", type: "image", help: "A clear, upright photo works best (portrait shape)." },
      { key: "portrait.alt", label: "Photo description", type: "text" },
      { key: "name", label: "Name", type: "text" },
      { key: "role", label: "Role", type: "text" },
      { key: "experience", label: "Experience", type: "text", placeholder: "12 years of teaching" },
      { key: "intro", label: "Short introduction", type: "textarea" },
      { key: "philosophy", label: "Teaching belief (one line, shown as a quote)", type: "textarea" },
    ],
  },
  {
    id: "stats",
    kind: "list",
    path: "stats",
    title: "Numbers strip",
    help: "The four numbers under the top section. Leave a number empty to show a dash.",
    singular: "number",
    max: 6,
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "value", label: "Number", type: "number" },
      { key: "suffix", label: "After the number", type: "text", placeholder: "+" },
    ],
    newItem: () => ({ label: "", value: null, suffix: "" }),
    itemTitle: (it) => str(it, "label") || "New number",
  },
  {
    id: "video",
    kind: "object",
    path: "video",
    title: "Coaching video",
    fields: [
      { key: "src", label: "Video", type: "video", help: "MP4 under 100 MB. Short (20–60 seconds) works best." },
      { key: "title", label: "Section heading", type: "text" },
      { key: "caption", label: "One line about the video", type: "textarea" },
      { key: "poster.src", label: "Cover image (optional)", type: "image", help: "If empty, a frame from the video is used." },
    ],
  },
  {
    id: "about",
    kind: "object",
    path: "about",
    title: "About the coaching",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Paragraph", type: "textarea" },
    ],
  },
  {
    id: "pillars",
    kind: "list",
    path: "about.pillars",
    title: "Teaching approach (numbered boxes)",
    singular: "point",
    max: 8,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "text", label: "Description", type: "textarea" },
      { key: "draft", label: "Mark as draft", type: "toggle" },
    ],
    newItem: () => ({ title: "", text: "", draft: false }),
    itemTitle: (it) => str(it, "title") || "New point",
  },
  {
    id: "expectations",
    kind: "list",
    path: "about.expectations",
    title: "What to expect (bullet list)",
    singular: "bullet",
    max: 10,
    fields: [{ key: "", label: "Text", type: "text" }],
    newItem: () => "",
    itemTitle: (it, i) => (typeof it === "string" && it ? it : `Bullet ${i + 1}`),
  },
  {
    id: "achievements",
    kind: "list",
    path: "achievements",
    title: "Achievements",
    help: "Only add students who have agreed to be shown.",
    singular: "achievement",
    max: 30,
    fields: [
      { key: "image.src", label: "Photo (optional)", type: "image" },
      { key: "image.alt", label: "Photo description", type: "text" },
      { key: "achievement", label: "Achievement", type: "text", placeholder: "Cleared bank PO interview" },
      { key: "student", label: "Student name", type: "text" },
      { key: "year", label: "Year", type: "text" },
      { key: "caption", label: "Short story (optional)", type: "textarea" },
    ],
    newItem: () => ({ student: "", achievement: "", year: String(new Date().getFullYear()), caption: "", image: { src: null, alt: "Student achievement" } }),
    itemTitle: (it) => str(it, "achievement") || "New achievement",
  },
  {
    id: "testimonials",
    kind: "list",
    path: "testimonials",
    title: "Reviews",
    help: "Use real reviews only, with permission.",
    singular: "review",
    max: 20,
    fields: [
      { key: "quote", label: "Review", type: "textarea" },
      { key: "name", label: "Student name", type: "text" },
      { key: "context", label: "Batch / year", type: "text" },
    ],
    newItem: () => ({ quote: "", name: "", context: "" }),
    itemTitle: (it) => str(it, "name") || "New review",
  },
  {
    id: "batches",
    kind: "list",
    path: "batches",
    title: "Batches",
    singular: "batch",
    max: 20,
    fields: [
      { key: "title", label: "Batch name", type: "text", placeholder: "Morning Beginners" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "open", label: "Admissions open" },
          { value: "few-seats", label: "Few seats left" },
          { value: "starting-soon", label: "Starting soon" },
          { value: "full", label: "Batch full" },
        ],
      },
      { key: "level", label: "Level", type: "text", placeholder: "Beginner" },
      { key: "schedule", label: "Days and time", type: "text", placeholder: "Mon–Sat · 7:00–8:00 AM" },
      { key: "startDate", label: "Start date", type: "text", placeholder: "2 December" },
      { key: "mode", label: "Mode", type: "text", placeholder: "Offline" },
      { key: "seats", label: "Seats left (optional)", type: "text" },
      { key: "fee", label: "Fee (optional — leave empty to hide)", type: "text" },
    ],
    newItem: () => ({
      id: `batch-${Date.now().toString(36)}`,
      title: "",
      level: "",
      schedule: "",
      startDate: "",
      mode: "Offline",
      status: "open",
      seats: "",
      fee: "",
    }),
    itemTitle: (it) => str(it, "title") || "New batch",
  },
  {
    id: "gallery",
    kind: "list",
    path: "gallery",
    title: "Gallery photos",
    help: "Shown in this order. The 1st and 6th photos appear larger on computers.",
    singular: "photo",
    max: 40,
    fields: [
      { key: "src", label: "Photo", type: "image" },
      { ...alt(), key: "alt" },
      { key: "caption", label: "Caption (optional)", type: "text" },
    ],
    newItem: () => ({ src: null, alt: "Classroom moment", caption: "" }),
    itemTitle: (it, i) => str(it, "caption") || str(it, "alt") || `Photo ${i + 1}`,
  },
  {
    id: "faqs",
    kind: "list",
    path: "faqs",
    title: "Questions & answers",
    singular: "question",
    max: 20,
    fields: [
      { key: "q", label: "Question", type: "text" },
      { key: "a", label: "Answer", type: "textarea" },
    ],
    newItem: () => ({ q: "", a: "" }),
    itemTitle: (it) => str(it, "q") || "New question",
  },
  {
    id: "times",
    kind: "list",
    path: "preferredTimes",
    title: "Enquiry form: time options",
    singular: "option",
    max: 10,
    fields: [{ key: "", label: "Option", type: "text" }],
    newItem: () => "",
    itemTitle: (it, i) => (typeof it === "string" && it ? it : `Option ${i + 1}`),
  },
];
