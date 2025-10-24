import { useEffect } from 'react';
import { messagingPromise } from '@/lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { useNotifications } from '@/contexts/NotificationContext';

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
        return true;
      }
      console.debug('[FCM] FCM token unchanged; not writing to localStorage');
      return false;
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

        // Handle foreground messages
        onMessage(messaging, (payload) => {
          const n = payload.notification;
          const data = payload.data || {};
          addNotification({
            type: 'info',
            title: n?.title || (data as any).title || 'Notification',
            message: n?.body || (data as any).body || '',
            data: payload.data as Record<string, any> | undefined,
          });
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
            }
          } catch (e) {
            console.error('[FCM] getToken error on visibilitychange', e);
          }
        };
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') onVisible();
        });
      } catch (e) {
        console.error('FCM init error', e);
      }
    }

    init();
  }, [addNotification, vapidKey]);
}

