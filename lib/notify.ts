import "server-only";
import type { EnquiryInput } from "./enquiry-schema";

export class NotifyNotConfiguredError extends Error {}

const ENTITIES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ENTITIES[c] ?? c);

/**
 * Sends the enquiry to the owner by email via Resend's REST API.
 * No SDK needed. Swap this function to use another provider
 * (e.g. WhatsApp Cloud API, Twilio) — keep secrets in env vars.
 */
export async function notifyOwner(e: EnquiryInput): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ENQUIRY_FROM_EMAIL;
  const to = process.env.ENQUIRY_TO_EMAIL;

  if (!key || !from || !to) {
    throw new NotifyNotConfiguredError(
      "Enquiry email is not configured. Set RESEND_API_KEY, ENQUIRY_FROM_EMAIL and ENQUIRY_TO_EMAIL.",
    );
  }

  const rows: [string, string | undefined][] = [
    ["Name", e.name],
    ["Phone / WhatsApp", e.phone],
    ["Email", e.email],
    ["Interested batch", e.batch],
    ["Preferred time", e.preferredTime],
    ["Message", e.message],
  ];

  const text = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h2 style="margin:0 0 12px">New website enquiry</h2>
      <table cellpadding="8" style="border-collapse:collapse;width:100%">
        ${rows
          .filter(([, v]) => v)
          .map(
            ([k, v]) =>
              `<tr><td style="border-bottom:1px solid #eee;color:#666;width:160px">${esc(k)}</td><td style="border-bottom:1px solid #eee;white-space:pre-wrap">${esc(v!)}</td></tr>`,
          )
          .join("")}
      </table>
    </div>`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: to.split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: e.email || undefined,
        subject: `New enquiry: ${e.name}${e.batch ? ` — ${e.batch}` : ""}`,
        text,
        html,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Resend responded ${res.status}: ${detail.slice(0, 300)}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}
