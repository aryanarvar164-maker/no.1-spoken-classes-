import "server-only";
import { unstable_cache } from "next/cache";
import { defaultContent } from "@/content/site";
import { contentSchema, type SiteContent } from "./content-schema";
import { cloudinaryServerReady, readRawJson, uploadRawJson } from "./cloudinary-server";
import { overlay } from "./overlay";

/** Where the owner's saved content lives in Cloudinary (Media Library → no01 folder). */
export const CONTENT_ID = "no01/site-content.json";
export const CONTENT_TAG = "site-content";

async function load(): Promise<SiteContent> {
  if (!cloudinaryServerReady()) return defaultContent;
  try {
    const saved = await readRawJson(CONTENT_ID);
    if (!saved) return defaultContent;
    const parsed = contentSchema.safeParse(overlay(defaultContent, saved));
    if (parsed.success) return parsed.data;
    console.error("[content] saved content failed validation — using defaults", parsed.error.issues.slice(0, 3));
  } catch (err) {
    console.error("[content] could not load saved content — using defaults", err);
  }
  return defaultContent;
}

// Cached for every visitor; the owner's Save calls revalidateTag(CONTENT_TAG),
// so changes show up on the very next page load. The hourly revalidate is only a safety net.
const cachedLoad = unstable_cache(load, ["site-content-v1"], { tags: [CONTENT_TAG], revalidate: 3600 });

export async function getContent(opts: { fresh?: boolean } = {}): Promise<SiteContent> {
  return opts.fresh ? load() : cachedLoad();
}

/** Save content (already validated) and keep a timestamped backup copy. */
export async function saveContent(content: SiteContent) {
  const json = JSON.stringify(content);
  await uploadRawJson(CONTENT_ID, json);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  // A backup failing shouldn't fail the save.
  await uploadRawJson(`no01/content-history/${stamp}.json`, json).catch((e) => console.error("[content] backup failed", e));
}
