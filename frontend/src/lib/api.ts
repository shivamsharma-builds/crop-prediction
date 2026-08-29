const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) }
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { const data = await response.json(); message = data.message || message; } catch { /* ignore */ }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  register: (body: { name: string; email: string; password: string }) => request<{ user: import("../types").User }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) => request<{ user: import("../types").User }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  me: () => request<{ user: import("../types").User }>("/auth/me"),
  siteData: (body: { location?: string; latitude?: number; longitude?: number }) =>
  request<{ siteData: import("../types").SiteData }>("/predictions/site-data", {
    method: "POST",
    body: JSON.stringify(body),
  }),

predict: (body: import("../types").PredictionInput) =>
  request<{ prediction: import("../types").PredictionResult }>("/predictions", {
    method: "POST",
    body: JSON.stringify(body),
  }),
  myPredictions: () => request<{ predictions: any[] }>("/predictions/mine"),
  adminConfig: () => request<{ isAiEnabled: boolean; selectedModel: string; apiKeyMasked: string }>("/admin/config"),
  patchAdminConfig: (body: { apiKey?: string; isAiEnabled?: boolean; selectedModel?: string }) => request<{ config: any }>("/admin/config", { method: "PATCH", body: JSON.stringify(body) }),
  users: (q = "") => request<{ users: any[] }>(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  updateUser: (id: string, body: { name?: string; role?: "user" | "admin" }) => request<{ user: any }>(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteUser: (id: string) => request<void>(`/admin/users/${id}`, { method: "DELETE" }),
  predictions: (crop = "") => request<{ predictions: any[] }>(`/admin/predictions${crop ? `?crop=${encodeURIComponent(crop)}` : ""}`),
  deletePrediction: (id: string) => request<void>(`/admin/predictions/${id}`, { method: "DELETE" })
};
