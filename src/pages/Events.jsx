import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/api";
import VideoGallery from "../components/VideoGallery";

const PAGE_SIZE = 12;

function GridSkeleton({ count = 8 }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="aspect-[9/16] animate-pulse rounded-2xl bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

export default function Events() {
  // Last visit's first page, so returning visitors see content immediately
  // while the (possibly sleeping) server wakes up and refreshes it.
  const [cached] = useState(() => api.readCachedVideos());

  const [videos, setVideos] = useState(cached?.videos ?? []);
  const [nextCursor, setNextCursor] = useState(cached?.nextCursor ?? null);
  const [loading, setLoading] = useState(!cached);
  const [ready, setReady] = useState(false); // first network response received
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreFailed, setMoreFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef(null);

  // First page
  useEffect(() => {
    let active = true;
    const slowTimer = setTimeout(() => active && setSlow(true), 4000);

    api.getVideos({ limit: PAGE_SIZE })
      .then((page) => {
        if (!active) return;
        setVideos(page.videos);
        setNextCursor(page.nextCursor);
        setError("");
        setReady(true);
      })
      .catch((requestError) => {
        // With cached videos on screen, a failed refresh is not worth an error page.
        if (active && !cached) setError(requestError.message);
      })
      .finally(() => {
        clearTimeout(slowTimer);
        if (active) {
          setLoading(false);
          setSlow(false);
        }
      });

    return () => {
      active = false;
      clearTimeout(slowTimer);
    };
  }, [attempt, cached]);

  // Next pages
  const loadMore = useCallback(async () => {
    if (!ready || !nextCursor || loadingMoreRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    setMoreFailed(false);

    try {
      const page = await api.getVideos({ cursor: nextCursor, limit: PAGE_SIZE });
      setVideos((current) => {
        const seen = new Set(current.map((video) => video.id));
        return [...current, ...page.videos.filter((video) => !seen.has(video.id))];
      });
      setNextCursor(page.nextCursor);
    } catch {
      setMoreFailed(true);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [ready, nextCursor]);

  // Infinite scroll for the grid
  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !ready || !nextCursor || moreFailed) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadMore(),
      { rootMargin: "600px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore, ready, nextCursor, moreFailed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <p className="mb-8 px-4 text-center text-sm text-gray-500" role="status">
          {slow
            ? "Waking up the server. The first visit can take up to a minute..."
            : "Loading videos..."}
        </p>
        <GridSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
        <p className="text-lg font-semibold text-gray-900">Could not load videos</p>
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => {
            setError("");
            setLoading(true);
            setAttempt((value) => value + 1);
          }}
          className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <VideoGallery
        works={videos}
        name="Creative Portfolio"
        eyebrow="Our latest work"
        nextCursor={nextCursor}
      />

      {/* Infinite-scroll trigger and status */}
      <div ref={sentinelRef} className="pb-16 text-center">
        {loadingMore && <GridSkeleton count={4} />}
        {moreFailed && (
          <button
            type="button"
            onClick={loadMore}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Could not load more. Try again
          </button>
        )}
      </div>
    </div>
  );
}
