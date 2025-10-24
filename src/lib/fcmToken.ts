export const FCM_TOKEN_KEY = 'fcm_token';

export function getStoredFcmToken(): string | null {
  try {
    return localStorage.getItem(FCM_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredFcmToken(token: string) {
  try {
    localStorage.setItem(FCM_TOKEN_KEY, token);
  } catch {}
}

export function clearStoredFcmToken() {
  try {
    localStorage.removeItem(FCM_TOKEN_KEY);
  } catch {}
}
