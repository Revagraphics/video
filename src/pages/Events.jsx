import { useEffect, useState } from "react";
import { api } from "../api/api";
import VideoGallery from "../components/VideoGallery";

export default function Events() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api.getVideos()
      .then((items) => {
        if (active) setVideos(items);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600">
        Loading videos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
        <p className="text-lg font-semibold text-gray-900">Could not load videos</p>
        <p className="text-sm text-red-600">{error}</p>
        <p className="text-sm text-gray-600">
          Check that the backend is running and VITE_API_URL points to it.
        </p>
      </div>
    );
  }

  return (
    <VideoGallery
      works={videos}
      name="Creative Portfolio"
      eyebrow="Our latest work"
    />
  );
}
