import { useAuthStore } from '@/lib/store/authStore'
import type { User } from '@/lib/types'

export const usePermissions = () => {
  const { user } = useAuthStore()

  const hasRole = (requiredRoles: string | string[]): boolean => {
    if (!user) return false
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    return roles.includes(user.role)
  }

  const isStudent = (): boolean => hasRole('ALUMNO')
  const isTutor = (): boolean => hasRole('TUTOR')
  const isAdmin = (): boolean => hasRole('ADMIN')
  const isTutorOrAdmin = (): boolean => hasRole(['TUTOR', 'ADMIN'])
  const isAdminOnly = (): boolean => hasRole('ADMIN')

  // Permisos específicos por funcionalidad
  const permissions = {
    // Tareas
    canCreateTasks: isTutorOrAdmin(),
    canEditAllTasks: isTutorOrAdmin(),
    canDeleteTasks: isTutorOrAdmin(),
    canAssignTasks: isTutorOrAdmin(),
    canViewOwnTasks: true, // Todos pueden ver sus tareas
    
    // Proyectos
    canCreateProjects: isTutorOrAdmin(),
    canEditAllProjects: isTutorOrAdmin(),
    canDeleteProjects: isTutorOrAdmin(),
    canManageProjectMembers: isTutorOrAdmin(),
    canViewAssignedProjects: true, // Todos pueden ver proyectos asignados
    
    // Usuarios
    canManageUsers: isAdminOnly(),
    canApproveUsers: isAdminOnly(),
    canViewAllUsers: isTutorOrAdmin(),
    
    // Exámenes
    canCreateExams: isTutorOrAdmin(),
    canGradeExams: isTutorOrAdmin(),
    canTakeExams: isStudent(),
    canViewExamResults: true, // Todos pueden ver sus resultados
    
    // Entregas
    canSubmitAssignments: isStudent(),
    canGradeSubmissions: isTutorOrAdmin(),
    canViewAllSubmissions: isTutorOrAdmin(),
    
    // Chat
    canAccessPublicChat: true, // Todos
    canAccessPrivateChat: true, // Todos
    canModerateChat: isTutorOrAdmin(),
    
    // Notificaciones
    canSendNotifications: isTutorOrAdmin(),
    canViewOwnNotifications: true, // Todos
    
    // Reportes
    canViewDetailedReports: isTutorOrAdmin(),
    canViewOwnProgress: true, // Todos pueden ver su progreso
    
    // Configuración
    canAccessSystemSettings: isAdminOnly(),
    canEditOwnProfile: true, // Todos
  }

  return {
    user,
    hasRole,
    isStudent,
    isTutor,
    isAdmin,
    isTutorOrAdmin,
    isAdminOnly,
    permissions,
    
    // Helper para componentes condicionales
    can: (permission: keyof typeof permissions) => permissions[permission]
  }
}