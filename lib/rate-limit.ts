/**
 * Small in-memory sliding-window limiter.
 * Good enough for a single-instance/low-traffic site. On serverless hosts each
 * instance keeps its own memory, so for stronger protection swap this for a
 * shared store (e.g. Upstash Redis / Vercel KV) with the same interface.
 */
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_HITS = 5;

const hits = new Map<string, number[]>();

export function rateLimit(key: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_HITS) {
    hits.set(key, recent);
    return { allowed: false, retryAfterSec: Math.ceil((WINDOW_MS - (now - recent[0])) / 1000) };
  }

  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing forever.
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return { allowed: true, retryAfterSec: 0 };
}
