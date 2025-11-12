import { api } from '../api'
import type { Project, User } from '../types'

export interface CreateProjectData {
  name: string
  description?: string
  startDate?: string
  endDate?: string
  status?: string
  participants?: number[]
}

export interface UpdateProjectData {
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  status?: string
  participants?: number[]
}

export const projectsApi = {
  // Obtener todos los proyectos
  getAll: async (): Promise<Project[]> => {
    const response = await api.get('/projects')
    return response.data
  },

  // Obtener proyecto por ID
  getById: async (id: number): Promise<Project> => {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },

  // Crear nuevo proyecto
  create: async (data: CreateProjectData): Promise<Project> => {
    const response = await api.post('/projects', data)
    return response.data
  },

  // Actualizar proyecto
  update: async (id: number, data: UpdateProjectData): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data)
    return response.data
  },

  // Eliminar proyecto
  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`)
  },

  // Obtener participantes de un proyecto
  getParticipants: async (id: number): Promise<User[]> => {
    const response = await api.get(`/projects/${id}/participants`)
    return response.data
  }
}