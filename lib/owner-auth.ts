import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * The owner editor has no login screen. Instead, the private link carries a long
 * random secret (OWNER_SECRET) that the server checks on every request:
 *
 *   https://yoursite.com/owner/<OWNER_SECRET>
 *
 * Without the right secret the editor page is a plain 404 and the save/upload
 * APIs refuse to do anything. If OWNER_SECRET is missing or too short, the
 * editor is switched off entirely.
 */
const MIN_LENGTH = 24;

export function ownerEditorEnabled() {
  return (process.env.OWNER_SECRET ?? "").length >= MIN_LENGTH;
}

export function isOwnerToken(token: string | null | undefined): boolean {
  const secret = process.env.OWNER_SECRET ?? "";
  if (secret.length < MIN_LENGTH || !token) return false;
  // Hash both so the comparison is constant-time regardless of length.
  const a = createHash("sha256").update(token).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}
