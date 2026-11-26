import { nav, type SiteContent } from "@/content/site";
import { Copy } from "./ui";

export default function Footer({ site }: { site: SiteContent }) {
  return (
    <footer className="border-t-2 border-teal bg-teal-900 text-cream">
      <div className="container-site py-16">
        <p className="display text-display-lg" data-split>
          Speak English <span className="text-marigold">with confidence.</span>
        </p>
        <p lang="hi" className="mt-3 text-xl font-semibold text-cream/80">
          {site.taglineHi}
        </p>

        <div className="mt-12 grid gap-10 border-t border-cream/20 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-xl uppercase">{site.name}</p>
            <p className="mt-2 text-sm text-cream/75">
              <Copy value={site.contact.address} />
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-cream/80 hover:text-marigold">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="text-sm text-cream/80">
            <p>
              <Copy value={site.contact.phone} />
            </p>
            <p className="mt-1">
              <Copy value={site.contact.hours} />
            </p>
          </div>
          <div className="text-sm">
            <a href={site.contact.instagram} rel="noopener" data-cursor="Open" className="inline-flex items-center gap-2 text-cream/80 hover:text-marigold">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              @no.01_spoken_english_classes
            </a>
          </div>
        </div>


        
<div className="mt-12 flex flex-col justify-between gap-5 border-t border-cream/20 pt-6 text-xs text-cream/60 sm:flex-row sm:items-center">
  

  {/* Developer profile - centered */}
  <div className="flex items-center gap-3">
    <img
      src="../media/aryan-profile.png"
      alt="Aryan Narvar"
      className="h-10 w-10 rounded-full border border-cream/30 object-cover"
    />

    <div>
      <p className="text-[11px] text-cream/60">
        Designed & Developed by
      </p>
      <a
        href="https://www.linkedin.com/in/aryan-narvar-457937405/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-cream transition-colors hover:text-marigold"
      >
        Aryan Narvar ↗
      </a>
    </div>
  </div>

  <a href="#top" className="hover:text-cream">
    Back to top ↑
  </a>
</div>

<div className="mt-6 flex flex-col justify-between gap-5 border-t border-cream/20 pt-6 text-xs text-cream/60 sm:flex-row sm:items-center">
  <p>
    © {new Date().getFullYear()} {site.name}. All rights reserved.
  </p>
  </div>


      </div>
    </footer>
  );
}
