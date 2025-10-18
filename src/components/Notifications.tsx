
import { Bell } from 'lucide-react';

// Interfaz para una notificación
export interface Notification {
  id: number;
  message: string;
  read: boolean;
  link: string;
}

interface NotificationsProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
}

export default function Notifications({ notifications, onNotificationClick }: NotificationsProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <Bell className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {unreadCount}
        </span>
      )}
    </div>
  );
}
