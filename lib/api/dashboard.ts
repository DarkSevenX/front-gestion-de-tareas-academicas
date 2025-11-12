import { api } from '../api'
import { tasksApi } from './tasks'
import { projectsApi } from './projects'

export interface DashboardStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  activeProjects: number
  hoursWorked: number
  // Tutor-specific fields
  assignedStudents?: number
  assignedTasks?: number
  supervisingProjects?: number
}

export interface DashboardResponse {
  stats: DashboardStats
  recentTasks: any[]
  activeProjects: any[]
  upcomingEvents: any[]
}

export const dashboardApi = {
  // Obtener estadísticas del dashboard
  getStats: async (): Promise<DashboardStats> => {
    try {
      // Llamar al endpoint del backend que devuelve estadísticas basadas en el rol
      const response = await api.get('/dashboard/stats')
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  },

  // Obtener tareas recientes
  getRecentTasks: async () => {
    try {
      const tasks = await tasksApi.getAll()
      // Ordenar por fecha de creación (más recientes primero) y tomar los últimos 5
      return tasks
        .sort((a, b) => new Date(b.dueDate || '').getTime() - new Date(a.dueDate || '').getTime())
        .slice(0, 5)
    } catch (error) {
      console.error('Error fetching recent tasks:', error)
      throw error
    }
  },

  // Obtener proyectos activos
  getActiveProjects: async () => {
    try {
      const projects = await projectsApi.getAll()
      return projects.filter(p => p.status === 'En progreso' || p.status === 'Planificación')
    } catch (error) {
      console.error('Error fetching active projects:', error)
      throw error
    }
  },

  // Obtener eventos próximos (placeholder por ahora)
  getUpcomingEvents: async () => {
    try {
      // TODO: Implementar integración con Google Calendar
      return []
    } catch (error) {
      console.error('Error fetching upcoming events:', error)
      throw error
    }
  },

  // Obtener todos los datos del dashboard de una vez
  getDashboardData: async (): Promise<DashboardResponse> => {
    try {
      const [stats, recentTasks, activeProjects, upcomingEvents] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentTasks(),
        dashboardApi.getActiveProjects(),
        dashboardApi.getUpcomingEvents()
      ])

      return {
        stats,
        recentTasks,
        activeProjects,
        upcomingEvents
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  }
}