import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  removeNotification: (id: number) => void;
  resetNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
        }),

      addNotification: (notification) =>
        set((state) => {
          // Check if notification already exists
          const exists = state.notifications.some((n) => n.id === notification.id);
          if (exists) return state;

          const newNotifications = [notification, ...state.notifications];
          return {
            notifications: newNotifications,
            unreadCount: newNotifications.filter((n) => !n.isRead).length,
          };
        }),

      markAsRead: (id) =>
        set((state) => {
          const newNotifications = state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          );
          return {
            notifications: newNotifications,
            unreadCount: newNotifications.filter((n) => !n.isRead).length,
          };
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        })),

      removeNotification: (id) =>
        set((state) => {
          const newNotifications = state.notifications.filter((n) => n.id !== id);
          return {
            notifications: newNotifications,
            unreadCount: newNotifications.filter((n) => !n.isRead).length,
          };
        }),

      resetNotifications: () =>
        set({
          notifications: [],
          unreadCount: 0,
        }),
    }),
    {
      name: 'notification-storage',
    }
  )
);
