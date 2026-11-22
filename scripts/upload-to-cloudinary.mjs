#!/usr/bin/env node
/**
 * Bulk-upload photos and videos to Cloudinary and print the public IDs to paste
 * into content/site.ts.
 *
 *   npm run upload-media -- ./media
 *
 * Folder layout becomes the public ID, e.g.
 *   media/tutor/portrait.jpg        → no01/tutor/portrait
 *   media/gallery/Class Day 1.jpg   → no01/gallery/class-day-1
 *   media/video/coaching-film.mp4   → no01/video/coaching-film
 *
 * Reads NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and
 * CLOUDINARY_API_SECRET from .env.local. Runs on your computer only —
 * the secret is never bundled into the website.
 */
import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const KEY = process.env.CLOUDINARY_API_KEY;
const SECRET = process.env.CLOUDINARY_API_SECRET;
const PREFIX = process.env.CLOUDINARY_FOLDER || "no01";

const IMAGE = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic", ".gif"]);
const VIDEO = new Set([".mp4", ".mov", ".webm", ".m4v"]);
const MAX_BYTES = { image: 10 * 1024 * 1024, video: 100 * 1024 * 1024 }; // Free-plan per-file limits

if (!CLOUD || !KEY || !SECRET) {
  console.error("Missing Cloudinary settings. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env.local.");
  process.exit(1);
}

const dir = process.argv[2];
if (!dir) {
  console.error("Usage: npm run upload-media -- ./path/to/media-folder");
  process.exit(1);
}

const slug = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9/]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)|(?<=\/)-|-(?=\/)/g, "");

async function* walk(d) {
  for (const entry of await readdir(d, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(d, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function sign(params) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(toSign + SECRET).digest("hex");
}

async function upload(file, root) {
  const ext = path.extname(file).toLowerCase();
  const type = IMAGE.has(ext) ? "image" : VIDEO.has(ext) ? "video" : null;
  if (!type) return { file, skipped: "not an image or video" };

  const { size } = await stat(file);
  if (size > MAX_BYTES[type]) {
    return { file, skipped: `${(size / 1048576).toFixed(1)} MB is over the ${MAX_BYTES[type] / 1048576} MB limit — compress it first` };
  }

  const rel = path.relative(root, file).split(path.sep).join("/").replace(/\.[^.]+$/, "");
  const public_id = `${PREFIX}/${slug(rel)}`;
  const params = { overwrite: "true", public_id, timestamp: Math.floor(Date.now() / 1000) };

  const form = new FormData();
  form.append("file", new Blob([await readFile(file)]), path.basename(file));
  for (const [k, v] of Object.entries(params)) form.append(k, String(v));
  form.append("api_key", KEY);
  form.append("signature", sign(params));

  let res;
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/${type}/upload`, { method: "POST", body: form });
  } catch (e) {
    return { file, error: `network error: ${e.cause?.code || e.message}` };
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { file, error: json?.error?.message || `HTTP ${res.status}` };
  return { file, type, public_id: json.public_id, kb: Math.round(json.bytes / 1024) };
}

const root = path.resolve(dir);
const results = [];
for await (const file of walk(root)) {
  process.stdout.write(`↑ ${path.relative(root, file)} … `);
  const r = await upload(file, root);
  results.push(r);
  console.log(r.public_id ? `done → ${r.public_id}` : r.skipped ? `skipped (${r.skipped})` : `FAILED (${r.error})`);
}

const ok = results.filter((r) => r.public_id);
await writeFile("cloudinary-ids.json", JSON.stringify(ok, null, 2));
console.log(`\n${ok.length} uploaded, ${results.length - ok.length} not uploaded.`);
console.log("Public IDs saved to cloudinary-ids.json — paste them into content/site.ts as `src` values.");
if (results.some((r) => r.error)) process.exitCode = 1;
