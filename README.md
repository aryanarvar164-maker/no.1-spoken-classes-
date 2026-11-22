# No. 01 Spoken English Classes — one-page website

A single-route Next.js site (App Router · TypeScript · Tailwind CSS · GSAP ScrollTrigger · Zod)
with a working enquiry form that emails the owner through Resend.

Every section lives on `/`. Navigation uses in-page anchors only — no routes, no new tabs.

```
Hero → Coaching film → About → Achievements & testimonials → Running batches → Gallery → Enquiry → Footer
```

## Design

"Formal Signboard": the confidence of Indian shop signage, kept orderly.
- Colours (tailwind.config.ts): cream `#FFF8EA` ground, deep teal `#0E3B3D` for text/borders/dark sections,
  red `#C8371F` for primary actions, marigold `#F2A91B` for highlights; mint/blush only on batch-card headers.
- Type: Anton (condensed display, uppercase) + Mukta (body, with Devanagari for the Hindi lines).
- Shapes: square corners, 2px teal borders, hard offset shadows; buttons "press" into their shadow on click.
- Placeholders are outlined in dashed violet — a colour the brand never uses, so nothing is missed.

---

## 1. Setup

Requires Node.js 18.18+ (20 LTS recommended).

```bash
npm install
cp .env.example .env.local     # then fill in the values below
npm run dev                    # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run lint`, `npm run typecheck`.

## 2. Environment variables

| Variable | Required | What it is |
|---|---|---|
| `RESEND_API_KEY` | yes, for enquiries | API key from resend.com |
| `ENQUIRY_FROM_EMAIL` | yes, for enquiries | A sender on a domain you verified in Resend, e.g. `No. 01 Website <enquiries@yourdomain.com>` |
| `ENQUIRY_TO_EMAIL` | yes, for enquiries | The owner's inbox. Comma-separate for several. |
| `NEXT_PUBLIC_SITE_URL` | recommended | Production URL, used for SEO / Open Graph |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | for Cloudinary media | Your cloud name. The only Cloudinary value the site needs — add it to Vercel too. |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | upload script only | Keep in `.env.local` on your computer. **Do not add to Vercel, never commit, never prefix with `NEXT_PUBLIC_`.** |

**Until the three enquiry variables are set, the form does not deliver anything.** The API
answers `503` and the visitor sees "Online enquiries aren't switched on yet — please call or
WhatsApp us." Nothing claims success that didn't happen.

### Testing the enquiry flow

1. Set the variables in `.env.local` and restart `npm run dev`.
2. Submit the form on the page — you should see the success state and receive an email.
3. Or from a terminal:
   ```bash
   curl -X POST http://localhost:3000/api/enquiry \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Student","phone":"+91 98765 43210","message":"Test","startedAt":0}'
   ```
   Expect `{"ok":true}` and an email. A bad phone returns `422` with `fieldErrors`.

### Using WhatsApp instead of (or as well as) email

Replace the body of `notifyOwner()` in `lib/notify.ts` with a call to your provider
(WhatsApp Cloud API, Twilio, Interakt…). Keep tokens in env vars. Nothing else changes.

## 3. Editing content

**All content is in `content/site.ts`.** No component needs to change to update the site.

- Text in `[square brackets]` is a placeholder and shows with a dashed yellow outline on the
  page. Replace each one with verified information from the owner.
- Pillars marked `draft: true` are suggested copy — confirm or rewrite them with the tutor.
- Stats only animate when given a real number; `value: null` shows a dash.
- Before launch, set `showContentFlags: false` and search the file for `[` to confirm nothing is left.

**Never publish achievements, reviews, credentials, batch schedules or fees the owner hasn't
confirmed. Student names and photos need the student's consent.**

### Images and video (Cloudinary)

Photos and the coaching film are served from Cloudinary. Cloudinary resizes each image to the
exact width the screen needs, converts it to AVIF/WebP and compresses it (`f_auto,q_auto`), and
picks the best video codec per browser (`f_auto:video,vc_auto`). Phones get a 720px video, larger
screens 1600px. The video isn't downloaded until the visitor scrolls near it.

1. Put the files in a folder, organised however you like:
   ```
   media/
     tutor/portrait.jpg
     gallery/class-1.jpg  class-2.jpg …
     achievements/student-a.jpg
     video/coaching-film.mp4
   ```
2. Run `npm run upload-media -- ./media`
3. Paste the printed IDs (also saved to `cloudinary-ids.json`) into `content/site.ts`, e.g.
   `portrait: { src: "no01/tutor/portrait", alt: "…" }`, `video: { src: "no01/video/coaching-film", … }`.

You can also upload in the Cloudinary dashboard (Media Library) and copy the public ID from there.

Tips:
- Upload originals around 2000–2500px on the long edge; Cloudinary makes every smaller size.
- Free plan file limits: about 10 MB per image, 100 MB per video. The script skips anything larger.
- Keep the in-page film short (20–60 s). `video.poster.src` can stay `null` — a frame from the video is used.
- `/public` paths (`"/images/x.jpg"`) still work and go through Next.js's own optimizer.

## 4. Motion

All GSAP code is in `components/Motion.tsx`, driven by data attributes in the markup
(`data-reveal`, `data-stagger`, `data-mask`, `data-count`, `data-video-track`, `data-hero`).

- `prefers-reduced-motion: reduce` → no animation at all, video doesn't autoplay.
- Under 768px → shorter reveals, no horizontal video travel (static fallback).
- The video's left-to-right travel is scrubbed to scroll **without pinning**, so scrolling is never hijacked.
- Content is fully visible without JavaScript.

## 5. Deploy (Vercel)

1. Push the project to GitHub and import it on vercel.com.
2. Add `RESEND_API_KEY`, `ENQUIRY_FROM_EMAIL`, `ENQUIRY_TO_EMAIL`, `NEXT_PUBLIC_SITE_URL` and
   `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (Production and Preview). Not the Cloudinary key or secret.
3. Deploy, then add the custom domain under Project → Domains.
4. In Resend, verify the same domain (DNS records) so enquiry emails don't land in spam.

Note: the rate limiter (`lib/rate-limit.ts`, 5 enquiries / 10 min per IP) is in-memory, so on
serverless each instance counts separately. For stronger protection swap it for Upstash Redis /
Vercel KV — same function signature.

## 6. Launch checklist

- [ ] All `[placeholders]` replaced with verified details; `showContentFlags: false`
- [ ] Tutor portrait, logo, classroom photos and film added (with consent for students)
- [ ] Batches, timings, start dates and mode confirmed with the owner
- [ ] Enquiry env vars set; test enquiry received in the owner's inbox
- [ ] `NEXT_PUBLIC_SITE_URL` set; an Open Graph image added at `app/opengraph-image.jpg` (1200×630)
- [ ] Checked at 360, 390, 768, 1024 and 1440px — no horizontal scroll
- [ ] Keyboard-only pass: skip link, menu, all links and form fields reachable and visible
- [ ] Lighthouse run on the production URL (aim 90+ across the board)

## Project structure

```
app/
  layout.tsx           fonts, metadata, JSON-LD, pre-paint motion flag
  page.tsx             the one page — section order lives here
  globals.css          design tokens in use, buttons, fields, placeholder marker
  api/enquiry/route.ts POST handler: size check → rate limit → Zod → honeypot → notify
scripts/
  upload-to-cloudinary.mjs  bulk upload from your computer; prints public IDs
components/            one file per section + ui.tsx (shared bits) + Motion.tsx
content/site.ts        ALL editable content
lib/                   enquiry schema, rate limiter, email notifier, Cloudinary URL helpers
```
