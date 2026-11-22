import { site } from "@/content/site";
import { Copy, DraftChip, EnquireButton, SectionHeading } from "./ui";

export default function About() {
  const { about, tutor } = site;
  return (
    <section id="about" aria-labelledby="about-title" className="border-y-2 border-teal bg-cream-200 py-20 md:py-28">
      <div className="container-site">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="flex flex-col gap-8 lg:col-span-7">
            <SectionHeading id="about-title" eyebrow="About the coaching" title={about.heading} />
            <p className="max-w-2xl text-lg leading-relaxed" data-reveal>
              <Copy value={about.body} />
            </p>
          </div>

          <aside className="lg:col-span-5" data-reveal>
            <div className="border-2 border-teal bg-teal p-8 text-cream shadow-hard-lg sm:p-10">
              <p className="eyebrow text-marigold">Meet your tutor</p>
              <p className="mt-4 font-display text-3xl uppercase">
                <Copy value={tutor.name} />
              </p>
              <p className="mt-4 leading-relaxed text-cream/85">
                <Copy value={tutor.intro} />
              </p>
              <blockquote className="mt-6 border-l-4 border-marigold pl-4 text-lg font-semibold">
                <Copy value={tutor.philosophy} />
              </blockquote>
            </div>
          </aside>
        </div>

        <h3 className="sr-only">Our teaching approach</h3>
        <ol className="mt-14 grid gap-[2px] border-2 border-teal bg-teal sm:grid-cols-2 lg:grid-cols-4" data-stagger>
          {about.pillars.map((p, i) => (
            <li key={p.title} className="flex flex-col bg-white p-7">
              <span className="font-display text-5xl text-red">0{i + 1}</span>
              <h4 className="mt-5 text-xl font-bold leading-snug">
                {p.title}
                {p.draft && <DraftChip />}
              </h4>
              <p className="mt-2 leading-relaxed text-teal-muted">{p.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-14 grid items-end gap-10 md:grid-cols-2">
          <div data-reveal>
            <p className="eyebrow">What to expect</p>
            <ul className="mt-5 space-y-4">
              {about.expectations.map((e, i) => (
                <li key={i} className="flex gap-4 text-lg">
                  <span aria-hidden className="mt-2 h-3 w-3 shrink-0 border-2 border-teal bg-marigold" />
                  <Copy value={e} />
                </li>
              ))}
            </ul>
          </div>
          <div className="md:text-right" data-reveal>
            <EnquireButton label="Ask about a batch" />
          </div>
        </div>
      </div>
    </section>
  );
}
