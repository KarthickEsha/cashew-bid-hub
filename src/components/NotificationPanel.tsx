import { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { fetchNotifications, deleteNotificationServer, type ServerNotification } from '@/lib/api';

interface NotificationPanelProps {
  children: React.ReactNode;
}

const NotificationPanel = ({ children }: NotificationPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, deleteNotification, markAllAsRead } = useNotifications();
  const [serverItems, setServerItems] = useState<ServerNotification[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchNotifications();
        if (!cancelled) setServerItems(res.data || []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load notifications');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  // deleteNotification and markAllAsRead come from context

  const handleDismissServer = async (id: string) => {
    // Optimistic remove
    let prev: ServerNotification[] | null = null;
    setServerItems((curr) => {
      prev = curr;
      return curr ? curr.filter((n) => n.id !== id) : curr;
    });
    try {
      await deleteNotificationServer(id);
    } catch (e: any) {
      // Rollback on error and show minimal inline error
      setServerItems(prev);
      setError(e?.message || 'Failed to delete notification');
    }
  };

  const unreadCount = useMemo(() => {
    if (serverItems) return serverItems.filter((n) => !n.isView).length;
    return notifications.filter((n) => !n.read).length;
  }, [serverItems, notifications]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
            <Badge variant="destructive">{unreadCount}</Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground text-sm">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600 text-sm">{error}</p>
          ) : serverItems && serverItems.length > 0 ? (
            serverItems.map((n) => (
              <div
                key={n.id}
                className={`relative p-4 rounded-lg border ${n.isView ? 'bg-background' : 'bg-accent/50'}`}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 absolute right-2 top-2"
                  onClick={() => handleDismissServer(n.id)}
                  aria-label="Dismiss"
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="flex items-start gap-3">
                  {getIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm flex items-center gap-2">
                      <span>{n.title}</span>
                      {n.data?.receiverType ? (
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {n.data.receiverType}
                        </Badge>
                      ) : null}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(n.createdAt || n.data?.timestamp || '').toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : notifications.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">
              No notifications
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative p-4 rounded-lg border ${
                  notification.read ? 'bg-background' : 'bg-accent/50'
                }`}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 absolute right-2 top-2"
                  onClick={() => deleteNotification(notification.id)}
                  aria-label="Dismiss"
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="flex items-start gap-3">
                  {getIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {notification.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!serverItems && notifications.length > 0 && (
          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={markAllAsRead}
            >
              Mark All as Read
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default NotificationPanel;
