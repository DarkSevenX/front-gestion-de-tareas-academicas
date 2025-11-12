import api from '../api';
import { Notification } from '../types';

export const notificationService = {
  // Get all notifications for the current user
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get<Notification[]>('/notifications');
    return response.data;
  },

  // Mark a notification as read
  async markAsRead(id: number): Promise<Notification> {
    const response = await api.put<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  },

  // Delete a notification
  async deleteNotification(id: number): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  // Get notification stats
  async getStats(): Promise<{ total: number; unread: number }> {
    const response = await api.get<{ total: number; unread: number }>('/notifications/stats');
    return response.data;
  },
};
