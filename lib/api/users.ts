import { api } from '../api'
import type { User } from '../types'

export const usersApi = {
  // Obtener todos los usuarios
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users')
    return response.data
  },

  // Obtener usuarios por rol
  getByRole: async (role: 'ALUMNO' | 'TUTOR' | 'ADMIN'): Promise<User[]> => {
    const response = await api.get('/users')
    return response.data.filter((user: User) => user.role === role)
  },

  // Obtener usuario actual
  getMe: async (): Promise<User> => {
    const response = await api.get('/users/me')
    return response.data
  },

  // Obtener usuarios pendientes de aprobación
  getPending: async (): Promise<User[]> => {
    const response = await api.get('/users/pending')
    return response.data
  },

  // Aprobar usuario
  approve: async (id: number): Promise<User> => {
    const response = await api.patch(`/users/${id}/approve`)
    return response.data
  },

  // Rechazar usuario
  reject: async (id: number): Promise<void> => {
    await api.patch(`/users/${id}/reject`)
  },

  // Actualizar usuario
  update: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch('/users/me', data)
    return response.data
  },

  // Eliminar usuario
  delete: async (): Promise<void> => {
    await api.delete('/users/me')
  }
}
