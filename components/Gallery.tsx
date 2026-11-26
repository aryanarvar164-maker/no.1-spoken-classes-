import type { SiteContent } from "@/content/site";
import { Copy, Media, SectionHeading, cx } from "./ui";

// Desktop rhythm: a few wide / tall tiles so the grid doesn't look uniform.
const spans = ["md:col-span-2 md:row-span-2", "", "", "md:row-span-2", "", "md:col-span-2", "", ""];

export default function Gallery({ site }: { site: SiteContent }) {
  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="bg-teal py-20 text-cream md:py-28">
      <div className="container-site">
        <div className="flex flex-col justify-between gap-6 border-b-2 border-cream/30 pb-6 md:flex-row md:items-end">
          <SectionHeading id="gallery-heading" eyebrow="Gallery" title="Moments from the classroom" tone="dark" />
          <p className="text-sm text-cream/70 md:hidden" aria-hidden>
            Swipe →
          </p>
        </div>
      </div>

      {/* Mobile: swipeable row (scrolls inside itself — the page never overflows). Desktop: grid. */}
      <ul
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:px-8 md:mx-auto md:grid md:max-w-site md:auto-rows-[220px] md:grid-cols-4 md:overflow-visible md:px-8 lg:auto-rows-[250px] lg:px-10"
        data-stagger
        aria-label="Photo gallery"
      >
        {site.gallery.map((img, i) => (
          <li
            key={i}
            className={cx(
              "group relative w-[78vw] shrink-0 snap-center overflow-hidden border-2 border-cream sm:w-[55vw] md:w-auto",
              spans[i % spans.length],
            )}
          >
            <figure className="h-full overflow-hidden">
              <div className="h-full md:scale-[1.15]" data-parallax>
                <Media
                  image={img}
                  tone="dark"
                  sizes="(min-width: 768px) 25vw, 78vw"
                  className="aspect-[4/5] h-full transition-transform duration-700 group-hover:scale-105 md:aspect-auto"
                />
              </div>
              {img.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 border-t-2 border-cream bg-teal px-4 py-2 text-sm">
                  <Copy value={img.caption} />
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
