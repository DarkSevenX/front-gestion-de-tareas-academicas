import { useState, useEffect } from 'react'
import { dashboardApi } from '@/lib/api/dashboard'
import type { Task, Project } from '@/lib/types'
import { useAuthStore } from '@/lib/store/authStore'

interface DashboardStats {
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

interface DashboardData {
  stats: DashboardStats | null
  recentTasks: Task[]
  activeProjects: Project[]
  upcomingEvents: any[]
  isLoading: boolean
  error: string | null
}

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    recentTasks: [],
    activeProjects: [],
    upcomingEvents: [],
    isLoading: true,
    error: null
  })

  const { token } = useAuthStore()

  const loadDashboardData = async () => {
    if (!token) return
    
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }))

      const [stats, recentTasks, activeProjects, upcomingEvents] = await Promise.all([
        dashboardApi.getStats().catch(() => null),
        dashboardApi.getRecentTasks().catch(() => []),
        dashboardApi.getActiveProjects().catch(() => []),
        dashboardApi.getUpcomingEvents().catch(() => [])
      ])

      setData({
        stats: stats || {
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          activeProjects: 0,
          hoursWorked: 0
        },
        recentTasks: recentTasks || [],
        activeProjects: activeProjects || [],
        upcomingEvents: upcomingEvents || [],
        isLoading: false,
        error: null
      })
    } catch (error: any) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error cargando datos del dashboard'
      }))
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [token])

  return {
    ...data,
    refresh: loadDashboardData
  }
}