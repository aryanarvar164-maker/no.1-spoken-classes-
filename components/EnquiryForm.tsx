"use client";

import { useEffect, useId, useRef, useState } from "react";
import { site } from "@/content/site";
import { enquirySchema, type EnquiryResponse } from "@/lib/enquiry-schema";
import { cx } from "./ui";

type Status = "idle" | "submitting" | "success" | "error";

const batchLabel = (id: string) => {
  const b = site.batches.find((x) => x.id === id);
  if (!b) return id;
  return [b.title, b.level, b.schedule].filter(Boolean).join(" · ");
};

export default function EnquiryForm() {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const startedAt = useRef<number>(0);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [batch, setBatch] = useState("");

  useEffect(() => {
    startedAt.current = Date.now();
    // "Enquire for this batch" buttons preselect the batch.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>("[data-batch]");
      if (a?.dataset.batch) setBatch(a.dataset.batch);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      batch: batch ? batchLabel(batch) : "",
      preferredTime: String(fd.get("preferredTime") ?? ""),
      message: String(fd.get("message") ?? ""),
      company: String(fd.get("company") ?? ""),
      startedAt: startedAt.current,
    };

    // Client-side check for instant feedback (the server validates again).
    const check = enquirySchema.safeParse(payload);
    if (!check.success) {
      const fe: Record<string, string> = {};
      for (const i of check.error.issues) fe[String(i.path[0])] ??= i.message;
      delete fe.company;
      if (Object.keys(fe).length) {
        setErrors(fe);
        setStatus("error");
        setMessage("Please check the highlighted fields.");
        const first = Object.keys(fe)[0];
        formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
        return;
      }
    }

    setErrors({});
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as EnquiryResponse | null;

      if (res.ok && data?.ok) {
        setStatus("success");
        setMessage("Thank you! Your enquiry has been sent — we'll get back to you soon.");
        formRef.current?.reset();
        setBatch("");
        return;
      }
      setStatus("error");
      setErrors((data && !data.ok && data.fieldErrors) || {});
      setMessage((data && !data.ok && data.error) || "Something went wrong. Please try again.");
    } catch {
      setStatus("error");
      setMessage("Network error — please check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="card p-8 shadow-hard-lg sm:p-10">
        <span className="grid h-14 w-14 place-items-center border-2 border-teal bg-red text-white">
          <svg width="22" height="22" viewBox="0 0 16 16" aria-hidden>
            <path d="m3 8.5 3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h3 className="display mt-6 text-3xl">Enquiry sent.</h3>
        <p className="mt-3 text-teal-muted">{message}</p>
        <button type="button" className="btn-secondary mt-8" onClick={() => { setStatus("idle"); setMessage(""); startedAt.current = Date.now(); }}>
          Send another enquiry
        </button>
      </div>
    );
  }

  const f = (name: string) => ({
    id: `${uid}-${name}`,
    name,
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `${uid}-${name}-err` : undefined,
  });
  const Err = ({ name }: { name: string }) =>
    errors[name] ? (
      <p id={`${uid}-${name}-err`} className="mt-1.5 text-sm text-red">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="card p-6 shadow-hard-lg sm:p-10" aria-busy={status === "submitting"}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-name`} className="mb-1.5 block text-sm font-semibold">Name *</label>
          <input {...f("name")} type="text" autoComplete="name" required className="field" placeholder="Your full name" />
          <Err name="name" />
        </div>
        <div>
          <label htmlFor={`${uid}-phone`} className="mb-1.5 block text-sm font-semibold">Phone / WhatsApp *</label>
          <input {...f("phone")} type="tel" inputMode="tel" autoComplete="tel" required className="field" placeholder="+91 98xxx xxxxx" />
          <Err name="phone" />
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className="mb-1.5 block text-sm font-semibold">
            Email <span className="font-normal text-teal-muted">(optional)</span>
          </label>
          <input {...f("email")} type="email" autoComplete="email" className="field" placeholder="you@example.com" />
          <Err name="email" />
        </div>
        <div>
          <label htmlFor={`${uid}-batch`} className="mb-1.5 block text-sm font-semibold">Interested batch</label>
          <select {...f("batch")} value={batch} onChange={(e) => setBatch(e.target.value)} className="field field-select">
            <option value="">Not sure yet</option>
            {site.batches.map((b) => (
              <option key={b.id} value={b.id}>
                {batchLabel(b.id)}
              </option>
            ))}
          </select>
          <Err name="batch" />
        </div>
        <div>
          <label htmlFor={`${uid}-preferredTime`} className="mb-1.5 block text-sm font-semibold">Preferred time</label>
          <select {...f("preferredTime")} defaultValue="" className="field field-select">
            <option value="">Any time</option>
            {site.preferredTimes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-message`} className="mb-1.5 block text-sm font-semibold">Message</label>
          <textarea {...f("message")} rows={4} maxLength={1000} className="field resize-y" placeholder="Tell us your goal — interviews, work, studies, everyday confidence…" />
          <Err name="message" />
        </div>

        {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={`${uid}-company`}>Company</label>
          <input id={`${uid}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={status === "submitting"} data-magnetic data-cursor="Send">
          {status === "submitting" ? (
            <>
              <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Sending…
            </>
          ) : (
            "Send enquiry"
          )}
        </button>
        <p className="text-sm text-teal-muted">We only use your details to reply to this enquiry.</p>
      </div>

      <p role="alert" aria-live="assertive" className={cx("mt-5 text-sm", status === "error" ? "text-red" : "sr-only")}>
        {status === "error" ? message : ""}
      </p>
    </form>
  );
}
