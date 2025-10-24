import { useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { messagingPromise } from '@/lib/firebase';
import { setStoredFcmToken, getStoredFcmToken } from '@/lib/fcmToken';
import { useNotifications } from '@/contexts/NotificationContext';

export default function EnableNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('notifications_prompt_dismissed') === '1';
    } catch {
      return false;
    }
  });
  const [busy, setBusy] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    setPermission(Notification.permission);
  }, []);

  if (permission === 'granted' || dismissed) return null;

  const requestAndRegister = async () => {
    try {
      // Immediately hide the card once user clicks Allow
      setDismissed(true);
      try { localStorage.setItem('notifications_prompt_dismissed', '1'); } catch {}
      setBusy(true);
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        addNotification({
          type: 'warning',
          title: 'Notifications blocked',
          message: 'Please allow notifications in your browser settings.',
        });
        return;
      }

      const messaging = await messagingPromise;
      if (!messaging) {
        addNotification({
          type: 'warning',
          title: 'Notifications not supported',
          message: 'Use HTTPS or localhost and a supported browser.',
        });
        return;
      }

      let swReg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      if (!swReg) {
        swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      }

      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
      if (!vapidKey) {
        console.warn('[FCM] Missing VAPID key. Set VITE_FIREBASE_VAPID_KEY in .env');
        return;
      }

      const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg });
      if (token) {
        const existing = getStoredFcmToken();
        if (existing !== token) setStoredFcmToken(token);
        addNotification({ type: 'success', title: 'Notifications enabled', message: 'You will receive alerts.' });
      }
    } catch (e) {
      console.error('[FCM] EnableNotifications error', e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] bg-background border rounded-lg shadow p-3 flex items-center gap-3">
      <div className="flex-1 text-sm">
        <strong className="block">Enable notifications</strong>
        <span className="text-muted-foreground">Stay updated with bids, orders, and alerts.</span>
      </div>
      <button
        className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground disabled:opacity-50"
        onClick={requestAndRegister}
        disabled={busy}
      >
        {busy ? 'Enabling...' : 'Allow'}
      </button>
    </div>
  );
}

