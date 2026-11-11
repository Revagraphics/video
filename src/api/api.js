const API_URL = (
  import.meta.env.VITE_API_URL || "https://video-backend-qibq.onrender.com"
).replace(/\/+$/, "");
const VIDEOS_PATH = "/api/video";

const mediaUrl = (value) => {
  if (!value || value.startsWith('http://') || value.startsWith('https://')) {
    return value || '';
  }

  return `${API_URL}${value.startsWith('/') ? value : `/${value}`}`;
};

const normalizeVideo = (video) => ({
  ...video,
  id: video._id,
  coverImage: mediaUrl(video.coverImage),
  thumbnail: mediaUrl(video.coverImage),
  videoUrl: mediaUrl(video.videoUrl),
});

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
  });
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const api = {
  async getVideos() {
    const data = await request(VIDEOS_PATH);
    return data.videos.map(normalizeVideo);
  },

  async createVideo(formData) {
    const data = await request(VIDEOS_PATH, {
      method: 'POST',
      body: formData,
    });
    return normalizeVideo(data.video);
  },
};