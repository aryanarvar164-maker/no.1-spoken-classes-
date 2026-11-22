import { site } from "@/content/site";
import { Copy, EnquireButton, Media } from "./ui";

export default function Hero() {
  const { tutor } = site;
  return (
    <section id="top" aria-labelledby="hero-title" className="relative">
      <div className="container-site grid items-center gap-12 py-12 md:grid-cols-12 md:gap-10 md:py-16 lg:py-20">
        <div className="order-2 flex flex-col gap-6 md:order-1 md:col-span-7">
          {site.admissionBadge && (
            <p className="badge self-start bg-marigold" data-hero="fade">
              <Copy value={site.admissionBadge} />
            </p>
          )}

          <h1 id="hero-title" className="display text-display-xl">
            <span className="block overflow-hidden">
              <span className="block" data-hero="line">Speak English</span>
            </span>
            <span className="block overflow-hidden">
              <span className="block text-red" data-hero="line">with confidence.</span>
            </span>
          </h1>

          <p lang="hi" className="text-2xl font-semibold text-teal-muted" data-hero="fade">
            {site.taglineHi}
          </p>
          <p className="max-w-lg text-lg leading-relaxed" data-hero="fade">
            {site.description}
          </p>

          <div className="flex flex-wrap items-center gap-3" data-hero="cta">
            <EnquireButton />
            <a href="#batches" className="btn-secondary" data-magnetic>
              View batch timings
            </a>
          </div>
        </div>

        <div className="order-1 md:order-2 md:col-span-5">
          <figure className="relative mx-auto max-w-sm md:max-w-none" data-hero="portrait">
            <div aria-hidden className="halftone absolute inset-0 translate-x-3.5 translate-y-3.5 border-2 border-teal" />
            <Media
              image={tutor.portrait}
              priority
              sizes="(min-width: 768px) 40vw, 90vw"
              className="aspect-[4/5] border-2 border-teal"
            />
            <figcaption className="relative -mt-0.5 flex items-baseline justify-between gap-3 border-2 border-teal bg-teal px-4 py-3 text-cream">
              <span className="font-display text-xl uppercase">
                <Copy value={tutor.name} />
              </span>
              <span className="text-sm">
                {tutor.role} · <Copy value={tutor.experience} />
              </span>
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-teal text-cream">
        <div className="container-site">
          <dl className="grid grid-cols-2 gap-px bg-cream/20 lg:grid-cols-4" data-stagger>
            {site.stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse gap-0.5 bg-teal px-4 py-5 sm:px-6 sm:py-6">
                <dt className="text-[0.95rem]">{s.label}</dt>
                <dd className="font-display text-4xl text-marigold sm:text-5xl">
                  {s.value === null ? (
                    <span className="ph text-cream/70" title="Add a verified number in content/site.ts">
                      —
                    </span>
                  ) : (
                    <>
                      <span data-count={s.value}>{s.value}</span>
                      {s.suffix}
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
