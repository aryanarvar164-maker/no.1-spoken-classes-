import Image from "next/image";
import { isPlaceholder, type ImageAsset } from "@/content/site";
import { toPublicId } from "@/lib/cloudinary";
import CldImage from "./CldImage";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export { cx };

/** Renders content text; placeholders ([like this]) get a dashed marker. */
export function Copy({ value, className }: { value: string; className?: string }) {
  if (isPlaceholder(value)) {
    return (
      <span className={cx("ph", className)} title="Placeholder — replace it in the owner editor">
        {value}
      </span>
    );
  }
  return <span className={className}>{value}</span>;
}

export function DraftChip({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="ml-2 inline-block border border-flag px-1.5 py-0.5 align-middle font-sans text-[0.6rem] font-bold uppercase tracking-widest text-flag">
      Draft
    </span>
  );
}

/** Cloudinary (public ID) or next/image (/public path) when a src exists, otherwise a labelled placeholder tile. */
export function Media({
  image,
  className,
  sizes = "100vw",
  priority = false,
  tone = "light",
}: {
  image: ImageAsset;
  className?: string;
  sizes?: string;
  priority?: boolean;
  tone?: "dark" | "light";
}) {
  const publicId = toPublicId(image.src);
  if (publicId) {
    return (
      <div className={cx("relative overflow-hidden", className)}>
        <CldImage publicId={publicId} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  if (image.src) {
    return (
      <div className={cx("relative overflow-hidden", className)}>
        <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={`${image.alt} (photo to be added)`}
      className={cx(
        "relative grid place-items-center overflow-hidden",
        tone === "dark" ? "bg-teal-700 text-cream/70" : "bg-cream-300 text-teal-muted",
        className,
      )}
    >
      <span className="mx-4 border-2 border-dashed border-current px-3 py-1 text-center text-xs font-bold uppercase tracking-[0.12em]">
        Add photo · {image.alt}
      </span>
    </div>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  tone = "light",
  className,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  intro?: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={cx("flex flex-col gap-4", className)}>
      <p className={cx("eyebrow", dark && "text-marigold")} data-reveal>
        {eyebrow}
      </p>
      <h2 id={id} className="display text-display-lg" data-split>
        {title}
      </h2>
      {intro && (
        <p className={cx("max-w-xl text-lg leading-relaxed", dark ? "text-cream/80" : "text-teal-muted")} data-reveal>
          <Copy value={intro} />
        </p>
      )}
    </div>
  );
}

export function EnquireButton({ className, label = "Enquire for a batch" }: { className?: string; label?: string }) {
  return (
    <a href="#enquiry" className={cx("btn-primary", className)} data-magnetic data-cursor="Enquire">
      {label}
    </a>
  );
}
