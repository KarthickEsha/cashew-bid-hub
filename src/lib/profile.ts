import { apiFetch } from "@/lib/api";

// Try to extract backend user id from stored JWT (assumes standard JWT)
export function extractBackendUserId(): string | null {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    // Common claim keys that might hold the id
    return (
      payload?.userId ||
      payload?.id ||
      payload?.sub ||
      null
    );
  } catch (_) {
    return null;
  }
}

export interface BackendUserProfileUpdate {
  name?: string;
  role?: string;
  mail?: string;
  phone?: string;
  city?: string;
  address?: string;
  profilePicture?: string;
  companyName?: string;
  registrationType?: string; // e.g., "PRIVATE_LIMITED"
  officeEmail?: string;
  establishedYear?: string;
  businessType?: string;
  description?: string;
  location?: { latitude: number; longitude: number } | null;
  state?: string;
  country?: string;
  postalCode?: string;
  officeAddress?: string;
  officePhone?: string
}

export async function updateUserProfile(userId: string, data: BackendUserProfileUpdate) {
  if (!userId) throw new Error("Missing backend userId for profile update");
  return apiFetch(`/api/users/update/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Fetch a user's profile by backend id
export async function getUserProfile(userId: string) {
  if (!userId) throw new Error("Missing backend userId for profile fetch");
  // Adjust the endpoint if your backend differs
  return apiFetch(`/api/users/${encodeURIComponent(userId)}`, { method: "GET" });
}

// Update only the user's FCM token by backend id
export async function updateUserFcmToken(userId: string, fcmToken: string) {
  if (!userId) throw new Error("Missing backend userId for FCM update");
  if (!fcmToken) throw new Error("Missing FCM token");
  // Prefer dedicated endpoint; fallback to generic update if not available
  try {
    return await apiFetch(`/api/users/${encodeURIComponent(userId)}/fcm`, {
      method: "PUT",
      body: JSON.stringify({ fcmToken }),
    });
  } catch (_) {
    return apiFetch(`/api/users/update/${encodeURIComponent(userId)}`, {
      method: "PUT",
      body: JSON.stringify({ fcmToken }),
    });
  }
}