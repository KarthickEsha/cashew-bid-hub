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
        id: crypto.randomUUID(),
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
