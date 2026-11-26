const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/**
 * Lay saved content over the defaults. Keys come from the defaults, so a field
 * added to the site later still gets its default even if an older save lacks it.
 * Extra keys pass through here (optional fields like a batch's `fee`); anything
 * not in the schema is stripped when lib/content.ts validates. Arrays are replaced whole.
 */
export function overlay<T>(base: T, saved: unknown): T {
  if (isObj(base) && isObj(saved)) {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(base)) out[k] = k in saved ? overlay((base as Record<string, unknown>)[k], saved[k]) : (base as Record<string, unknown>)[k];
    for (const k of Object.keys(saved)) if (!(k in out)) out[k] = saved[k];
    return out as T;
  }
  return (saved === undefined ? base : saved) as T;
}
