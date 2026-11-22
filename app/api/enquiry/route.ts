import { NextResponse, type NextRequest } from "next/server";
import { enquirySchema, type EnquiryResponse } from "@/lib/enquiry-schema";
import { rateLimit } from "@/lib/rate-limit";
import { notifyOwner, NotifyNotConfiguredError } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_FILL_MS = 2500; // humans take longer than this to fill the form

function json(body: EnquiryResponse, status = 200, headers?: HeadersInit) {
  return NextResponse.json(body, { status, headers });
}

export async function POST(req: NextRequest) {
  // Reject oversized bodies early.
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > 10_000) return json({ ok: false, error: "Request too large." }, 413);

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

  const limit = rateLimit(ip);
  if (!limit.allowed) {
    return json(
      { ok: false, error: "Too many enquiries from this connection. Please try again a little later." },
      429,
      { "Retry-After": String(limit.retryAfterSec) },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (key === "company") continue; // never reveal the honeypot
      fieldErrors[key] ??= issue.message;
    }
    // A filled honeypot is a bot: pretend success, send nothing.
    if (parsed.error.issues.some((i) => i.path[0] === "company")) return json({ ok: true });
    return json({ ok: false, error: "Please check the highlighted fields.", fieldErrors }, 422);
  }

  const data = parsed.data;
  if (data.startedAt && Date.now() - data.startedAt < MIN_FILL_MS) return json({ ok: true });

  try {
    await notifyOwner(data);
    return json({ ok: true });
  } catch (err) {
    if (err instanceof NotifyNotConfiguredError) {
      console.error("[enquiry]", err.message);
      return json(
        { ok: false, error: "Online enquiries aren't switched on yet. Please call or WhatsApp us instead." },
        503,
      );
    }
    console.error("[enquiry] delivery failed", err);
    return json(
      { ok: false, error: "We couldn't send your enquiry just now. Please try again or call us." },
      502,
    );
  }
}

export function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed." }, { status: 405 });
}
