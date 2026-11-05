
import { useEffect, useRef, useState } from "react";

// Icons
function PlayIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.1-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function CloseIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon({ className = "", right = false }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" className={className}>
      <path d={right ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} />
    </svg>
  );
}

// Helpers
const getVideoSrc = (work) =>
  work.videoUrl || work.fullVideoUrl || work.previewUrl || "";

const getThumbnail = (work) => {
  if (work.thumbnail) return work.thumbnail;
  if (work.poster) return work.poster;

  if (work.youtubeId) {
    return `https://img.youtube.com/vi/${work.youtubeId}/hqdefault.jpg`;
  }

  return "";
};

// Video Card
function VideoCard({ work, onOpen }) {
  const videoRef = useRef(null);
  const videoSrc = getVideoSrc(work);
  const thumbnail = getThumbnail(work);

  const isYouTube = Boolean(work.youtubeId);

  const startPreview = () => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    video.play().catch(() => {});
  };

  const stopPreview = () => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();

    try {
      video.currentTime = 0.1;
    } catch {
      console.log("error occured")
    }
  };

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      onFocus={startPreview}
      onBlur={stopPreview}
      aria-label={`Play ${work.title}`}
      className="group w-full overflow-hidden rounded-2xl bg-white
        p-1.5 text-left shadow-sm ring-1 ring-black/5
        transition-all duration-500 hover:-translate-y-1
        hover:shadow-xl focus-visible:outline-2
        focus-visible:outline-orange-500"
    >
      {/* Fixed vertical Reel size */}
      <span className="relative block aspect-[9/16] overflow-hidden
        rounded-xl bg-neutral-950">

        {/* Video first-frame thumbnail */}
        {!isYouTube && videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={thumbnail || undefined}
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={(e) => {
              if (e.currentTarget.currentTime === 0) {
                // The browser displays the first decoded frame.
              }
            }}
            className="absolute inset-0 h-full w-full object-cover
              transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* YouTube thumbnail */}
        {isYouTube && (
          <img
            src={thumbnail}
            alt={work.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover
              transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* Fallback */}
        {!videoSrc && !isYouTube && (
          <div className="absolute inset-0 flex items-center
            justify-center bg-neutral-900 text-white/40">
            No video available
          </div>
        )}

        {/* Overlay */}
        <span className="absolute inset-0 bg-gradient-to-t
          from-black/80 via-black/10 to-black/10
          opacity-80 transition-opacity group-hover:opacity-100" />

        {/* Play button */}
        <span className="absolute left-1/2 top-1/2 flex h-14 w-14
          -translate-x-1/2 -translate-y-1/2 items-center
          justify-center rounded-full border border-white/30
          bg-white/90 text-orange-600 shadow-xl backdrop-blur-md
          transition-all duration-300 group-hover:scale-110
          group-hover:bg-orange-500 group-hover:text-white">
          <PlayIcon className="ml-1 h-6 w-6" />
        </span>

        {/* Duration */}
        {work.duration && (
          <span className="absolute right-3 top-3 rounded-md
            bg-black/60 px-2.5 py-1 text-[11px] font-semibold
            text-white backdrop-blur-md">
            {work.duration}
          </span>
        )}

        {/* Category */}
        {work.category && (
          <span className="absolute left-3 top-3 rounded-md
            bg-white/15 px-2.5 py-1 text-[10px] font-semibold
            uppercase tracking-wider text-white backdrop-blur-md">
            {work.category}
          </span>
        )}

        {/* Title */}
        <span className="absolute inset-x-0 bottom-0 p-4">
          <span className="block text-base font-semibold text-white
            line-clamp-2">
            {work.title}
          </span>

          {work.description && (
            <span className="mt-1 block text-xs text-white/65
              line-clamp-2">
              {work.description}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

// Main Gallery
export default function VideoGallery({
  works = [],
  name = "Portfolio",
  eyebrow = "Video showcase",
}) {
  const [activeIndex, setActiveIndex] = useState(null);

  const activeWork =
    activeIndex !== null ? works[activeIndex] : null;

  // Lock background scroll and keyboard navigation
  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }

      if (event.key === "ArrowRight" && works.length > 1) {
        setActiveIndex((index) => (index + 1) % works.length);
      }

      if (event.key === "ArrowLeft" && works.length > 1) {
        setActiveIndex(
          (index) => (index - 1 + works.length) % works.length
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, works.length]);

  const showPrevious = (e) => {
    e.stopPropagation();
    setActiveIndex(
      (index) => (index - 1 + works.length) % works.length
    );
  };

  const showNext = (e) => {
    e.stopPropagation();
    setActiveIndex((index) => (index + 1) % works.length);
  };

  return (
    <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mb-10 flex flex-col gap-3
          sm:mb-12 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="mb-3 text-xs font-bold uppercase
              tracking-[0.2em] text-orange-600">
              {eyebrow}
            </p>

            <h2 className="text-3xl font-bold tracking-tight
              text-gray-900 sm:text-4xl md:text-5xl">
              Our {name} Videos
            </h2>
          </div>

          <p className="max-w-xs text-sm leading-relaxed
            text-gray-500 sm:text-right">
            Explore our creative work through a collection
            of vertical videos and reels.
          </p>
        </div>

        {/* Uniform Reel Grid */}
        {works.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3
            sm:gap-5 lg:grid-cols-4 lg:gap-6">

            {works.map((work, index) => (
              <VideoCard
                key={work.id || `${work.title}-${index}`}
                work={work}
                onOpen={() => setActiveIndex(index)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed
            border-gray-300 py-20 text-center text-gray-500">
            No videos available yet.
          </div>
        )}
      </div>

      {/* Video Popup */}
      {activeWork && (
        <div
          className="fixed inset-0 z-[100] flex items-center
            justify-center bg-black/35 p-3 backdrop-blur-xl
            sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeWork.title} video player`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setActiveIndex(null);
            }
          }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            aria-label="Close video"
            className="absolute right-4 top-4 z-30 flex h-11 w-11
              items-center justify-center rounded-full
              bg-white/10 text-white backdrop-blur-md
              transition hover:bg-white/25 sm:right-7 sm:top-7"
          >
            <CloseIcon className="h-6 w-6" />
          </button>

          {/* Previous */}
          {works.length > 1 && (
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous video"
              className="absolute left-2 top-1/2 z-30 flex
                h-10 w-10 -translate-y-1/2 items-center
                justify-center rounded-full bg-white/10
                text-white backdrop-blur-md hover:bg-white/25
                sm:left-6 sm:h-12 sm:w-12"
            >
              <ChevronIcon className="h-6 w-6" />
            </button>
          )}

          {/* Next */}
          {works.length > 1 && (
            <button
              type="button"
              onClick={showNext}
              aria-label="Next video"
              className="absolute right-2 top-1/2 z-30 flex
                h-10 w-10 -translate-y-1/2 items-center
                justify-center rounded-full bg-white/10
                text-white backdrop-blur-md hover:bg-white/25
                sm:right-6 sm:h-12 sm:w-12"
            >
              <ChevronIcon right className="h-6 w-6" />
            </button>
          )}

          {/* Fixed 9:16 popup */}
          <div className="w-[min(82vw,calc(82svh*9/16),460px)]
            overflow-hidden rounded-2xl border border-white/15
            bg-neutral-950 shadow-2xl">

            <div className="relative aspect-[9/16] w-full bg-black">

              {activeWork.youtubeId ? (
                <iframe
                  key={activeWork.id || activeIndex}
                  src={`https://www.youtube.com/embed/${activeWork.youtubeId}?autoplay=1&rel=0&playsinline=1`}
                  title={activeWork.title}
                  className="absolute inset-0 h-full w-full"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  key={activeWork.id || activeIndex}
                  src={getVideoSrc(activeWork)}
                  poster={getThumbnail(activeWork) || undefined}
                  className="absolute inset-0 h-full w-full object-contain"
                  controls
                  autoPlay
                  playsInline
                  controlsList="nodownload"
                />
              )}
            </div>
          </div>

          {/* Video information */}
          <div className="absolute bottom-3 left-0 right-0
            px-4 text-center sm:bottom-5">
            <h3 className="text-sm font-semibold text-white sm:text-base">
              {activeWork.title}
            </h3>

            <p className="mt-1 text-xs text-white/50">
              {activeIndex + 1} / {works.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
