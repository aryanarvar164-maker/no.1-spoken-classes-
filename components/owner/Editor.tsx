"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { contentSchema, type SiteContent } from "@/lib/content-schema";
import { cldImage, cldVideo, cldVideoPoster, toPublicId } from "@/lib/cloudinary";
import { sections, type FieldDef, type ListSection, type ObjectSection } from "./editor-config";
import { getIn, humanPath, normalize, setIn, toPath, type Path } from "./paths";

type Status = { kind: "idle" | "saving" | "saved" | "error"; msg?: string };

/* ───────────────────────── path helpers ───────────────────────── */

/* ───────────────────────── uploads ───────────────────────── */

const LIMITS = { image: 10 * 1024 * 1024, video: 100 * 1024 * 1024 };

/** Shrink big phone photos before upload (faster on mobile data). Falls back to the original. */
async function shrinkImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.size < 1.5 * 1024 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < LIMITS.image) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.88));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

async function uploadFile(file: File, kind: "image" | "video", token: string, onProgress: (pct: number) => void): Promise<string> {
  const body = kind === "image" ? await shrinkImage(file) : file;
  if (body.size > LIMITS[kind]) {
    throw new Error(kind === "image" ? "This photo is over 10 MB. Please choose a smaller one." : "This video is over 100 MB. Please compress it first (e.g. with HandBrake).");
  }

  const signRes = await fetch("/api/owner/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-owner-token": token },
    body: JSON.stringify({ kind, filename: file.name }),
  });
  const s = await signRes.json().catch(() => ({}));
  if (!signRes.ok) throw new Error(s.error || "Couldn't start the upload.");

  const fd = new FormData();
  fd.append("file", body, file.name);
  fd.append("api_key", s.apiKey);
  fd.append("timestamp", String(s.timestamp));
  fd.append("public_id", s.publicId);
  fd.append("signature", s.signature);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${s.cloudName}/${kind}/upload`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      try {
        const j = JSON.parse(xhr.responseText);
        if (xhr.status < 300 && j.public_id) resolve(j.public_id);
        else reject(new Error(j?.error?.message || "Upload failed."));
      } catch {
        reject(new Error("Upload failed."));
      }
    };
    xhr.onerror = () => reject(new Error("Network problem during upload. Check your internet and try again."));
    xhr.send(fd);
  });
}

/* ───────────────────────── editor ───────────────────────── */

export default function Editor({ initial, token, storageReady }: { initial: SiteContent; token: string; storageReady: boolean }) {
  const [content, setContent] = useState<SiteContent>(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const dirty = useMemo(() => JSON.stringify(content) !== saved, [content, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = useCallback((path: Path, value: unknown) => {
    setContent((prev) => setIn(prev, path, value));
    setStatus((s) => (s.kind === "saved" || s.kind === "error" ? { kind: "idle" } : s));
  }, []);

  async function save() {
    const candidate = normalize(content);
    const check = contentSchema.safeParse(candidate);
    if (!check.success) {
      const issue = check.error.issues[0];
      setStatus({ kind: "error", msg: `Please fix: ${issue.message} (${humanPath(issue.path)})` });
      return;
    }
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/owner/content", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-owner-token": token },
        body: JSON.stringify(check.data),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) throw new Error(j.error || "Saving failed.");
      setContent(check.data);
      setSaved(JSON.stringify(check.data));
      setStatus({ kind: "saved", msg: "Saved. The website is updated." });
    } catch (e) {
      setStatus({ kind: "error", msg: e instanceof Error ? e.message : "Saving failed." });
    }
  }

  function discard() {
    if (!window.confirm("Discard all changes since your last save?")) return;
    setContent(JSON.parse(saved));
    setStatus({ kind: "idle" });
  }

  return (
    <div className="min-h-dvh bg-cream-200">
      <header className="sticky top-0 z-40 border-b-2 border-teal bg-cream">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center border-2 border-teal bg-red font-display text-lg text-cream">01</span>
            <div className="leading-tight">
              <p className="font-display text-lg uppercase">Edit website</p>
              <p className="text-sm text-teal-muted" aria-live="polite">
                {status.kind === "saving" ? "Saving…" : dirty ? "You have unsaved changes" : "All changes saved"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn-secondary min-h-[44px] px-4 text-sm">
              View website ↗
            </a>
            <button type="button" onClick={discard} disabled={!dirty || status.kind === "saving"} className="btn-secondary min-h-[44px] px-4 text-sm">
              Discard
            </button>
            <button type="button" onClick={save} disabled={!dirty || status.kind === "saving" || !storageReady} className="btn-primary min-h-[44px] px-5 text-sm">
              {status.kind === "saving" ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
        {(status.msg || !storageReady) && (
          <div
            role={status.kind === "error" || !storageReady ? "alert" : "status"}
            className={
              "border-t-2 border-teal px-4 py-2 text-center text-sm font-semibold sm:px-6 " +
              (status.kind === "saved" ? "bg-mint" : "bg-blush")
            }
          >
            {!storageReady
              ? "Saving is switched off: add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to the server settings."
              : status.msg}
          </div>
        )}
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Editor sections" className="hidden lg:block">
          <ul className="sticky top-28 flex flex-col gap-1 text-sm font-semibold">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#ed-${s.id}`} className="block border-l-2 border-transparent px-3 py-1.5 text-teal-muted hover:border-red hover:text-teal">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex min-w-0 flex-col gap-8">
          <p className="border-2 border-teal bg-white p-4 text-sm leading-relaxed">
            Change anything below, then press <strong>Save changes</strong>. The website updates straight away. Text in
            [square brackets] is placeholder text that still needs replacing. Keep this page’s link private: anyone with it
            can edit the site.
          </p>
          {sections.map((s) =>
            s.kind === "object" ? (
              <ObjectCard key={s.id} section={s} content={content} update={update} token={token} />
            ) : (
              <ListCard key={s.id} section={s} content={content} update={update} token={token} />
            ),
          )}
          <div className="flex justify-end pb-16">
            <button type="button" onClick={save} disabled={!dirty || status.kind === "saving" || !storageReady} className="btn-primary">
              {status.kind === "saving" ? "Saving…" : "Save changes"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ───────────────────────── section cards ───────────────────────── */

type CardProps<S> = { section: S; content: SiteContent; update: (p: Path, v: unknown) => void; token: string };

function Shell({ id, title, help, children }: { id: string; title: string; help?: string; children: React.ReactNode }) {
  return (
    <section id={`ed-${id}`} aria-labelledby={`ed-${id}-h`} className="scroll-mt-28 border-2 border-teal bg-white shadow-hard">
      <div className="border-b-2 border-teal bg-cream px-5 py-4">
        <h2 id={`ed-${id}-h`} className="font-display text-2xl uppercase">
          {title}
        </h2>
        {help && <p className="mt-1 text-sm text-teal-muted">{help}</p>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ObjectCard({ section, content, update, token }: CardProps<ObjectSection>) {
  const base = toPath(section.path);
  return (
    <Shell id={section.id} title={section.title} help={section.help}>
      <div className="grid gap-5 md:grid-cols-2">
        {section.fields.map((f) => {
          const path = [...base, ...toPath(f.key)];
          return (
            <Field
              key={f.key}
              def={f}
              id={`f-${section.id}-${f.key}`}
              value={getIn(content, path)}
              onChange={(v) => update(path, v)}
              token={token}
            />
          );
        })}
      </div>
    </Shell>
  );
}

function ListCard({ section, content, update, token }: CardProps<ListSection>) {
  const base = toPath(section.path);
  const items = (getIn(content, base) as unknown[]) ?? [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const setItems = (next: unknown[]) => update(base, next);
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    setOpenIndex(j);
  };
  const remove = (i: number) => {
    if (!window.confirm(`Remove this ${section.singular}?`)) return;
    setItems(items.filter((_, k) => k !== i));
  };
  const add = () => {
    setItems([...items, section.newItem()]);
    setOpenIndex(items.length);
  };

  return (
    <Shell id={section.id} title={section.title} help={section.help}>
      <ol className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li key={i} className="border-2 border-teal/30">
            <details open={openIndex === i} onToggle={(e) => (e.currentTarget.open ? setOpenIndex(i) : openIndex === i && setOpenIndex(null))}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-cream px-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 truncate">
                  <span className="mr-2 text-red">{i + 1}.</span>
                  {section.itemTitle(item, i)}
                </span>
                <span aria-hidden className="text-sm text-teal-muted">
                  Edit ▾
                </span>
              </summary>
              <div className="grid gap-5 p-4 md:grid-cols-2">
                {section.fields.map((f) => {
                  const path = [...base, i, ...toPath(f.key)];
                  return (
                    <Field
                      key={f.key || "value"}
                      def={f}
                      id={`f-${section.id}-${i}-${f.key || "v"}`}
                      value={getIn(content, path)}
                      onChange={(v) => update(path, v)}
                      token={token}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 border-t-2 border-teal/15 px-4 py-3">
                <button type="button" className="btn-secondary min-h-[40px] px-3 text-sm" onClick={() => move(i, -1)} disabled={i === 0}>
                  Move up
                </button>
                <button type="button" className="btn-secondary min-h-[40px] px-3 text-sm" onClick={() => move(i, 1)} disabled={i === items.length - 1}>
                  Move down
                </button>
                <button type="button" className="btn-secondary ml-auto min-h-[40px] px-3 text-sm text-red" onClick={() => remove(i)}>
                  Remove
                </button>
              </div>
            </details>
          </li>
        ))}
      </ol>
      {items.length === 0 && <p className="text-sm text-teal-muted">Nothing here yet — this part is hidden on the website.</p>}
      <button type="button" onClick={add} disabled={items.length >= section.max} className="btn-dark mt-4 min-h-[44px] text-sm">
        + Add {section.singular}
      </button>
    </Shell>
  );
}

/* ───────────────────────── fields ───────────────────────── */

function Field({ def, id, value, onChange, token }: { def: FieldDef; id: string; value: unknown; onChange: (v: unknown) => void; token: string }) {
  const wide = def.type === "textarea" || def.type === "image" || def.type === "video";
  const helpId = def.help ? `${id}-help` : undefined;

  const label = (
    <label htmlFor={id} className="mb-1.5 block text-sm font-bold">
      {def.label}
    </label>
  );
  const help = def.help && (
    <p id={helpId} className="mt-1.5 text-sm text-teal-muted">
      {def.help}
    </p>
  );

  if (def.type === "image" || def.type === "video") {
    return (
      <div className="md:col-span-2">
        <MediaField id={id} label={def.label} help={def.help} kind={def.type} value={(value as string | null) ?? null} onChange={onChange} token={token} />
      </div>
    );
  }

  if (def.type === "toggle") {
    return (
      <div className="md:col-span-2">
        <label htmlFor={id} className="flex items-center gap-3 font-bold">
          <input id={id} type="checkbox" className="h-5 w-5 accent-[#C8371F]" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} aria-describedby={helpId} />
          {def.label}
        </label>
        {help}
      </div>
    );
  }

  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      {label}
      {def.type === "textarea" ? (
        <textarea id={id} lang={def.lang} rows={3} className="field resize-y" value={(value as string) ?? ""} placeholder={def.placeholder} aria-describedby={helpId} onChange={(e) => onChange(e.target.value)} />
      ) : def.type === "number" ? (
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          className="field"
          value={value === null || value === undefined ? "" : String(value)}
          placeholder="Leave empty to show a dash"
          aria-describedby={helpId}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      ) : def.type === "select" ? (
        <select id={id} className="field field-select" value={(value as string) ?? ""} aria-describedby={helpId} onChange={(e) => onChange(e.target.value)}>
          {def.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input id={id} type="text" lang={def.lang} className="field" value={(value as string) ?? ""} placeholder={def.placeholder} aria-describedby={helpId} onChange={(e) => onChange(e.target.value)} />
      )}
      {help}
    </div>
  );
}

function MediaField({
  id,
  label,
  help,
  kind,
  value,
  onChange,
  token,
}: {
  id: string;
  label: string;
  help?: string;
  kind: "image" | "video";
  value: string | null;
  onChange: (v: unknown) => void;
  token: string;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const pid = toPublicId(value);
  const preview =
    kind === "image"
      ? pid
        ? cldImage(pid, { width: 480 })
        : value && (value.startsWith("/") || value.startsWith("https://"))
          ? value
          : null
      : null;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setProgress(0);
    try {
      const newId = await uploadFile(file, kind, token, setProgress);
      onChange(newId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-bold" id={`${id}-label`}>
        {label}
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="grid aspect-[4/3] w-full max-w-[16rem] shrink-0 place-items-center overflow-hidden border-2 border-teal bg-cream-300 text-center text-xs font-bold uppercase tracking-[0.1em] text-teal-muted">
          {kind === "video" && pid ? (
            <video src={cldVideo(pid, 480)} poster={cldVideoPoster(pid, 480)} controls muted playsInline preload="metadata" className="h-full w-full object-cover" />
          ) : preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="px-3">{value ? "Saved (no preview)" : kind === "image" ? "No photo yet" : "No video yet"}</span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              id={id}
              type="file"
              className="sr-only"
              aria-labelledby={`${id}-label`}
              accept={kind === "image" ? "image/jpeg,image/png,image/webp,image/heic,image/heif" : "video/mp4,video/webm,video/quicktime"}
              onChange={onFile}
              disabled={progress !== null}
            />
            <button type="button" className="btn-dark min-h-[44px] text-sm" onClick={() => inputRef.current?.click()} disabled={progress !== null}>
              {progress !== null ? `Uploading… ${progress}%` : value ? `Replace ${kind === "image" ? "photo" : "video"}` : `Upload ${kind === "image" ? "photo" : "video"}`}
            </button>
            {value && progress === null && (
              <button type="button" className="btn-secondary min-h-[44px] text-sm" onClick={() => onChange(null)}>
                Remove
              </button>
            )}
          </div>
          {progress !== null && (
            <div className="h-2 w-full border border-teal bg-cream" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
              <div className="h-full bg-red transition-[width]" style={{ width: `${progress}%` }} />
            </div>
          )}
          {error && (
            <p role="alert" className="text-sm font-semibold text-red">
              {error}
            </p>
          )}
          {help && <p className="text-sm text-teal-muted">{help}</p>}
          <details className="text-sm">
            <summary className="cursor-pointer text-teal-muted">Advanced: Cloudinary ID</summary>
            <input
              type="text"
              aria-label={`${label} — Cloudinary ID`}
              className="field mt-2 text-sm"
              value={value ?? ""}
              placeholder="no01/photos/class-1"
              onChange={(e) => onChange(e.target.value.trim() || null)}
            />
          </details>
        </div>
      </div>
    </div>
  );
}
