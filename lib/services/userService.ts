import { api } from '../api';
import type { User } from '../types';

export interface UserManagementResponse {
  message: string;
  user: User;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  approvedUsers: number;
  rejectedUsers: number;
}

export const userService = {
  // Obtener usuarios pendientes de aprobación
  getPendingUsers: async (): Promise<User[]> => {
    const response = await api.get('/users/pending');
    return response.data;
  },

  // Obtener todos los usuarios (solo admin)
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // Obtener estadísticas de usuarios
  getUserStats: async (): Promise<UserStats> => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  // Aprobar un usuario
  approveUser: async (userId: number): Promise<UserManagementResponse> => {
    const response = await api.patch(`/users/${userId}/approve`);
    return response.data;
  },

  // Rechazar un usuario
  rejectUser: async (userId: number): Promise<UserManagementResponse> => {
    const response = await api.patch(`/users/${userId}/reject`);
    return response.data;
  },

  // Obtener información del usuario actual
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Actualizar información del usuario actual
  updateCurrentUser: async (userData: Partial<User>): Promise<User> => {
    const response = await api.patch('/users/me', userData);
    return response.data;
  },

  // Eliminar usuario actual
  deleteCurrentUser: async (): Promise<void> => {
    await api.delete('/users/me');
  },
};