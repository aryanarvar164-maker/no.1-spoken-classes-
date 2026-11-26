import type { SiteContent } from "@/content/site";
import { Copy, Media, SectionHeading } from "./ui";
import VideoPlayer from "./VideoPlayer";
import { cldImage, cldVideo, cldVideoPoster, toPublicId } from "@/lib/cloudinary";

export default function VideoSection({ site }: { site: SiteContent }) {
  const { video } = site;
  const videoId = toPublicId(video.src);
  const posterId = toPublicId(video.poster.src);
  // Cloudinary: smaller file for phones, full HD for larger screens, poster from the video if none is set.
  const sources = videoId
    ? { mobile: cldVideo(videoId, 720), desktop: cldVideo(videoId, 1600) }
    : video.src
      ? { mobile: video.src, desktop: video.src }
      : null;
  const poster = posterId
    ? cldImage(posterId, { width: 1600 })
    : video.poster.src ?? (videoId ? cldVideoPoster(videoId) : undefined);

  return (
    <section id="videos" aria-labelledby="videos-title" className="overflow-hidden py-20 md:py-28" data-video-section>
      <div className="container-site">
        <div className="flex flex-col justify-between gap-6 border-b-2 border-teal pb-6 md:flex-row md:items-end">
          <SectionHeading id="videos-title" eyebrow="The coaching film" title={video.title} />
          <p className="max-w-sm text-teal-muted md:pb-2" data-reveal>
            <Copy value={video.caption} />
          </p>
        </div>

        {/* The panel travels left → right into place as the section scrolls in (desktop). */}
        <div className="mt-10 md:mt-14">
          <div
            className="relative aspect-[4/5] overflow-hidden border-2 border-teal bg-teal shadow-hard-lg will-change-transform sm:aspect-video"
            data-video-track
            data-cursor={sources ? "Play" : undefined}
          >
            {sources ? (
              <VideoPlayer sources={sources} poster={poster} label={video.title} />
            ) : (
              <div className="relative h-full w-full">
                <Media image={video.poster} tone="dark" className="absolute inset-0" sizes="100vw" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <span className="grid h-20 w-20 place-items-center rounded-full border-2 border-cream bg-red text-white">
                      <svg width="22" height="22" viewBox="0 0 16 16" aria-hidden>
                        <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
                      </svg>
                    </span>
                    <span className="ph text-sm text-cream">[Add the coaching video in the owner editor]</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
