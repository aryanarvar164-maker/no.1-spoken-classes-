import { isPlaceholder, site } from "@/content/site";
import { Copy } from "./ui";
import EnquiryForm from "./EnquiryForm";

export default function Enquiry() {
  const c = site.contact;
  return (
    <section id="enquiry" aria-labelledby="enquiry-title" className="py-20 md:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow" data-reveal>
            Enquiry
          </p>
          <h2 id="enquiry-title" className="display mt-4 text-display-lg" data-split>
            Book your seat
          </h2>
          <p className="mt-5 max-w-md text-lg text-teal-muted" data-reveal>
            Tell us a little about yourself and we&apos;ll call you back with batch details.
          </p>

          <dl className="mt-10 border-2 border-teal bg-white" data-stagger>
            <Contact label="Phone">
              {isPlaceholder(c.phone) ? <Copy value={c.phone} /> : <a href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a>}
            </Contact>
            <Contact label="WhatsApp">
              {c.whatsappDigits ? <a href={`https://wa.me/${c.whatsappDigits}`}>{c.whatsapp}</a> : <Copy value={c.whatsapp} />}
            </Contact>
            <Contact label="Email">
              {isPlaceholder(c.email) ? <Copy value={c.email} /> : <a href={`mailto:${c.email}`}>{c.email}</a>}
            </Contact>
            <Contact label="Visit" last>
              <Copy value={c.address} />
              {c.mapUrl && (
                <a href={c.mapUrl} className="mt-1 block font-bold text-red underline underline-offset-4">
                  Open in Maps
                </a>
              )}
            </Contact>
          </dl>

          <div className="mt-12" data-reveal>
            <h3 className="font-display text-2xl uppercase">Questions students ask</h3>
            <div className="mt-4 border-y-2 border-teal">
              {site.faqs.map((f, i) => (
                <details key={i} className="group border-teal/20 py-4 [&:not(:last-child)]:border-b">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                    <Copy value={f.q} />
                    <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center border-2 border-teal font-bold transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-teal-muted">
                    <Copy value={f.a} />
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <div className="relative lg:col-span-7" data-reveal>
          <EnquiryForm />
        </div>
      </div>
    </section>
  );
}

function Contact({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={"grid grid-cols-[6.5rem_1fr] gap-4 px-5 py-4 " + (last ? "" : "border-b-2 border-teal/15")}>
      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-teal-muted">{label}</dt>
      <dd className="font-semibold [&_a:hover]:text-red [&_a]:underline [&_a]:underline-offset-4">{children}</dd>
    </div>
  );
}
