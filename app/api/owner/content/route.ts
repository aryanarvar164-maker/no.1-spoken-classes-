import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { contentSchema } from "@/lib/content-schema";
import { CONTENT_TAG, saveContent } from "@/lib/content";
import { cloudinaryServerReady } from "@/lib/cloudinary-server";
import { isOwnerToken } from "@/lib/owner-auth";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ip = (req: NextRequest) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

export async function POST(req: NextRequest) {
  if (!rateLimit(`owner-save:${ip(req)}`, 60).allowed) {
    return NextResponse.json({ ok: false, error: "Too many requests. Wait a few minutes and try again." }, { status: 429 });
  }
  if (!isOwnerToken(req.headers.get("x-owner-token"))) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }
  if (!cloudinaryServerReady()) {
    return NextResponse.json(
      { ok: false, error: "Saving isn't set up: add the Cloudinary cloud name, API key and API secret to the server settings." },
      { status: 503 },
    );
  }
  if (Number(req.headers.get("content-length") ?? 0) > 300_000) {
    return NextResponse.json({ ok: false, error: "Content is too large to save." }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = contentSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { ok: false, error: `Please fix: ${issue.message}`, path: issue.path.map(String) },
      { status: 422 },
    );
  }

  try {
    await saveContent(parsed.data);
    revalidateTag(CONTENT_TAG);
    return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[owner] save failed", err);
    return NextResponse.json({ ok: false, error: "Saving failed. Please try again in a minute." }, { status: 502 });
  }
}
