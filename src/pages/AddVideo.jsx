import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api";

// Cloudinary free plan limits (check your dashboard if they change):
// about 100 MB per video and 10 MB per image.
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const KEY_STORAGE = "videos:admin-key";

const inputClass =
  "mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100";
const fileClass = "mt-2 block w-full rounded-lg border border-gray-300 p-2 text-sm";

const readStoredKey = () => {
  try {
    return sessionStorage.getItem(KEY_STORAGE) || "";
  } catch {
    return "";
  }
};

export default function AddVideo() {
  const [adminKey, setAdminKey] = useState(readStoredKey);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const submittingRef = useRef(false);

  // Start waking the free-tier server while the form is being filled in.
  useEffect(() => {
    api.wakeServer();
  }, []);

  const handleFileChange = (event, setFile, maxSize, label) => {
    const file = event.target.files?.[0] || null;

    if (file && file.size > maxSize) {
      event.target.value = "";
      setFile(null);
      setError(`${label} is too large. The limit is ${Math.round(maxSize / 1024 / 1024)} MB.`);
      return;
    }

    setError("");
    setFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;

    setError("");
    setCreated(null);

    if (!videoFile && !videoUrl.trim()) {
      setError("Choose a video file or enter a video URL.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setProgress(0);

    try {
      const key = adminKey.trim();
      let finalVideoUrl = videoUrl.trim();
      let finalCover = "";
      let videoPublicId = "";
      let coverPublicId = "";
      let duration = 0;

      if (videoFile || coverFile) {
        // A wrong admin key fails here, before any large upload starts.
        const signed = await api.getUploadSignature(key);
        const base = { cloudName: signed.cloudName, apiKey: signed.apiKey };

        const [videoResult, coverResult] = await Promise.all([
          videoFile
            ? api.uploadToCloudinary(videoFile, { ...base, ...signed.video }, "video", setProgress)
            : null,
          coverFile
            ? api.uploadToCloudinary(coverFile, { ...base, ...signed.image }, "image")
            : null,
        ]);

        if (videoResult) {
          finalVideoUrl = videoResult.secure_url;
          videoPublicId = videoResult.public_id;
          duration = Math.round(videoResult.duration || 0);
        }
        if (coverResult) {
          finalCover = coverResult.secure_url;
          coverPublicId = coverResult.public_id;
        }
      }

      const video = await api.createVideo(
        {
          title: title.trim(),
          discription: description.trim(),
          category: category.trim(),
          videoUrl: finalVideoUrl,
          coverImage: finalCover,
          videoPublicId,
          coverPublicId,
          duration,
        },
        key,
      );

      try {
        sessionStorage.setItem(KEY_STORAGE, key);
      } catch {
        // Not critical.
      }

      setTitle("");
      setDescription("");
      setCategory("");
      setVideoFile(null);
      setCoverFile(null);
      setVideoUrl("");
      setFileInputKey((value) => value + 1);
      setCreated(video);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
      setProgress(0);
    }
  };

  const buttonLabel = submitting
    ? videoFile
      ? progress < 100
        ? `Uploading ${progress}%`
        : "Saving..."
      : "Saving..."
    : "Add video";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900">Add a video</h1>
        <p className="mt-2 text-sm text-gray-600">
          Upload a video (MP4, MOV or WebM, up to 100 MB) or provide a video URL.
          Files go straight to Cloudinary, so large uploads no longer pass through the server.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700">
            Admin key
            <input
              required
              type="password"
              autoComplete="current-password"
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
              className={inputClass}
              placeholder="Required to add videos"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Title
            <input
              required
              maxLength={150}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputClass}
              placeholder="My video"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Description
            <textarea
              required
              maxLength={2000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={inputClass}
              placeholder="Describe this video"
              rows={3}
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Category
            <input
              required
              maxLength={60}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={inputClass}
              placeholder="Branding"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Video file
            <input
              key={`video-${fileInputKey}`}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={(event) => handleFileChange(event, setVideoFile, MAX_VIDEO_SIZE, "Video")}
              className={fileClass}
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Or video URL
            <input
              type="url"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              className={inputClass}
              placeholder="https://example.com/video.mp4"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Cover image (optional)
            <input
              key={`cover-${fileInputKey}`}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => handleFileChange(event, setCoverFile, MAX_IMAGE_SIZE, "Cover image")}
              className={fileClass}
            />
          </label>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

          {created && (
            <p role="status" className="text-sm text-green-700">
              Video added successfully.{" "}
              <Link to={`/video/${created.id}`} className="font-semibold underline">
                View it
              </Link>
            </p>
          )}

          {submitting && videoFile && (
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-orange-600 transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {buttonLabel}
          </button>
        </form>

        <Link to="/" className="mt-6 inline-block text-sm font-medium text-orange-700 hover:underline">
          Back to videos
        </Link>
      </section>
    </main>
  );
}
