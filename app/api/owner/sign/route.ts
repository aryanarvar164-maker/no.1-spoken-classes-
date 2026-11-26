import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { cloudinaryPublicConfig, cloudinaryServerReady, signParams } from "@/lib/cloudinary-server";
import { isOwnerToken } from "@/lib/owner-auth";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Gives the owner editor a one-time signature so the browser can upload a
 * photo/video straight to Cloudinary (big files never pass through this server).
 * The secret stays here; only the signature leaves.
 */
const bodySchema = z.object({
  kind: z.enum(["image", "video"]),
  filename: z.string().max(200),
});

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "file";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`owner-sign:${ip}`, 120).allowed) {
    return NextResponse.json({ error: "Too many uploads. Wait a few minutes." }, { status: 429 });
  }
  if (!isOwnerToken(req.headers.get("x-owner-token"))) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!cloudinaryServerReady()) {
    return NextResponse.json({ error: "Uploads aren't set up: Cloudinary settings are missing on the server." }, { status: 503 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { kind, filename } = parsed.data;
  const publicId = `no01/${kind === "video" ? "video" : "photos"}/${slug(filename)}-${randomBytes(3).toString("hex")}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signParams({ public_id: publicId, timestamp });
  const { cloudName, apiKey } = cloudinaryPublicConfig();

  return NextResponse.json({ cloudName, apiKey, timestamp, signature, publicId, resourceType: kind });
}
