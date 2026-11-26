import type { BatchStatus, SiteContent } from "@/content/site";
import { Copy, SectionHeading, cx } from "./ui";

const statusMeta: Record<BatchStatus, { label: string; head: string }> = {
  open: { label: "Admissions open", head: "bg-marigold" },
  "few-seats": { label: "Few seats left", head: "bg-blush" },
  "starting-soon": { label: "Starting soon", head: "bg-mint" },
  full: { label: "Batch full", head: "bg-cream-300" },
};

export default function Batches({ site }: { site: SiteContent }) {
  return (
    <section id="batches" aria-labelledby="batches-heading" className="border-y-2 border-teal bg-cream-200 py-20 md:py-28">
      <div className="container-site">
        <div className="flex flex-col justify-between gap-6 border-b-2 border-teal pb-6 md:flex-row md:items-end">
          <SectionHeading id="batches-heading" eyebrow="Running batches" title="Batch timings" />
          <p className="max-w-sm text-teal-muted md:pb-2" data-reveal>
            Seats are allotted in order of enquiry. Pick a batch and we&apos;ll call you back with details.
          </p>
        </div>

        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-stagger>
          {site.batches.map((b) => {
            const s = statusMeta[b.status];
            return (
              <li key={b.id} className="card flex flex-col">
                <div className={cx("flex items-center justify-between gap-3 border-b-2 border-teal px-5 py-4", s.head)}>
                  <h3 className="font-display text-2xl uppercase leading-none">
                    <Copy value={b.title} />
                  </h3>
                  <span className="text-right text-xs font-bold uppercase tracking-[0.08em]">{s.label}</span>
                </div>

                <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 px-5 py-5 text-[0.95rem]">
                  <Row label="Level" value={b.level} />
                  <Row label="Timing" value={b.schedule} />
                  <Row label="Starts" value={b.startDate} />
                  <Row label="Mode" value={b.mode} />
                  {b.seats && <Row label="Seats" value={b.seats} />}
                  {b.fee && <Row label="Fee" value={b.fee} />}
                </dl>

                <div className="mt-auto px-5 pb-5">
                  <a href="#enquiry" data-batch={b.id} data-cursor="Enquire" className="btn-dark w-full">
                    {b.status === "full" ? "Join the waitlist" : "Enquire for this batch"}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-teal-muted">{label}</dt>
      <dd className="font-semibold">
        <Copy value={value} />
      </dd>
    </>
  );
}
