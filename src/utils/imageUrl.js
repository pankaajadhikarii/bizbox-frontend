const apiBase =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5286/api";
const BACKEND_BASE_URL = apiBase.replace(/\/api\/?$/, "");

export function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND_BASE_URL}${path}`;
}
