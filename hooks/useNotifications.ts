import { useEffect, useState } from 'react';
import { notificationService } from '@/lib/services/notificationService';
import { useNotificationStore } from '@/lib/store/notificationStore';
import { useSocketStore } from '@/lib/store/socketStore';
import { Notification } from '@/lib/types';

export const useNotifications = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    notifications,
    unreadCount,
    setNotifications,
    addNotification,
    markAsRead: markAsReadStore,
    markAllAsRead: markAllAsReadStore,
    removeNotification: removeNotificationStore,
  } = useNotificationStore();

  const { socket, onNotification } = useSocketStore();

  // Fetch notifications from API on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await notificationService.getNotifications();
        setNotifications(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar notificaciones');
        console.error('Error fetching notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [setNotifications]);

  // Listen for real-time notifications via socket
  useEffect(() => {
    if (!socket) return;

    const unsubscribe = onNotification((notification: Notification) => {
      console.log('New notification received:', notification);
      addNotification(notification);
    });

    return () => {
      unsubscribe();
    };
  }, [socket, onNotification, addNotification]);

  // Mark notification as read
  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      markAsReadStore(id);
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      markAllAsReadStore();
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  };

  // Delete notification
  const deleteNotification = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      removeNotificationStore(id);
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
