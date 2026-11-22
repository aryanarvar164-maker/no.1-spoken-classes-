"use client";

import { useEffect, useState } from "react";
import { isPlaceholder, nav, site } from "@/content/site";
import { cx } from "./ui";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    // Highlight the section currently in view.
    const sections = nav
      .map((n) => document.querySelector<HTMLElement>(n.href))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const c = site.contact;
  const ph = (v: string) => (isPlaceholder(v) ? "ph" : undefined);

  return (
    <>
      {/* Info bar — scrolls away; only the main bar below is sticky */}
      

      <header className="sticky top-0 z-50 border-b-2 border-teal bg-cream">
        <div className="container-site flex h-[var(--header-h)] items-center justify-between gap-5">
          <a href="#top" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="grid h-11 w-11 place-items-center border-2 border-teal bg-red font-display text-xl text-cream">01</span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg uppercase sm:text-xl">No. 01 Spoken English</span>
              <span className="mt-1 hidden text-[0.7rem] font-bold uppercase tracking-[0.14em] text-teal-muted sm:block">
                Coaching Institute
              </span>
            </span>
          </a>

          <nav aria-label="Sections" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {nav.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    aria-current={active === n.href ? "true" : undefined}
                    className={cx(
                      "border-b-2 py-1 text-[0.95rem] font-semibold transition-colors",
                      active === n.href ? "border-red text-teal" : "border-transparent text-teal-muted hover:text-teal",
                    )}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a href="#enquiry" className="btn-dark hidden min-h-[44px] px-5 text-[0.95rem] sm:inline-flex" data-magnetic>
              Enquire now
            </a>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center border-2 border-teal lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-3 w-5">
                <span className={cx("absolute left-0 h-0.5 w-5 bg-teal transition-transform duration-300", open ? "top-1.5 rotate-45" : "top-0")} />
                <span className={cx("absolute left-0 h-0.5 w-5 bg-teal transition-transform duration-300", open ? "top-1.5 -rotate-45" : "top-2.5")} />
              </span>
            </button>
          </div>
        </div>

        <div aria-hidden data-progress className="absolute inset-x-0 -bottom-[2px] h-[3px] origin-left scale-x-0 bg-red" />

        <nav
          id="mobile-nav"
          aria-label="Sections"
          hidden={!open}
          className="h-[calc(100dvh-var(--header-h))] overflow-y-auto border-t-2 border-teal bg-cream lg:hidden"
        >
          <ul className="container-site flex flex-col py-4">
            {nav.map((n, i) => (
              <li key={n.href} className="border-b-2 border-teal/15">
                <a href={n.href} onClick={() => setOpen(false)} className="flex items-baseline gap-4 py-4 font-display text-3xl uppercase">
                  <span className="font-sans text-sm font-bold text-red">0{i + 1}</span>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="container-site flex flex-col gap-3 pb-10">
            <a href="#enquiry" onClick={() => setOpen(false)} className="btn-primary w-full">
              Enquire now
            </a>
            <p className="text-center text-sm text-teal-muted">
              Call / WhatsApp: <span className={ph(c.phone)}>{c.phone}</span>
            </p>
          </div>
        </nav>
      </header>
    </>
  );
}
