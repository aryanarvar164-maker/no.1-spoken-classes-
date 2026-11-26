import type { SiteContent } from "@/content/site";
import { Copy, Media, SectionHeading } from "./ui";

export default function Achievements({ site }: { site: SiteContent }) {
  return (
    <section id="achievements" aria-labelledby="achievements-heading" className="py-20 md:py-28">
      <div className="container-site">
        <SectionHeading
          id="achievements-heading"
          eyebrow="Achievements & testimonials"
          title="Real students. Real milestones."
          intro="Every result shown here is shared with the student's permission."
        />

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
          {site.achievements.map((a, i) => (
            <li key={i} className="card flex flex-col">
              {a.image && (
                <div data-mask className="border-b-2 border-teal">
                  <Media image={a.image} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="aspect-[4/3]" />
                </div>
              )}
              <div className="flex flex-col gap-2 p-6">
                <p className="badge self-start bg-marigold">
                  <Copy value={a.year} />
                </p>
                <h3 className="mt-2 text-2xl font-bold leading-tight">
                  <Copy value={a.achievement} />
                </h3>
                <p className="text-teal-muted">
                  <Copy value={a.student} />
                </p>
                {a.caption && (
                  <p className="mt-2 text-sm leading-relaxed text-teal-muted">
                    <Copy value={a.caption} />
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-16 grid gap-6 md:grid-cols-2" data-stagger>
          {site.testimonials.map((t, i) => (
            <figure key={i} className="flex flex-col gap-5 border-2 border-teal bg-teal p-8 text-cream shadow-hard sm:p-10">
              <span aria-hidden className="font-display text-7xl leading-[0.6] text-marigold">
                “
              </span>
              <blockquote className="text-2xl font-semibold leading-snug">
                <Copy value={t.quote} />
              </blockquote>
              <figcaption className="mt-auto border-t border-cream/25 pt-4 text-sm">
                <span className="font-bold">
                  <Copy value={t.name} />
                </span>
                {t.context && (
                  <span className="text-cream/75">
                    {" · "}
                    <Copy value={t.context} />
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
