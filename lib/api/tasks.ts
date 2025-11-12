import { api } from '../api'
import type { Task } from '../types'

export interface CreateTaskData {
  projectId?: number
  name: string
  description?: string
  responsibleId?: number
  responsibleIds?: number[]
  dueDate?: string
  priority: 'Baja' | 'Media' | 'Alta'
  status?: 'Pendiente' | 'En progreso' | 'Completada' | 'Bloqueada'
  type?: 'daily' | 'project'
}

export interface UpdateTaskData {
  name?: string
  description?: string
  dueDate?: string
  priority?: 'Baja' | 'Media' | 'Alta'
  status?: 'Pendiente' | 'En progreso' | 'Completada' | 'Bloqueada'
}

export const tasksApi = {
  // Obtener todas las tareas
  getAll: async (): Promise<Task[]> => {
    // Añadir parámetro de cache-busting para asegurar datos frescos tras entregas
    const response = await api.get(`/tasks?_ts=${Date.now()}`)
    return response.data
  },

  // Obtener tarea por ID
  getById: async (id: number): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`)
    return response.data
  },

  // Crear nueva tarea
  create: async (data: CreateTaskData): Promise<{ tasks: Task[]; count: number; calendarWarning?: string; calendarWarningCode?: string }> => {
    const response = await api.post('/tasks', data)
    // Backend puede devolver { tasks, count, calendarWarning, calendarWarningCode }
    return response.data
  },

  // Actualizar tarea
  update: async (id: number, data: UpdateTaskData): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, data)
    return response.data
  },

  // Eliminar tarea
  delete: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`)
  },

  // Obtener tareas por proyecto
  getByProject: async (projectId: number): Promise<Task[]> => {
    const response = await api.get(`/tasks?projectId=${projectId}`)
    return response.data
  }
}