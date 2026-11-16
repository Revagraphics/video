import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { formatDuration, getPoster } from "../utils/media";

function PlayIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.1-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function VideoCard({ work, works, index, nextCursor }) {
  const location = useLocation();
  const [imageFailed, setImageFailed] = useState(false);
  const poster = getPoster(work, 480);
  const duration = formatDuration(work.duration);

  return (
    <Link
      to={`/video/${work.id}`}
      state={{
        backgroundLocation: location,
        mobileFeed: works,
        mobileStartIndex: index,
        mobileNextCursor: nextCursor,
      }}
      aria-label={`Play ${work.title}`}
      className="group block w-full overflow-hidden rounded-2xl bg-white p-1.5
        text-left shadow-sm ring-1 ring-black/5 transition-all duration-500
        hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2
        focus-visible:outline-orange-500"
    >
      <span className="relative block aspect-[9/16] overflow-hidden rounded-xl bg-neutral-950">
        {poster && !imageFailed ? (
          <img
            src={poster}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="absolute inset-0 h-full w-full object-cover
              transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 bg-neutral-900" />
        )}

        <span className="absolute inset-0 bg-gradient-to-t from-black/80
          via-black/10 to-black/10 opacity-80 transition-opacity group-hover:opacity-100" />

        <span className="absolute left-1/2 top-1/2 flex h-14 w-14
          -translate-x-1/2 -translate-y-1/2 items-center justify-center
          rounded-full border border-white/30 bg-white/90 text-orange-600
          shadow-xl transition-all duration-300 group-hover:scale-110
          group-hover:bg-orange-500 group-hover:text-white">
          <PlayIcon className="ml-1 h-6 w-6" />
        </span>

        {duration && (
          <span className="absolute right-3 top-3 rounded-md bg-black/60
            px-2.5 py-1 text-[11px] font-semibold text-white">
            {duration}
          </span>
        )}

        {work.category && (
          <span className="absolute left-3 top-3 rounded-md bg-black/40
            px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            {work.category}
          </span>
        )}

        <span className="absolute inset-x-0 bottom-0 p-4">
          <span className="block text-base font-semibold text-white line-clamp-2">
            {work.title}
          </span>
          {work.description && (
            <span className="mt-1 block text-xs text-white/65 line-clamp-2">
              {work.description}
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}

export default function VideoGallery({
  works = [],
  name = "Portfolio",
  eyebrow = "Video showcase",
  nextCursor = null,
}) {
  return (
    <section className="bg-gray-50 py-10 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:mb-12 sm:flex-row
          sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em]
              text-orange-600 sm:mb-3">
              {eyebrow}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900
              sm:text-4xl md:text-5xl">
              Our {name} Videos
            </h1>
          </div>

          <p className="max-w-xs text-sm leading-relaxed text-gray-500 sm:text-right">
            Explore our creative work through a collection of vertical videos and reels.
          </p>
        </div>

        {works.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {works.map((work, index) => (
              <VideoCard
                key={work.id}
                work={work}
                works={works}
                index={index}
                nextCursor={nextCursor}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300
            py-20 text-center text-gray-500">
            No videos available yet.
          </div>
        )}
      </div>
    </section>
  );
}
