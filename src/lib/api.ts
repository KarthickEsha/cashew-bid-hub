
import { useRole } from '@/hooks/useRole';

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

// ===== Notifications API =====
export type ServerNotification = {
  id: string;
  receiverId: string;
  receiverType?: 'buyer' | 'merchant' | string;
  type: string; // e.g., "quote"
  title: string;
  message: string;
  isView: boolean; // read flag from server
  data?: Record<string, any> & {
    merchantId?: string;
    priceINR?: number;
    requirementId?: string;
    supplyQtyKg?: number;
    timestamp?: string; // e.g., 2025-10-27T11:12:57+05:30
  };
  createdAt: string; // ISO date
};

export type NotificationsResponse = {
  data: ServerNotification[];
  message: string;
  status: string;
};

export async function fetchNotifications(): Promise<NotificationsResponse> {
  // Read current UI role from Zustand (works outside React components)
  const role = useRole.getState().role;
  // Map app roles to server views: processor -> merchant, others -> buyer
  const view = role === 'processor' ? 'merchant' : 'buyer';
  return apiFetch(`/api/notifications?view=${encodeURIComponent(view)}`, { method: 'GET' });
}

// Delete a notification by ID on the server
export async function deleteNotificationServer(id: string): Promise<{ message?: string; status?: string } | string> {
  return apiFetch(`/api/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
