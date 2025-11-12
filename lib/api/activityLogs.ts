import { api } from '../api'

export interface ActivityLog {
  id: number
  user: {
    id: number
    username: string
    role: string
  }
  action: string
  entityType: string
  entityId: number
  details?: string
  oldValues?: any
  newValues?: any
  timestamp: string
}

export const activityLogsApi = {
  // Obtener historial de actividades por entidad
  getByEntity: async (entityType: string, entityId: number, limit?: number): Promise<ActivityLog[]> => {
    const params = limit ? `?limit=${limit}` : ''
    const response = await api.get(`/activity-logs/${entityType}/${entityId}${params}`)
    return response.data
  }
}
