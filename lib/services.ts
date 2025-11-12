import { api } from './api'
import type { Task, Project, User, Notification } from './types'

// Servicios para el Dashboard
export const dashboardService = {
  // Obtener estadísticas generales
  async getStats() {
    const response = await api.get('/reports/dashboard')
    return response.data
  },

  // Obtener tareas recientes
  async getRecentTasks(limit = 5) {
    const response = await api.get(`/tasks?limit=${limit}&sort=recent`)
    return response.data
  },

  // Obtener proyectos activos
  async getActiveProjects() {
    const response = await api.get('/projects?status=active')
    return response.data
  },

  // Obtener próximos eventos/tareas
  async getUpcomingEvents() {
    const response = await api.get('/tasks?upcoming=true')
    return response.data
  },

  // Obtener notificaciones recientes
  async getRecentNotifications(limit = 5) {
    const response = await api.get(`/notifications?limit=${limit}`)
    return response.data
  }
}

// Servicios para Tareas
export const taskService = {
  async getAll(filters?: {
    status?: string
    priority?: string
    type?: string
    projectId?: number
  }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })
    }
    
    const response = await api.get(`/tasks?${params.toString()}`)
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/tasks/${id}`)
    return response.data
  },

  async create(taskData: Partial<Task>) {
    const response = await api.post('/tasks', taskData)
    return response.data
  },

  async update(id: number, taskData: Partial<Task>) {
    const response = await api.put(`/tasks/${id}`, taskData)
    return response.data
  },

  async delete(id: number) {
    const response = await api.delete(`/tasks/${id}`)
    return response.data
  }
}

// Servicios para Proyectos
export const projectService = {
  async getAll() {
    const response = await api.get('/projects')
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },

  async create(projectData: Partial<Project>) {
    const response = await api.post('/projects', projectData)
    return response.data
  },

  async update(id: number, projectData: Partial<Project>) {
    const response = await api.put(`/projects/${id}`, projectData)
    return response.data
  },

  async delete(id: number) {
    const response = await api.delete(`/projects/${id}`)
    return response.data
  }
}

// Servicios para Usuarios (solo admin/tutor)
export const userService = {
  async getAll(filters?: { role?: string; status?: string }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    
    const response = await api.get(`/user?${params.toString()}`)
    return response.data
  },

  async updateStatus(id: number, status: 'APPROVED' | 'REJECTED') {
    const response = await api.put(`/admin/users/${id}/status`, { status })
    return response.data
  }
}

// Servicios para Notificaciones
export const notificationService = {
  async getAll() {
    const response = await api.get('/notifications')
    return response.data
  },

  async markAsRead(id: number) {
    const response = await api.put(`/notifications/${id}/read`)
    return response.data
  },

  async markAllAsRead() {
    const response = await api.put('/notifications/read-all')
    return response.data
  }
}

// Servicios para Chat
export const chatService = {
  async getPublicMessages(limit = 50) {
    const response = await api.get(`/api/chat/messages?limit=${limit}`)
    return response.data
  },

  async getPrivateMessages(recipientId: number) {
    const response = await api.get(`/api/chat/private-messages/${recipientId}`)
    return response.data
  },

  async getUsers() {
    const response = await api.get('/users')
    return response.data
  }
}

// Servicios para Exámenes
export const examService = {
  async getAll() {
    const response = await api.get('/exams')
    return response.data
  },

  async create(examData: any) {
    const response = await api.post('/exams', examData)
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/exams/${id}`)
    return response.data
  },

  async submit(id: number, answers: any[]) {
    const response = await api.post(`/exams/${id}/submit`, { answers })
    return response.data
  },

  async getResults(id: number) {
    const response = await api.get(`/exams/${id}/results`)
    return response.data
  }
}