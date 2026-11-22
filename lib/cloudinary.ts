/**
 * Cloudinary delivery helpers.
 *
 * Delivering media needs ONLY the cloud name (public). The API key/secret are
 * used solely by scripts/upload-to-cloudinary.mjs on your own machine and must
 * never be imported here or in any client code.
 *
 * In content/site.ts an image/video `src` can be:
 *   • a Cloudinary public ID        "no01/gallery/class-1"      → served from Cloudinary
 *   • a full res.cloudinary.com URL "https://res.cloudinary.com/<cloud>/image/upload/v1/no01/x.jpg"
 *   • a /public path                "/images/tutor.jpg"         → served by Next.js as before
 */

export const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const BASE = `https://res.cloudinary.com/${CLOUD_NAME}`;

/** Returns the public ID if `src` should be served by Cloudinary, else null. */
export function toPublicId(src: string | null | undefined): string | null {
  if (!src || !CLOUD_NAME) return null;
  const stripExt = (s: string) => s.replace(/\.[a-z0-9]{2,5}$/i, "");

  if (/^https:\/\/res\.cloudinary\.com\//i.test(src)) {
    const after = src.split(/\/(?:image|video)\/upload\//)[1];
    if (!after) return null;
    const parts = after.split("/");
    // Drop leading transformation segments ("f_auto,q_auto", "w_800") and the version ("v1712345").
    while (parts.length > 1 && (/^v\d+$/.test(parts[0]) || /^[a-z]{1,3}_[^/]*$/i.test(parts[0]))) parts.shift();
    return stripExt(parts.join("/"));
  }
  if (src.startsWith("/") || /^[a-z]+:/i.test(src)) return null; // local file or other host
  return stripExt(src);
}

type ImgOpts = { width?: number; quality?: number | "auto"; crop?: "limit" | "fill"; aspect?: string };

/** f_auto → AVIF/WebP/JPEG per browser; q_auto → smallest file with no visible loss. */
export function cldImage(publicId: string, { width, quality = "auto", crop = "limit", aspect }: ImgOpts = {}) {
  const t = [
    "f_auto",
    quality === "auto" ? "q_auto" : `q_${quality}`,
    "dpr_1", // next/image already asks for the right pixel width
    width && `w_${width}`,
    aspect && `ar_${aspect}`,
    `c_${crop}`,
    crop === "fill" && "g_auto", // smart crop keeps faces / subjects in frame
  ]
    .filter(Boolean)
    .join(",");
  return `${BASE}/image/upload/${t}/${publicId}`;
}

/** f_auto:video + vc_auto pick AV1/VP9/H.264 per browser; q_auto shrinks the file. */
export function cldVideo(publicId: string, width: number) {
  return `${BASE}/video/upload/f_auto:video,q_auto,vc_auto,w_${width},c_limit/${publicId}`;
}

/** A poster frame grabbed from the video itself (used when no poster image is set). */
export function cldVideoPoster(publicId: string, width = 1600) {
  return `${BASE}/video/upload/so_1,f_auto,q_auto,w_${width},c_limit/${publicId}.jpg`;
}
