"use client";

import { useEffect } from "react";

/**
 * All scroll/entrance motion lives here, driven by data attributes in the markup:
 *   [data-hero="line|fade|cta|portrait"]  hero entrance timeline
 *   [data-progress]                        scroll progress bar in the header
 *   [data-split]                           headline words rise in one by one
 *   [data-split-atomic]                    …kept whole inside a split (e.g. gradient words)
 *   [data-reveal] / [data-stagger]         fade/rise into view
 *   [data-mask]                            image clip-path reveal
 *   [data-count="123"]                     number counter
 *   [data-marquee] / [data-spin]           looping band that reacts to scroll speed + direction
 *   [data-video-track]                     video panel travels left → right (desktop, scrubbed, no pinning)
 *   [data-parallax]                        image drifts inside its frame (desktop)
 *   [data-magnetic]                        button is pulled toward the pointer (desktop)
 *
 * Content is fully visible without JS. Reduced-motion users get no animation
 * except the progress bar, which only reflects scroll position.
 */

/** Wraps each word in a mask span, keeping inline elements (and atomic ones) intact. */
function splitWords(el: HTMLElement): HTMLElement[] {
  const words: HTMLElement[] = [];
  const wrap = (content: Node) => {
    const outer = document.createElement("span");
    outer.className = "inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]";
    const inner = document.createElement("span");
    inner.className = "inline-block will-change-transform";
    inner.appendChild(content);
    outer.appendChild(inner);
    words.push(inner);
    return outer;
  };
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = (child.textContent ?? "").split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((p) => {
          if (!p) return;
          frag.appendChild(/^\s+$/.test(p) ? document.createTextNode(p) : wrap(document.createTextNode(p)));
        });
        node.replaceChild(frag, child);
      } else if (child instanceof HTMLElement) {
        if (child.hasAttribute("data-split-atomic")) node.replaceChild(wrap(child.cloneNode(true)), child);
        else walk(child);
      }
    });
  };
  walk(el);
  return words;
}

