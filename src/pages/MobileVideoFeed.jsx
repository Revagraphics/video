import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/api";
import { formatDuration, getPlaySrc, getPoster } from "../utils/media";

function PlayIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.1-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function CloseIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ShareIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
      <path d="m16 6-4-4-4 4M12 2v14" />
    </svg>
  );
}

function MobileVideoCard({
  work,
  index,
  total,
  isMuted,
  onToggleMute,
  onShare,
  onActivate,
  onNeedMore,
}) {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [isNear, setIsNear] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useOriginal, setUseOriginal] = useState(false);
  const poster = getPoster(work, 480);
  const src = useOriginal ? work.videoUrl : getPlaySrc(work);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;

    const activeObserver = new IntersectionObserver(
      ([entry]) => {
        const active = entry.isIntersecting && entry.intersectionRatio >= 0.65;
        setIsActive(active);
        if (active) onActivate(index);
      },
      { threshold: [0, 0.65, 1] },
    );
    const nearObserver = new IntersectionObserver(
      ([entry]) => setIsNear(entry.isIntersecting),
      { rootMargin: "100% 0px" },
    );

    activeObserver.observe(card);
    nearObserver.observe(card);
    return () => {
      activeObserver.disconnect();
      nearObserver.disconnect();
    };
  }, [index, onActivate]);

  useEffect(() => {
    if (isNear && index >= total - 2) onNeedMore();
  }, [isNear, index, total, onNeedMore]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [isActive, isNear]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  };

  return (
    <article
      ref={cardRef}
      data-video-index={index}
      className="relative h-[100dvh] w-full snap-start snap-always
        overflow-hidden bg-black"
      aria-label={`${work.title}, video ${index + 1} of ${total}`}
    >
      {poster && (
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}

      {work.videoUrl ? (
        <video
          ref={videoRef}
          src={isNear ? src : undefined}
          poster={poster || undefined}
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlayback}
          onError={() => !useOriginal && setUseOriginal(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white/60">
          No video available
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t
        from-black/75 via-transparent to-black/20" />

      <button
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pause video" : "Play video"}
        className={`absolute left-1/2 top-1/2 z-10 flex h-16 w-16
          -translate-x-1/2 -translate-y-1/2 items-center justify-center
          rounded-full bg-black/45 text-white transition-opacity
          ${isPlaying ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        <PlayIcon className="ml-1 h-8 w-8" />
      </button>

      <div className="absolute right-4 top-[calc(env(safe-area-inset-top)+1rem)]
        z-20 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onToggleMute(!isMuted)}
          aria-label={isMuted ? "Turn sound on" : "Mute video"}
          className="flex h-11 w-11 items-center justify-center rounded-full
            bg-black/40 text-white"
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
        <button
          type="button"
          onClick={() => onShare(work)}
          aria-label="Share video"
          className="flex h-11 w-11 items-center justify-center rounded-full
            bg-black/40 text-white"
        >
          <ShareIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10
        px-5 pb-[calc(env(safe-area-inset-bottom)+5rem)] text-white">
        {work.category && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            {work.category}
          </p>
        )}
        <h1 className="text-xl font-bold sm:text-2xl">{work.title}</h1>
        {work.description && (
          <p className="mt-2 line-clamp-3 max-w-lg text-sm text-white/80">
            {work.description}
          </p>
        )}
        {formatDuration(work.duration) && (
          <p className="mt-2 text-xs text-white/70">{formatDuration(work.duration)}</p>
        )}
      </div>
    </article>
  );
}

export default function MobileVideoFeed({ initialWorks, initialIndex, initialNextCursor }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [works, setWorks] = useState(initialWorks);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(true);
  const [notice, setNotice] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const feedRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const didInitialScroll = useRef(false);
  const backgroundLocation = location.state?.backgroundLocation;

  const activateIndex = useCallback((index) => {
    setActiveIndex((current) => (current === index ? current : index));
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMoreRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadError("");

    try {
      const page = await api.getVideos({ cursor: nextCursor, limit: 12 });
      setWorks((current) => {
        const seen = new Set(current.map((work) => work.id));
        return [...current, ...page.videos.filter((work) => !seen.has(work.id))];
      });
      setNextCursor(page.nextCursor);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [nextCursor]);

  useEffect(() => {
    if (didInitialScroll.current) return;
    const card = feedRef.current?.querySelector(
      `[data-video-index="${initialIndex}"]`,
    );
    if (!card) return;

    card.scrollIntoView({ block: "start" });
    didInitialScroll.current = true;
  }, [initialIndex]);

  useEffect(() => {
    const work = works[activeIndex];
    if (!work || work.id === id) return;

    navigate(`/video/${work.id}`, {
      replace: true,
      state: {
        backgroundLocation,
        mobileFeed: works,
        mobileStartIndex: activeIndex,
        mobileNextCursor: nextCursor,
      },
    });
  }, [activeIndex, backgroundLocation, id, navigate, nextCursor, works]);

  useEffect(() => {
    const work = works[activeIndex];
    if (!work?.title) return undefined;

    const previousTitle = document.title;
    document.title = work.title;
    return () => {
      document.title = previousTitle;
    };
  }, [activeIndex, works]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 1800);
    return () => clearTimeout(timer);
  }, [notice]);

  const handleShare = async (work) => {
    const url = `${window.location.origin}/video/${work.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: work.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setNotice("Link copied");
      }
    } catch {
      // Share sheet closed or clipboard blocked.
    }
  };

  return (
    <main className="fixed inset-0 z-50 h-[100dvh] bg-black">
      <div
        ref={feedRef}
        className="h-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain"
      >
        {works.map((work, index) => (
          <MobileVideoCard
            key={work.id}
            work={work}
            index={index}
            total={works.length}
            isMuted={isMuted}
            onToggleMute={setIsMuted}
            onShare={handleShare}
            onActivate={activateIndex}
            onNeedMore={loadMore}
          />
        ))}
        {loadingMore && (
          <div className="flex h-16 items-center justify-center text-sm text-white/70">
            Loading more videos...
          </div>
        )}
        {loadError && (
          <div className="flex h-16 items-center justify-center gap-3 text-sm text-white">
            <span>{loadError}</span>
            <button type="button" onClick={loadMore} className="underline">
              Retry
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Back to video gallery"
        className="absolute left-4 top-[calc(env(safe-area-inset-top)+1rem)]
          z-30 flex h-11 w-11 items-center justify-center rounded-full
          bg-black/40 text-white"
      >
        <CloseIcon className="h-6 w-6" />
      </button>

      {notice && (
        <p role="status" className="absolute inset-x-0 bottom-24 z-30 mx-auto
          w-fit rounded-full bg-black/70 px-4 py-2 text-sm text-white">
          {notice}
        </p>
      )}
    </main>
  );
}
