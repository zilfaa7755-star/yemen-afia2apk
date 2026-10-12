import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { Bell, CheckCircle, Clock, AlertTriangle, X, Users } from 'lucide-react';

export interface AppNotification {
  id: string;
  type: 'queue_update' | 'booking_confirmed' | 'queue_moved' | 'info' | 'warning';
  title: string;
  message: string;
  queuePosition?: number;
  arrivalTime?: string;
  waitMinutes?: number;
  timestamp: Date;
  autoClose?: number;
}

interface NotificationContextType {
  notifications: AppNotification[];
  toasts: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  markAllRead: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addNotification = useCallback(
    (n: Omit<AppNotification, 'id' | 'timestamp'>) => {
      const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const notification: AppNotification = { ...n, id, timestamp: new Date() };

      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setToasts((prev) => [notification, ...prev].slice(0, 5));

      const closeAfter = n.autoClose ?? (n.type === 'queue_update' || n.type === 'queue_moved' ? 8000 : 5000);
      const timer = setTimeout(() => removeToast(id), closeAfter);
      timersRef.current.set(id, timer);

      // Browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(n.title, { body: n.message, icon: '/favicon.ico' });
      }
    },
    [removeToast]
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const unreadCount = notifications.filter((n) => !(n as AppNotification & { read?: boolean }).read).length;

  return (
    <NotificationContext.Provider value={{ notifications, toasts, addNotification, removeToast, markAllRead, unreadCount }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
}

const toastIcons: Record<AppNotification['type'], React.ElementType> = {
  queue_update: Clock,
  booking_confirmed: CheckCircle,
  queue_moved: Users,
  info: Bell,
  warning: AlertTriangle,
};

const toastColors: Record<AppNotification['type'], string> = {
  queue_update: 'bg-blue-500',
  booking_confirmed: 'bg-green-500',
  queue_moved: 'bg-orange-500',
  info: 'bg-gray-600',
  warning: 'bg-amber-500',
};

function ToastContainer({ toasts, onClose }: { toasts: AppNotification[]; onClose: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }: { toast: AppNotification; onClose: (id: string) => void }) {
  const Icon = toastIcons[toast.type];
  const iconBg = toastColors[toast.type];

  return (
    <div
      className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-down"
      style={{ maxWidth: '100%' }}
    >
      <div className={`h-1 ${iconBg}`} />
      <div className="p-4 flex items-start gap-3">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0 text-right">
          <p className="font-bold text-gray-800 text-sm">{toast.title}</p>
          <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">{toast.message}</p>
          {toast.arrivalTime && (
            <div className="mt-2 flex items-center justify-end gap-3">
              {toast.queuePosition && (
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-lg">
                  طابور #{toast.queuePosition}
                </span>
              )}
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                <Clock size={12} />
                احضر الساعة {toast.arrivalTime}
              </span>
            </div>
          )}
          {toast.waitMinutes !== undefined && !toast.arrivalTime && (
            <span className="mt-1 inline-block bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-lg">
              انتظر {toast.waitMinutes} دقيقة
            </span>
          )}
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