export default function Motion() {
  useEffect(() => {
    let revert: (() => void) | undefined;
    let cancelled = false;
    const root = document.documentElement;

    (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const mm = gsap.matchMedia();

        // Progress bar — scroll-linked, kept for everyone.
        const bar = document.querySelector("[data-progress]");
        if (bar) {
          gsap.to(bar, {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
          });
        }

        mm.add(
          {
            motion: "(prefers-reduced-motion: no-preference)",
            desktop: "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
            pointer: "(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)",
          },
          (ctx) => {
            const { motion, desktop, pointer } = ctx.conditions as Record<string, boolean>;
            if (!motion) return;
            const cleanups: (() => void)[] = [];

            // ---- Hero entrance ----
            gsap
              .timeline({ defaults: { ease: "power3.out" } })
              .fromTo(
                '[data-hero="portrait"]',
                { autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)" },
                { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power4.out" },
              )
              .fromTo('[data-hero="line"]', { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.15)
              .fromTo('[data-hero="fade"]', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.45)
              .fromTo('[data-hero="cta"]', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.95);
            root.classList.remove("motion");

            const dist = desktop ? 48 : 24;

            // ---- Headline word reveals ----
            gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
              const original = el.innerHTML;
              el.setAttribute("aria-label", el.textContent?.replace(/\s+/g, " ").trim() ?? "");
              const words = splitWords(el);
              words.forEach((w) => w.parentElement?.setAttribute("aria-hidden", "true"));
              gsap.from(words, {
                yPercent: 115,
                                duration: 0.9,
                ease: "power4.out",
                stagger: 0.06,
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              });
              cleanups.push(() => {
                el.innerHTML = original;
                el.removeAttribute("aria-label");
              });
            });

            // ---- Section reveals ----
            gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
              gsap.from(el, {
                autoAlpha: 0,
                y: dist,
                duration: 0.9,
                ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              });
            });

            gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
              gsap.from(group.children, {
                autoAlpha: 0,
                y: dist,
                duration: 0.8,
                ease: "power3.out",
                stagger: desktop ? 0.1 : 0.06,
                scrollTrigger: { trigger: group, start: "top 85%", once: true },
              });
            });

            gsap.utils.toArray<HTMLElement>("[data-mask]").forEach((el) => {
              gsap.from(el, {
                clipPath: "inset(0% 0% 100% 0%)",
                duration: 1.1,
                ease: "power4.out",
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              });
            });

            // ---- Counters ----
            gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
              const end = Number(el.dataset.count);
              if (!Number.isFinite(end)) return;
              const obj = { v: 0 };
              gsap.to(obj, {
                v: end,
                duration: 1.6,
                ease: "power2.out",
                scrollTrigger: { trigger: el, start: "top 90%", once: true },
                onUpdate: () => {
                  el.textContent = Math.round(obj.v).toLocaleString("en-IN");
                },
              });
            });

            // ---- Marquee: endless loop; scroll speeds it up and flips direction ----
            const marquee = document.querySelector<HTMLElement>("[data-marquee]");
            if (marquee) {
              const loop = gsap.to(marquee, { xPercent: -50, duration: desktop ? 40 : 28, ease: "none", repeat: -1 });
              const spins = gsap.to("[data-spin]", { rotate: 360, duration: 8, ease: "none", repeat: -1 });
              let dir = 1;
              ScrollTrigger.create({
                trigger: marquee,
                start: "top bottom",
                end: "bottom top",
                onUpdate: (self) => {
                  dir = self.direction;
                  const boost = Math.min(Math.abs(self.getVelocity()) / 250, 5);
                  loop.timeScale(dir * (1 + boost));
                  spins.timeScale(dir * (1 + boost));
                  // Ease back to cruising speed, keeping the latest direction.
                  gsap.to([loop, spins], { timeScale: dir, duration: 1.2, ease: "power2.out", overwrite: true });
                },
              });
            }

            if (desktop) {
              // ---- Video: left → right travel, scrubbed to scroll (no pin = no scroll-jacking) ----
              const section = document.querySelector<HTMLElement>("[data-video-section]");
              const track = section?.querySelector<HTMLElement>("[data-video-track]");
              if (section && track) {
                gsap.fromTo(
                  track,
                  { xPercent: -38, scale: 0.8 },
                  {
                    xPercent: 0,
                    scale: 1,
                    ease: "none",
                    scrollTrigger: { trigger: section, start: "top 85%", end: "center 55%", scrub: 0.6 },
                  },
                );
                const title = section.querySelector("[data-video-title]");
                if (title) {
                  gsap.fromTo(
                    title,
                    { xPercent: 0 },
                    { xPercent: 8, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true } },
                  );
                }
              }

              // ---- Gallery parallax ----
              gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
                gsap.fromTo(
                  el,
                  { yPercent: -7 },
                  {
                    yPercent: 7,
                    ease: "none",
                    scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
                  },
                );
              });
            }

            if (pointer) {
              // ---- Magnetic buttons ----
              gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((btn) => {
                const x = gsap.quickTo(btn, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
                const y = gsap.quickTo(btn, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
                const onMove = (e: PointerEvent) => {
                  const r = btn.getBoundingClientRect();
                  x((e.clientX - (r.left + r.width / 2)) * 0.2);
                  y((e.clientY - (r.top + r.height / 2)) * 0.2);
                };
                const onLeave = () => {
                  x(0);
                  y(0);
                };
                btn.addEventListener("pointermove", onMove);
                btn.addEventListener("pointerleave", onLeave);
                cleanups.push(() => {
                  btn.removeEventListener("pointermove", onMove);
                  btn.removeEventListener("pointerleave", onLeave);
                });
              });
            }

            return () => cleanups.forEach((fn) => fn());
          },
        );

        revert = () => mm.revert();
      } catch {
        root.classList.remove("motion");
      }
    })();

    const t = window.setTimeout(() => root.classList.remove("motion"), 2500);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      revert?.();
    };
  }, []);

  return null;
}
