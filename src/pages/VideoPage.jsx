import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/api";
import { formatDuration, getPlaySrc, getPoster } from "../utils/media";
import MobileVideoFeed from "./MobileVideoFeed";

const MOBILE_QUERY = "(max-width: 639px)";

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
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

export default function VideoPage({ isModal = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const mobileWorks = location.state?.mobileFeed;
  const hasMobileFeed = isModal && isMobile && Array.isArray(mobileWorks) && mobileWorks.length > 0;
  const mobileStartIndex = Number.isInteger(location.state?.mobileStartIndex)
    ? location.state.mobileStartIndex
    : 0;
  const [video, setVideo] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (hasMobileFeed) return undefined;

    let active = true;

    setVideo(null);
    setError("");

    api.getVideo(id)
      .then((item) => active && setVideo(item))
      .catch((requestError) => active && setError(requestError.message));

    return () => {
      active = false;
    };
  }, [hasMobileFeed, id]);

  useEffect(() => {
    if (!video?.title) return undefined;

    const previousTitle = document.title;
    document.title = video.title;
    return () => {
      document.title = previousTitle;
    };
  }, [video]);

  useEffect(() => {
    if (!isModal) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isModal]);

  const share = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: video.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Share sheet closed or clipboard blocked.
    }
  };

  const close = () => navigate(-1);
  const duration = video ? formatDuration(video.duration) : "";

  const videoElement = video && (
    <video
      src={getPlaySrc(video)}
      poster={getPoster(video) || undefined}
      className="h-full w-full object-cover sm:object-contain"
      controls
      autoPlay
      playsInline
      muted={isMuted}
      preload="metadata"
      controlsList="nodownload"
    />
  );

  const playerActions = video && (
    <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2
      flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => setIsMuted((current) => !current)}
        aria-label={isMuted ? "Turn sound on" : "Mute video"}
        className="flex h-11 w-11 items-center justify-center rounded-full
          bg-black/65 text-white shadow-lg hover:bg-black/85
          focus-visible:outline-2 focus-visible:outline-orange-500"
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
        onClick={share}
        aria-label={copied ? "Link copied" : "Share video"}
        className="flex h-11 w-11 items-center justify-center rounded-full
          bg-black/65 text-white shadow-lg transition hover:bg-black/85
          focus-visible:outline-2 focus-visible:outline-orange-500"
      >
        <ShareIcon className="h-5 w-5" />
      </button>
    </div>
  );

  const mobileDetails = video && (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1]
      bg-gradient-to-t from-black/85 via-black/35 to-transparent
      px-5 pb-[calc(env(safe-area-inset-bottom)+5rem)] pt-16 text-white sm:hidden">
      <h1 className="text-xl font-bold">{video.title}</h1>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/80">
        {[video.category, duration].filter(Boolean).join(" · ")}
      </p>
      {video.description && (
        <p className="mt-2 line-clamp-3 text-sm text-white/80">{video.description}</p>
      )}
    </div>
  );

  const videoDetails = video && (
    <section className="hidden min-w-0 flex-1 flex-col justify-center
      overflow-y-auto p-8 text-gray-900 sm:flex lg:p-12">
      <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
        {[video.category, duration].filter(Boolean).join(" · ")}
      </p>
      <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{video.title}</h1>
      {video.description && (
        <p className="mt-4 text-sm leading-relaxed text-gray-600">{video.description}</p>
      )}
    </section>
  );

  if (hasMobileFeed) {
    return (
      <MobileVideoFeed
        initialWorks={mobileWorks}
        initialIndex={mobileStartIndex}
        initialNextCursor={location.state?.mobileNextCursor || null}
      />
    );
  }

  if (isModal) {
    return (
      <main
        role="dialog"
        aria-modal="true"
        aria-label={video ? `Playing ${video.title}` : "Video player"}
        className="fixed inset-0 z-50 flex h-[100dvh] w-full items-center
          justify-center bg-black/60 backdrop-blur-md"
      >
        <div className="relative flex h-full w-full flex-col overflow-hidden
          bg-black sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:flex-row
          sm:rounded-2xl sm:bg-gray-50 sm:shadow-2xl">
          <button
            type="button"
            onClick={close}
            aria-label="Close video"
            className="absolute left-4 top-[calc(env(safe-area-inset-top)+1rem)]
              z-20 flex h-11 w-11 items-center justify-center rounded-full
              bg-black/50 text-white hover:bg-black/75 sm:left-auto sm:right-4
              sm:top-4 sm:bg-black/10 sm:text-gray-800 sm:hover:bg-black/20"
          >
            <CloseIcon className="h-6 w-6" />
          </button>

          {error ? (
            <div className="flex h-full flex-1 flex-col items-center justify-center
              gap-4 px-6 text-center text-white sm:text-gray-900">
              <p className="text-lg font-semibold">{error}</p>
              <button type="button" onClick={close} className="text-sm text-orange-600">
                Back to videos
              </button>
            </div>
          ) : !video ? (
            <div className="flex h-full flex-1 items-center justify-center" aria-busy="true">
              <div className="aspect-[9/16] h-full max-h-[70vh] animate-pulse rounded-2xl bg-gray-800" />
            </div>
          ) : (
            <>
              <div className="relative h-full min-h-0 w-full flex-1 bg-black
                sm:h-[85vh] sm:w-auto sm:flex-none sm:aspect-[9/16]">
                {videoElement}
                {playerActions}
                {mobileDetails}
              </div>
              {videoDetails}
            </>
          )}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center
        gap-4 bg-gray-50 px-6 text-center">
        <p className="text-lg font-semibold text-gray-900">{error}</p>
        <Link to="/" className="text-sm font-medium text-orange-700 hover:underline">
          Back to videos
        </Link>
      </main>
    );
  }

  if (!video) {
    return (
      <main className="flex min-h-screen items-center justify-center
        bg-gray-50 px-4" aria-busy="true">
        <div className="aspect-[9/16] w-[min(80vw,360px)] animate-pulse rounded-2xl bg-gray-200" />
      </main>
    );
  }

  return (
    <main className="fixed inset-0 z-40 h-[100dvh] bg-black sm:relative
      sm:z-auto sm:min-h-screen sm:bg-gray-50 sm:px-4 sm:py-8">
      <div className="relative h-full w-full bg-black sm:mx-auto sm:h-auto
        sm:max-h-[85vh] sm:max-w-md sm:overflow-hidden sm:rounded-2xl sm:shadow-lg">
        {videoElement}
        {playerActions}
        <Link
          to="/"
          aria-label="Back to videos"
          className="absolute left-4 top-[calc(env(safe-area-inset-top)+1rem)]
            z-20 flex h-11 w-11 items-center justify-center rounded-full
            bg-black/50 text-white sm:hidden"
        >
          <CloseIcon className="h-6 w-6" />
        </Link>
        {mobileDetails}
      </div>
      <div className="hidden sm:mx-auto sm:block sm:max-w-md">
        <h1 className="mt-5 text-xl font-bold text-gray-900">{video.title}</h1>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-orange-600">
          {[video.category, duration].filter(Boolean).join(" · ")}
        </p>
        {video.description && (
          <p className="mt-3 text-sm leading-relaxed text-gray-600">{video.description}</p>
        )}
      </div>
    </main>
  );
}
