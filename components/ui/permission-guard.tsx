import { ReactNode } from 'react'
import { usePermissions } from '@/hooks/usePermissions'

interface PermissionGuardProps {
  children: ReactNode
  requiredRoles?: string | string[]
  requiredPermission?: string
  fallback?: ReactNode
  showForStudent?: boolean
  showForTutor?: boolean
  showForAdmin?: boolean
}

export const PermissionGuard = ({
  children,
  requiredRoles,
  requiredPermission,
  fallback = null,
  showForStudent = false,
  showForTutor = false,
  showForAdmin = false
}: PermissionGuardProps) => {
  const { hasRole, isStudent, isTutor, isAdmin, can, permissions } = usePermissions()

  // Verificar por roles específicos
  if (requiredRoles) {
    if (!hasRole(requiredRoles)) {
      return <>{fallback}</>
    }
  }

  // Verificar por permiso específico
  if (requiredPermission) {
    if (!can(requiredPermission as keyof typeof permissions)) {
      return <>{fallback}</>
    }
  }

  // Verificar por flags de rol
  if (showForStudent || showForTutor || showForAdmin) {
    const hasRequiredRole = 
      (showForStudent && isStudent()) ||
      (showForTutor && isTutor()) ||
      (showForAdmin && isAdmin())
    
    if (!hasRequiredRole) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

// Componentes específicos para roles comunes
export const StudentOnly = ({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGuard showForStudent fallback={fallback}>
    {children}
  </PermissionGuard>
)

export const TutorOnly = ({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGuard showForTutor fallback={fallback}>
    {children}
  </PermissionGuard>
)

export const AdminOnly = ({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGuard showForAdmin fallback={fallback}>
    {children}
  </PermissionGuard>
)

export const TutorOrAdmin = ({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGuard requiredRoles={['TUTOR', 'ADMIN']} fallback={fallback}>
    {children}
  </PermissionGuard>
)