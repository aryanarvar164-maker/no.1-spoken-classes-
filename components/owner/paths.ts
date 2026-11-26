export type Path = (string | number)[];

export const toPath = (p: string): Path => (p ? p.split(".") : []);

export function getIn(obj: unknown, path: Path): unknown {
  return path.reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string | number, unknown>)[k]), obj);
}

export function setIn<T>(obj: T, path: Path, value: unknown): T {
  if (!path.length) return value as T;
  const [k, ...rest] = path;
  const base = (Array.isArray(obj) ? [...obj] : { ...((obj as object) ?? {}) }) as Record<string | number, unknown>;
  base[k] = setIn(base[k], rest, value);
  return base as T;
}

/** Fill in half-made image objects (e.g. a photo added before its description) so the save validates. */
export function normalize(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(normalize);
  if (v && typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) o[k] = normalize(val);
    if ("src" in o || "alt" in o) {
      if (!("src" in o)) o.src = null;
      if (!("alt" in o)) o.alt = "";
    }
    return o;
  }
  return v;
}

export const humanPath = (path: (string | number)[]) =>
  path.map((p) => (typeof p === "number" || /^\d+$/.test(String(p)) ? `#${Number(p) + 1}` : String(p))).join(" → ");
