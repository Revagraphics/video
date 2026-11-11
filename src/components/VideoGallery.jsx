
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

function MobileVideoCard({ work, index, total, isMuted, onToggleMute }) {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoSrc = getVideoSrc(work);
  const thumbnail = getThumbnail(work);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting && entry.intersectionRatio >= 0.65),
      { threshold: [0, 0.65, 1] }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [isActive]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    if (videoRef.current) videoRef.current.muted = nextMuted;
    onToggleMute(nextMuted);
  };

  return (
    <article
      ref={cardRef}
      data-video-index={index}
      className="relative h-screen h-[100dvh] w-full snap-start snap-always
        overflow-hidden bg-black"
      aria-label={`${work.title}, video ${index + 1} of ${total}`}
    >
      {!work.youtubeId && videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={thumbnail || undefined}
          muted={isMuted}
          loop
          playsInline
          preload="none"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlayback}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {work.youtubeId && isActive && (
        <iframe
          src={`https://www.youtube.com/embed/${work.youtubeId}?autoplay=1&mute=1&rel=0&playsinline=1`}
          title={work.title}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )}

      {!videoSrc && !work.youtubeId && (
        <div className="absolute inset-0 flex items-center justify-center text-white/60">
          No video available
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t
        from-black/75 via-transparent to-black/20" />

      {!work.youtubeId && (
        <>
          <button
            type="button"
            onClick={togglePlayback}
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className={`absolute left-1/2 top-1/2 z-10 flex h-16 w-16
              -translate-x-1/2 -translate-y-1/2 items-center justify-center
              rounded-full bg-black/45 text-white backdrop-blur-sm
              transition-opacity ${isPlaying ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            <PlayIcon className="ml-1 h-8 w-8" />
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Turn sound on" : "Mute video"}
            className="absolute right-4 top-[calc(env(safe-area-inset-top)+1rem)]
              z-20 flex h-11 w-11 items-center justify-center rounded-full
              bg-black/40 text-white backdrop-blur-md"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              {isMuted ? (
                <path d="m17 9 4 6m0-6-4 6" />
              ) : (
                <>
                  <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                  <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                </>
              )}
            </svg>
          </button>
        </>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10
        px-5 pb-[calc(env(safe-area-inset-bottom)+5rem)] text-white">
        {work.category && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            {work.category}
          </p>
        )}
        <h2 className="text-xl font-bold sm:text-2xl">{work.title}</h2>
        {work.description && (
          <p className="mt-2 line-clamp-3 max-w-lg text-sm text-white/80">
            {work.description}
          </p>
        )}
      </div>
    </article>
  );
}

function MobileVideoShowcase({ works, name, eyebrow }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const feedRef = useRef(null);

  useEffect(() => {
    if (activeIndex === null) return;

    const activeCard = feedRef.current?.querySelector(
      `[data-video-index="${activeIndex}"]`
    );
    activeCard?.scrollIntoView({ block: "start" });
  }, [activeIndex]);

  return (
    <main aria-label="Video showcase" className="bg-gray-50 px-4 py-10 sm:hidden">
      <header className="mb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
          {eyebrow}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Our {name} Videos
        </h1>
      </header>
      {works.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {works.map((work, index) => (
            <VideoCard
              key={work.id || `${work.title}-${index}`}
              work={work}
              onOpen={() => setActiveIndex(index)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-gray-500">
          No videos available yet.
        </div>
      )}

      {activeIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black">
          <div
            ref={feedRef}
            className="h-full snap-y snap-mandatory overflow-y-auto
              overscroll-y-contain"
          >
            {works.map((work, index) => (
              <MobileVideoCard
                key={work.id || `${work.title}-${index}`}
                work={work}
                index={index}
                total={works.length}
                isMuted={isMuted}
                onToggleMute={setIsMuted}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            aria-label="Back to video grid"
            className="absolute left-4 top-[calc(env(safe-area-inset-top)+1rem)]
              z-20 flex h-11 w-11 items-center justify-center rounded-full
              bg-black/40 text-white backdrop-blur-md"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
      )}
    </main>
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
    <>
    <MobileVideoShowcase works={works} name={name} eyebrow={eyebrow} />
    <section className="hidden bg-gray-50 py-16 sm:block sm:py-20 lg:py-24">
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

            {/* <p className="mt-1 text-xs text-white/50">
              {activeIndex + 1} / {works.length}
            </p> */}
          </div>
        </div>
      )}
    </section>
    </>
  );
}
