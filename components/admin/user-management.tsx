"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Search, 
  Check, 
  X, 
  Users, 
  Clock, 
  UserCheck, 
  UserX, 
  RefreshCw,
  AlertCircle 
} from "lucide-react"
import { useUserManagement } from "@/hooks/useUserManagement"
import { usePermissions } from "@/hooks/usePermissions"
import { useAuthStore } from "@/lib/store/authStore"
import type { User } from "@/lib/types"

interface UserCardProps {
  user: User;
  onApprove: (userId: number) => void;
  onReject: (userId: number) => void;
  isLoading: boolean;
}

function UserCard({ user, onApprove, onReject, isLoading }: UserCardProps) {
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = async () => {
    setActionLoading('approve');
    try {
      await onApprove(user.id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    setActionLoading('reject');
    try {
      await onReject(user.id);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'TUTOR':
        return 'bg-blue-100 text-blue-800';
      case 'ALUMNO':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    return 'US';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(user.firstName, user.lastName, user.username)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.username
                  }
                </h3>
                <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                  {user.role}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-1">@{user.username}</p>
              
              {user.email && (
                <p className="text-sm text-muted-foreground">{user.email}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={isLoading || actionLoading !== null}
            >
              {actionLoading === 'approve' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Aprobar
            </Button>
            
            <Button
              size="sm"
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading || actionLoading !== null}
            >
              {actionLoading === 'reject' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
              Rechazar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuthStore();
  const {
    pendingUsers,
    stats,
    isLoading,
    error,
    approveUser,
    rejectUser,
    refresh
  } = useUserManagement();

  // Si no hay usuario cargado aún, mostrar loading
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cargando...</h1>
            <p className="text-muted-foreground mt-1">Verificando permisos</p>
          </div>
        </div>
      </div>
    );
  }

  // Verificar que el usuario tenga permisos de administrador
  if (user.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Acceso Denegado</h1>
            <p className="text-muted-foreground mt-1">No tienes permisos para acceder a esta sección</p>
          </div>
        </div>
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Esta sección es solo para administradores. Solo los usuarios con rol de administrador pueden gestionar otros usuarios.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const filteredUsers = pendingUsers.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
            <p className="text-muted-foreground mt-1">Aprobar o rechazar usuarios pendientes</p>
          </div>
        </div>
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Error al cargar usuarios: {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refresh}
              className="ml-2"
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1">Aprobar o rechazar usuarios pendientes</p>
        </div>
        <Button onClick={refresh} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuarios Pendientes</p>
                <p className="text-2xl font-bold mt-1">{pendingUsers.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Usuarios</p>
                <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuarios Activos</p>
                <p className="text-2xl font-bold mt-1">{stats.activeUsers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Usuarios Pendientes de Aprobación</CardTitle>
          <CardDescription>
            Revisa y gestiona las solicitudes de registro de nuevos usuarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios por nombre, email, rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No hay usuarios pendientes</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron usuarios que coincidan con tu búsqueda.' 
                : 'Todos los usuarios han sido procesados.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onApprove={approveUser}
                  onReject={rejectUser}
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}