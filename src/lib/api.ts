
const BASE_URL = "http://127.0.0.1:8081"; // Adjust as needed

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = localStorage.getItem("auth_token"); // Adjust key if different
  const headers = new Headers(init.headers);

  // If sending FormData, don't set Content-Type (browser will set boundary)
  const isFormData = init.body instanceof FormData;
  if (!headers.has("Content-Type") && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}
