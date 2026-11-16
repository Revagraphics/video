const API_URL = ( import.meta.env.VITE_API_URL || "https://video-backend-qibq.onrender.com"
).replace(/\/+$/, "");
const VIDEOS_PATH = "/api/video";

export const ADMIN_UPLOADS_ENABLED = false;

const CACHE_KEY = "videos:first-page:v1";
const RETRY_DELAY_MS = 2500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requireAdminUploadsEnabled = () => {
  if (!ADMIN_UPLOADS_ENABLED) {
    throw new Error("Admin video uploads are currently disabled.");
  }
};

// Errors the server answered with on purpose (404, 401, ...). Never retried.
class ApiError extends Error {}

const normalizeVideo = (video) => ({
  ...video,
  id: video._id,
  // The database field is spelled "discription"; the UI reads "description".
  description: video.description ?? video.discription ?? "",
});

/**
 * fetch + JSON + error handling.
 * `retries` is for safe (GET) requests only. It covers the Render free tier
 * waking up, when the first requests can fail with 502/503/504 or a network error.
 */
const request = async (path, { retries = 0, adminKey, headers, ...options } = {}) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...(adminKey ? { "x-admin-key": adminKey } : {}),
          ...(headers || {}),
        },
      });

      if ([502, 503, 504].includes(response.status) && attempt < retries) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new ApiError(data?.message || `Request failed (${response.status})`);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;

      // Network error: the server may still be waking up.
      lastError = error;
      if (attempt < retries) await sleep(RETRY_DELAY_MS);
    }
  }

  throw new Error(
    lastError?.message === "Failed to fetch"
      ? "Could not reach the server. It may be waking up, please try again."
      : lastError?.message || "Request failed",
  );
};

const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeCache = (value) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the cache is only a convenience.
  }
};

export const api = {
  /** Fire-and-forget: starts the sleeping Render instance. */
  wakeServer() {
    fetch(`${API_URL}/health`, { cache: "no-store" }).catch(() => {});
  },

  /** Last first-page result from this browser, for an instant first paint. */
  readCachedVideos() {
    const cached = readCache();
    return Array.isArray(cached?.videos) ? cached : null;
  },

  async getVideos({ cursor, limit = 12 } = {}) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);

    const data = await request(`${VIDEOS_PATH}?${params}`, { retries: 2 });
    const page = {
      videos: data.videos.map(normalizeVideo),
      nextCursor: data.nextCursor || null,
    };

    if (!cursor) writeCache(page);
    return page;
  },

  async getVideo(id) {
    const data = await request(`${VIDEOS_PATH}/${encodeURIComponent(id)}`, { retries: 2 });
    return normalizeVideo(data.video);
  },

  /** Admin only. Also doubles as an "is this admin key correct?" check. */
  async getUploadSignature(adminKey) {
    requireAdminUploadsEnabled();
    const data = await request(`${VIDEOS_PATH}/upload-signature`, {
      method: "POST",
      adminKey,
    });
    return data;
  },

  /** Admin only. Saves the record after the files are already on Cloudinary. */
  async createVideo(payload, adminKey) {
    requireAdminUploadsEnabled();
    const data = await request(VIDEOS_PATH, {
      method: "POST",
      body: JSON.stringify(payload),
      adminKey,
    });
    return normalizeVideo(data.video);
  },

  /**
   * Browser -> Cloudinary directly (your server never touches the file).
   * `signature` is { cloudName, apiKey, folder, timestamp, signature }.
   */
  uploadToCloudinary(file, signature, resourceType, onProgress) {
    requireAdminUploadsEnabled();
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", signature.apiKey);
      form.append("timestamp", signature.timestamp);
      form.append("signature", signature.signature);
      form.append("folder", signature.folder);

      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${signature.cloudName}/${resourceType}/upload`,
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        let body = null;
        try {
          body = JSON.parse(xhr.responseText);
        } catch {
          // Non-JSON response; handled below.
        }

        if (xhr.status >= 200 && xhr.status < 300 && body?.secure_url) {
          resolve(body);
        } else {
          reject(new Error(body?.error?.message || "Upload failed. Please try again."));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload."));
      xhr.send(form);
    });
  },
};
