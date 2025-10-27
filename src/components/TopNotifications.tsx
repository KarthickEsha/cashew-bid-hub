import { useEffect, useMemo, useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';

export default function TopNotifications() {
  const { notifications, deleteNotification } = useNotifications();
  const latest = useMemo(() => notifications[0], [notifications]);
  const [visibleId, setVisibleId] = useState<string | null>(null);

  useEffect(() => {
    if (!latest) return;
    setVisibleId(latest.id);
    const t = setTimeout(() => setVisibleId(null), 4000);
    return () => clearTimeout(t);
  }, [latest?.id]);

  if (!latest || visibleId !== latest.id) return null;

  const bg =
    latest.type === 'success' ? 'bg-green-600' : latest.type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600';

  return (
    <div className="pointer-events-none fixed top-3 left-1/2 z-[1000] -translate-x-1/2 transform">
      <div
        className={`pointer-events-auto ${bg} text-white shadow-lg rounded-md px-4 py-3 min-w-[280px] max-w-[92vw] flex flex-col gap-1`}
        onClick={() => deleteNotification(latest.id)}
        role="status"
        aria-live="polite"
      >
        <div className="font-medium text-sm truncate">{latest.title}</div>
        {latest.message ? <div className="text-xs opacity-90 line-clamp-3">{latest.message}</div> : null}
      </div>
    </div>
  );
}
