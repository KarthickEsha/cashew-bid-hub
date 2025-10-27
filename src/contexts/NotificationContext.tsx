import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type AppNotification = {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
  time: string;
  read: boolean;
  data?: Record<string, any>;
};

type Ctx = {
  notifications: AppNotification[];
  addNotification: (
    n: Omit<AppNotification, 'id' | 'time' | 'read'> & Partial<Pick<AppNotification, 'time' | 'read'>>
  ) => void;
  deleteNotification: (id: string) => void;
  markAllAsRead: () => void;
  setAll: (read: boolean) => void;
};

const NotificationContext = createContext<Ctx | null>(null);

const STORAGE_KEY = 'app_notifications_v1';

// Generate a UUID v4 with graceful fallbacks for environments without crypto.randomUUID
function generateId(): string {
  const cryptoObj: any = (typeof globalThis !== 'undefined' && (globalThis as any).crypto) || undefined;
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return cryptoObj.randomUUID();
  }
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const buf = new Uint8Array(16);
    cryptoObj.getRandomValues(buf);
    // RFC 4122 version/variant bits
    buf[6] = (buf[6] & 0x0f) | 0x40;
    buf[8] = (buf[8] & 0x3f) | 0x80;
    const hex = Array.from(buf).map((b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  // Weak fallback (non-cryptographic)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  const addNotification: Ctx['addNotification'] = useCallback((n) => {
    const now = new Date();
    setNotifications((prev) => [
      {
        id: generateId(),
        read: n.read ?? false,
        time: n.time ?? now.toLocaleString(),
        ...n,
      },
      ...prev,
    ]);
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const setAll = useCallback((read: boolean) => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read })));
  }, []);

  const value = useMemo(
    () => ({ notifications, addNotification, deleteNotification, markAllAsRead, setAll }),
    [notifications, addNotification, deleteNotification, markAllAsRead, setAll]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

