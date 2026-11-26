import "server-only";
import { createHash } from "node:crypto";

/**
 * Server-only Cloudinary access (uses the API key + secret).
 * Never import this from a client component.
 */
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const KEY = process.env.CLOUDINARY_API_KEY ?? "";
const SECRET = process.env.CLOUDINARY_API_SECRET ?? "";

export const cloudinaryServerReady = () => Boolean(CLOUD && KEY && SECRET);

export function cloudinaryPublicConfig() {
  return { cloudName: CLOUD, apiKey: KEY };
}

/** Cloudinary upload signature: sorted params joined with &, plus the secret, SHA-1. */
export function signParams(params: Record<string, string | number>) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(toSign + SECRET).digest("hex");
}

/** Upload (or overwrite) a JSON document as a "raw" asset. Returns its version number. */
export async function uploadRawJson(publicId: string, json: string): Promise<number> {
  const params = { invalidate: "true", overwrite: "true", public_id: publicId, timestamp: Math.floor(Date.now() / 1000) };
  const form = new FormData();
  form.append("file", new Blob([json], { type: "application/json" }), publicId.split("/").pop() || "content.json");
  for (const [k, v] of Object.entries(params)) form.append(k, String(v));
  form.append("api_key", KEY);
  form.append("signature", signParams(params));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/raw/upload`, { method: "POST", body: form, cache: "no-store" });
  const body = (await res.json().catch(() => ({}))) as { version?: number; error?: { message?: string } };
  if (!res.ok) throw new Error(`Cloudinary upload failed (${res.status}): ${body.error?.message ?? "unknown error"}`);
  return body.version ?? 0;
}

/**
 * Read a JSON raw asset. Looks up the latest version through the Admin API
 * (so a CDN copy can never be stale), then downloads that exact version.
 * Returns null when it doesn't exist yet.
 */
export async function readRawJson(publicId: string): Promise<unknown | null> {
  const auth = "Basic " + Buffer.from(`${KEY}:${SECRET}`).toString("base64");
  const meta = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/resources/raw/upload/${encodeURI(publicId)}`, {
    headers: { Authorization: auth },
  });
  if (meta.status === 404) return null;
  if (!meta.ok) throw new Error(`Cloudinary lookup failed (${meta.status})`);
  const { secure_url } = (await meta.json()) as { secure_url: string };

  // No explicit cache option: callers decide freshness (lib/content.ts wraps this in a tagged cache;
  // the owner editor page is dynamic, so it always reads the latest).
  const file = await fetch(secure_url);
  if (!file.ok) throw new Error(`Cloudinary download failed (${file.status})`);
  return file.json();
}
