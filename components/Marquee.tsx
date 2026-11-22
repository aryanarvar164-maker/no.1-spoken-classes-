const words = ["Speak", "Listen", "Think in English", "Express", "Connect", "Confidence"];

/** Decorative scrolling band. Motion.tsx loops it and reacts to scroll speed/direction. */
export default function Marquee() {
  return (
    <div aria-hidden className="overflow-hidden border-b-2 border-teal bg-red py-4 text-cream">
      <div className="flex w-max will-change-transform" data-marquee>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {words.map((w) => (
              <span key={w} className="flex items-center">
                <span className="px-6 font-display text-3xl uppercase md:px-8 md:text-4xl">{w}</span>
                <span className="block h-2.5 w-2.5 bg-marigold" data-spin />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
