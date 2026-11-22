"use client";

import { useEffect, useRef } from "react";

/**
 * GSAP custom cursor: a precise dot + a lagging ring.
 *  • Grows over links/buttons; shows a label for elements with data-cursor="Label".
 *  • Fades out over form fields so the native text cursor takes over.
 *  • Only runs on mouse/trackpad devices with motion allowed; touch and
 *    reduced-motion users keep the normal cursor.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let cancelled = false;
    let cleanup = () => {};

    import("gsap").then(({ gsap }) => {
      if (cancelled) return;
      const dot = dotRef.current!;
      const ring = ringRef.current!;
      const bubble = bubbleRef.current!;
      const label = labelRef.current!;
      const root = document.documentElement;

      root.classList.add("has-cursor");
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50, autoAlpha: 0 });

      const dotX = gsap.quickTo(dot, "x", { duration: 0.15, ease: "power3" });
      const dotY = gsap.quickTo(dot, "y", { duration: 0.15, ease: "power3" });
      const ringX = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3" });
      const ringY = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3" });

      let visible = false;
      let hovering = false;
      let overField = false;
      let scale = 1;

      const show = (on: boolean) => {
        if (on === visible) return;
        visible = on;
        gsap.to([dot, ring], { autoAlpha: on ? 1 : 0, duration: 0.25, overwrite: "auto" });
      };

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        dotX(e.clientX);
        dotY(e.clientY);
        ringX(e.clientX);
        ringY(e.clientY);
        if (!overField) show(true);
      };

      const onOver = (e: PointerEvent) => {
        const el = e.target as HTMLElement;
        overField = !!el.closest("input, textarea, select");
        if (overField) return show(false);
        show(true);

        const target = el.closest<HTMLElement>("a, button, summary, [data-cursor]");
        const text = target?.dataset.cursor ?? "";
        if (target) {
          hovering = true;
          scale = text ? 2.4 : 1.7;
          label.textContent = text;
          gsap.to(bubble, {
            scale,
            backgroundColor: text ? "rgba(200,55,31,0.95)" : "rgba(242,169,27,0.25)",
            borderColor: text ? "rgba(14,59,61,1)" : "rgba(200,55,31,1)",
            duration: 0.4,
            ease: "power3.out",
            overwrite: "auto",
          });
          gsap.to(label, { autoAlpha: text ? 1 : 0, duration: 0.25 });
          gsap.to(dot, { scale: 0, duration: 0.25 });
        } else if (hovering) {
          hovering = false;
          scale = 1;
          gsap.to(bubble, {
            scale: 1,
            backgroundColor: "rgba(242,169,27,0)",
            borderColor: "rgba(200,55,31,0.9)",
            duration: 0.4,
            ease: "power3.out",
            overwrite: "auto",
          });
          gsap.to(label, { autoAlpha: 0, duration: 0.2 });
          gsap.to(dot, { scale: 1, duration: 0.25 });
        }
      };

      const onDown = () => gsap.to(bubble, { scale: scale * 0.82, duration: 0.15 });
      const onUp = () => gsap.to(bubble, { scale, duration: 0.3, ease: "back.out(3)" });
      const onLeave = () => show(false);

      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerover", onOver, { passive: true });
      window.addEventListener("pointerdown", onDown);
      window.addEventListener("pointerup", onUp);
      document.documentElement.addEventListener("pointerleave", onLeave);

      cleanup = () => {
        root.classList.remove("has-cursor");
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerover", onOver);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
        document.documentElement.removeEventListener("pointerleave", onLeave);
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] hidden md:block">
      <div ref={ringRef} className="invisible fixed left-0 top-0">
        <div
          ref={bubbleRef}
          className="grid h-10 w-10 place-items-center rounded-full border-2 border-red/90"
        >
          <span ref={labelRef} className="invisible text-[0.45rem] font-bold uppercase tracking-[0.14em] text-white" />
        </div>
      </div>
      <div ref={dotRef} className="invisible fixed left-0 top-0 h-2 w-2 rounded-full bg-red" />
    </div>
  );
}
