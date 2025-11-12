import { useState, useEffect } from 'react';
import { userService, UserManagementResponse } from '@/lib/services/userService';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

export function useUserManagement() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, pendingUsers: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { permissions } = usePermissions();

  const fetchUserStats = async () => {
    if (!permissions.canManageUsers) {
      return;
    }

    try {
      const userStats = await userService.getUserStats();
      setStats(userStats);
    } catch (err: any) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const fetchPendingUsers = async () => {
    if (!permissions.canManageUsers) {
      setError('No tienes permisos para gestionar usuarios');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const users = await userService.getPendingUsers();
      setPendingUsers(users);
      // Cargar estadísticas también
      await fetchUserStats();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al cargar usuarios pendientes';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    if (!permissions.canViewAllUsers) {
      setError('No tienes permisos para ver todos los usuarios');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const users = await userService.getAllUsers();
      setAllUsers(users);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al cargar usuarios';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const approveUser = async (userId: number) => {
    if (!permissions.canApproveUsers) {
      toast({
        title: "Error",
        description: "No tienes permisos para aprobar usuarios",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await userService.approveUser(userId);
      
      // Actualizar estado local
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      setAllUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: 'APPROVED' as const } : user
      ));

      toast({
        title: "Usuario aprobado",
        description: response.message,
      });

      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al aprobar usuario';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectUser = async (userId: number) => {
    if (!permissions.canApproveUsers) {
      toast({
        title: "Error",
        description: "No tienes permisos para rechazar usuarios",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await userService.rejectUser(userId);
      
      // Actualizar estado local
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      setAllUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: 'REJECTED' as const } : user
      ));

      toast({
        title: "Usuario rechazado",
        description: response.message,
      });

      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al rechazar usuario';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    if (permissions.canManageUsers) {
      fetchPendingUsers();
    }
    if (permissions.canViewAllUsers) {
      fetchAllUsers();
    }
  };

  useEffect(() => {
    if (permissions.canManageUsers) {
      fetchPendingUsers();
    }
  }, [permissions.canManageUsers]);

  return {
    pendingUsers,
    allUsers,
    stats,
    isLoading,
    error,
    approveUser,
    rejectUser,
    fetchPendingUsers,
    fetchAllUsers,
    refresh,
  };
}