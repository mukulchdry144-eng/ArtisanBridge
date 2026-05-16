const API_BASE = String(import.meta.env.VITE_API_BASE || "").replace(/\/+$/, "");

function getToken() {
  return localStorage.getItem("ab_token") || "";
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const cleanPath = String(path || "").startsWith("/") ? String(path) : `/${path}`;
  const url =
    API_BASE.endsWith("/api") && cleanPath.startsWith("/api/")
      ? `${API_BASE}${cleanPath.slice(4)}`
      : `${API_BASE}${cleanPath}`;

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    throw new Error(`Could not reach the API server at ${url}. Check the backend URL and network connection.`);
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : null;
  const fallbackMessage = isJson
    ? `Request failed (${res.status})`
    : `Request failed (${res.status}). The API returned ${contentType || "a non-JSON response"}.`;

  if (!res.ok) {
    const message = payload?.error || payload?.message || fallbackMessage;
    const err = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}
