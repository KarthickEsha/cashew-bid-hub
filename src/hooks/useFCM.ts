import { useEffect } from 'react';
import { messagingPromise } from '@/lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { useNotifications } from '@/contexts/NotificationContext';
import { extractBackendUserId, updateUserFcmToken } from '@/lib/profile';

// Explicit helper to request permission, get an FCM token, persist it locally, and sync to backend
export async function ensureFcmToken(vapidKey: string): Promise<string | null> {
  try {
    const messaging = await messagingPromise;
    if (!messaging) return null;
    let swReg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (!swReg) {
      swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }

    // Request permission if needed
    if (Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return null;
    }
    if (Notification.permission !== 'granted') return null;

    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg! });
    if (token) {
      const existing = localStorage.getItem('fcm_token');
      if (existing !== token) localStorage.setItem('fcm_token', token);
      const auth = localStorage.getItem('auth_token');
      const userId = extractBackendUserId();
      if (auth && userId) {
        try {
          await updateUserFcmToken(userId, token);
          console.debug('[FCM] ensureFcmToken synced to backend for user', userId);
        } catch (e) {
          console.warn('[FCM] ensureFcmToken backend sync failed', e);
        }
      }
    }
    return token || null;
  } catch (e) {
    console.error('[FCM] ensureFcmToken error', e);
    return null;
  }
}

export function useFCM(vapidKey: string) {
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!vapidKey) return;
    let swReg: ServiceWorkerRegistration | null = null;

    const KEY = 'fcm_token';

    function saveTokenIfChanged(token: string | null | undefined) {
      if (!token) return false;
      const existing = localStorage.getItem(KEY);
      if (existing !== token) {
        localStorage.setItem(KEY, token);
        console.debug('[FCM] Stored FCM token in localStorage');
        // Also attempt to sync to backend when changed
        void syncTokenToBackend(token);
        return true;
      }
      console.debug('[FCM] FCM token unchanged; not writing to localStorage');
      return false;
    }

    async function syncTokenToBackend(token: string | null | undefined) {
      try {
        if (!token) return;
        const auth = localStorage.getItem('auth_token');
        if (!auth) return; // wait until SSO exchange stores backend JWT
        const userId = extractBackendUserId();
        if (!userId) return;
        await updateUserFcmToken(userId, token);
        console.debug('[FCM] Synced FCM token to backend for user', userId);
      } catch (e) {
        console.warn('[FCM] Failed to sync FCM token to backend', e);
      }
    }

    async function init() {
      try {
        if (!('serviceWorker' in navigator)) {
          console.warn('[FCM] Service workers not supported in this browser');
          return;
        }
        const messaging = await messagingPromise;
        if (!messaging) {
          console.warn('[FCM] Messaging not supported (likely due to insecure origin or browser)');
          return;
        }

        // Register SW for FCM
        swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.debug('[FCM] SW registered:', !!swReg);

        // Do NOT auto-request permission here. Token acquisition should be triggered explicitly (e.g., from a login-page banner).

        // If permission is already granted, try to get a token immediately
        if (Notification.permission === 'granted') {
          try {
            const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg! });
            if (saveTokenIfChanged(token)) {
              console.debug('[FCM] Token obtained on init');
            } else {
              await syncTokenToBackend(token);
            }
          } catch (e) {
            console.error('[FCM] getToken error on init', e);
          }
        } else if (Notification.permission === 'denied') {
          console.warn('[FCM] Notification permission denied; cannot obtain token');
        } else {
          console.info('[FCM] Notification permission not yet granted');
        }

        // Helper to optionally show a system notification in the foreground
        const showSystemNotification = (title: string, body: string, data?: any) => {
          if (Notification.permission === 'granted') {
            try {
              new Notification(title, { body, icon: '/favicon.ico', data });
            } catch (e) {
              console.warn('[FCM] Failed to show system notification in foreground', e);
            }
          }
        };

        // Handle foreground messages
        onMessage(messaging, (payload) => {
          const n = payload.notification;
          const data = payload.data || {};
          const title = n?.title || (data as any).title || 'Notification';
          const body = n?.body || (data as any).body || '';
          addNotification({
            type: 'info',
            title,
            message: body,
            data: payload.data as Record<string, any> | undefined,
          });
          // Also surface a system notification if allowed, for better visibility while focused
          showSystemNotification(title, body, payload.data);
        });

        // Receive forwarded messages from SW (background -> page)
        navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
          const { type, payload } = (event.data || {}) as any;
          if (type === 'FCM_BACKGROUND_MESSAGE' || type === 'FCM_NOTIFICATION_CLICK') {
            const n = payload?.notification;
            const data = payload?.data || event.data?.data || {};
            addNotification({
              type: 'info',
              title: n?.title || data.title || 'Notification',
              message: n?.body || data.body || '',
              data,
            });
          }
        });

        // Re-check token when tab becomes visible (handles token refresh scenarios)
        const onVisible = async () => {
          try {
            if (Notification.permission !== 'granted') return;
            const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg! });
            if (saveTokenIfChanged(token)) {
              console.debug('[FCM] Token updated on visibilitychange');
            } else {
              // Even if unchanged, try syncing after auth is available
              await syncTokenToBackend(token);
            }
          } catch (e) {
            console.error('[FCM] getToken error on visibilitychange', e);
          }
        };
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') onVisible();
        });

        // On init, if we already have a stored token, try syncing it once auth is present
        const stored = localStorage.getItem(KEY);
        if (stored) {
          void syncTokenToBackend(stored);
        }
      } catch (e) {
        console.error('FCM init error', e);
      }
    }

    init();
  }, [addNotification, vapidKey]);
}
