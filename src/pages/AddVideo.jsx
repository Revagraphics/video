import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api";

const MAX_FILE_SIZE = 80 * 1024 * 1024;

export default function AddVideo() {
  const formRef = useRef(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (event, setFile) => {
    const file = event.target.files?.[0] || null;

    if (file && file.size > MAX_FILE_SIZE) {
      event.target.value = "";
      setFile(null);
      setError("File too large. Video and cover image files must each be 50 MB or smaller.");
      return;
    }

    setError("");
    setFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!videoFile && !videoUrl.trim()) {
      setError("Choose a video file or enter a video URL.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("discription", description.trim());
    formData.append("category", category.trim());
    if (videoFile) formData.append("video", videoFile);
    if (coverFile) formData.append("coverImage", coverFile);
    if (videoUrl.trim()) formData.append("videoUrl", videoUrl.trim());

    setSubmitting(true);

    try {
      await api.createVideo(formData);
      formRef.current?.reset();
      setTitle("");
      setDescription("");
      setCategory("");
      setVideoFile(null);
      setCoverFile(null);
      setVideoUrl("");
      setSuccess("Video added successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900">Add a video</h1>
        <p className="mt-2 text-sm text-gray-600">
          Upload an MP4 video or provide a video URL. Video and cover image uploads must each be 50 MB or smaller.
        </p>

        <form ref={formRef} className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700">
            Title
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="My video"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Description
            <textarea
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="Describe this video"
              rows={3}
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Category
            <input
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="Branding"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Video file (MP4)
            <input
              type="file"
              accept="video/mp4"
              onChange={(event) => handleFileChange(event, setVideoFile)}
              className="mt-2 block w-full rounded-lg border border-gray-300 p-2 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Or video URL
            <input
              type="url"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="https://example.com/video.mp4"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Cover image (optional)
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => handleFileChange(event, setCoverFile)}
              className="mt-2 block w-full rounded-lg border border-gray-300 p-2 text-sm"
            />
          </label>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {success && <p role="status" className="text-sm text-green-700">{success}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Adding video..." : "Add video"}
          </button>
        </form>

        <Link to="/" className="mt-6 inline-block text-sm font-medium text-orange-700 hover:underline">
          Back to videos
        </Link>
      </section>
    </main>
  );
}
