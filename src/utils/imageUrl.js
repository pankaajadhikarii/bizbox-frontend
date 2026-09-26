/**
 * Returns a fully-qualified image URL.
 * - If the URL already starts with http/https, it is returned as-is.
 * - If the URL is a relative path (e.g. "/uploads/image.png" from the backend
 *   FileStorageService), it is prepended with the backend base URL.
 * - If no URL is provided, returns null so callers can fall back to a placeholder.
 */
const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5286/api";
// Remove trailing /api or /api/ to get the backend host root (e.g. http://localhost:5286)
const BACKEND_BASE_URL = apiBase.replace(/\/api\/?$/, "");

export function resolveImageUrl(url) {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    // Relative path from the backend (e.g. "/uploads/business-types/xxx.png")
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${BACKEND_BASE_URL}${path}`;
}
