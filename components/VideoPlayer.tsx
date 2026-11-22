"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Muted, looping inline video that only plays while on screen,
 * never autoplays for reduced-motion users, and has a visible play/pause control.
 * The file isn't requested until the player is near the viewport, and phones get the smaller source.
 */
export default function VideoPlayer({
  sources,
  poster,
  label,
}: {
  sources: { mobile: string; desktop: string };
  poster?: string;
  label: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const load = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || v.getAttribute("src")) return;
        v.src = window.matchMedia("(min-width: 768px)").matches ? sources.desktop : sources.mobile;
        load.disconnect();
      },
      { rootMargin: "600px 0px" },
    );
    load.observe(v);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!reduce && !userPaused.current) v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(v);

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      io.disconnect();
      load.disconnect();
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [sources.desktop, sources.mobile]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => {});
    } else {
      userPaused.current = true;
      v.pause();
    }
  };

  return (
    <div className="relative h-full w-full">
      <video
        ref={ref}
        className="h-full w-full object-cover"
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center border-2 border-cream bg-teal text-cream transition hover:bg-red"
        aria-label={playing ? "Pause video" : "Play video"}
      >
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></svg>
        )}
      </button>
    </div>
  );
}
