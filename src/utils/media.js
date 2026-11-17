// Cloudinary transformation URLs return 401 for this account, so deliver
// uploaded assets using their original URLs.

/** Uses the uploaded cover image when one is available. */
export const getPoster = (work) => work?.coverImage || "";

/** Returns the original video URL to avoid unauthorized transformations. */
export const getPlaySrc = (work) => work?.videoUrl || "";

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
