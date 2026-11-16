// Cloudinary delivery helpers.
//
// Free-tier note: every distinct URL (transformation) counts once against your
// monthly Cloudinary credits, so we only ever use a few fixed sizes:
//   - poster for the grid  -> width 480
//   - poster on the video page -> width 720
//   - playback -> width 720

const isCloudinary = (url) =>
  typeof url === "string" &&
  url.includes("res.cloudinary.com") &&
  url.includes("/upload/");

const inject = (url, transformation) =>
  url.replace("/upload/", `/upload/${transformation}/`);

const swapExtension = (url, extension) =>
  url.replace(/\.[A-Za-z0-9]+$/, `.${extension}`);

/** Small, cached image for cards. Uses the cover image, or a frame of the video. */
export const getPoster = (work, width = 480) => {
  if (!work) return "";

  if (work.coverImage) {
    return isCloudinary(work.coverImage)
      ? inject(work.coverImage, `f_auto,q_auto,w_${width}`)
      : work.coverImage;
  }

  const video = work.videoUrl;
  if (isCloudinary(video) && video.includes("/video/upload/")) {
    return swapExtension(inject(video, `so_0,q_auto,w_${width}`), "jpg");
  }

  return "";
};

/** Smaller, web-friendly MP4 for playback (falls back to the original URL). */
export const getPlaySrc = (work) => {
  const video = work?.videoUrl || "";

  if (isCloudinary(video) && video.includes("/video/upload/")) {
    return swapExtension(inject(video, "q_auto,w_720"), "mp4");
  }

  return video;
};

/** 75 -> "1:15". Returns "" when the duration is unknown. */
export const formatDuration = (value) => {
  const total = Math.round(Number(value) || 0);
  if (total <= 0) return "";

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = String(total % 60).padStart(2, "0");

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`
    : `${minutes}:${seconds}`;
};
