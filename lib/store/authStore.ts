import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types'
import { api } from '../api'
import { useChatStore } from './chatStore'
import { useSocketStore } from './socketStore'
import { useNotificationStore } from './notificationStore'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<{ status: string; message?: string; user?: User } | void>
  logout: () => void
  clearError: () => void
  setLoading: (loading: boolean) => void
  setUser: (user: User) => void
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await api.post<AuthResponse>('/auth/login', credentials)
          const { user, token } = response.data
          // Sanitizar cualquier rastro previo de chat de otro usuario antes de establecer nuevo usuario
          try { useChatStore.getState().resetChat() } catch {}
          try { localStorage.removeItem('chat-storage') } catch {}
          try { useNotificationStore.getState().resetNotifications() } catch {}
          try { localStorage.removeItem('notification-storage') } catch {}
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          // Extraer y normalizar mensajes de error más descriptivos según status y payload
          const status = error?.status
          const data = error?.data
          let errorMessage: string = 'Error al iniciar sesión'

          if (status) {
            switch (status) {
              case 400: {
                // Error de validación de Zod
                if (data?.errors?.length) {
                  // Tomar el primer mensaje o concatenar brevemente
                  const msgs = data.errors.map((e: any) => e.message).filter(Boolean)
                  errorMessage = msgs[0] || 'Datos inválidos'
                } else {
                  errorMessage = data?.message || 'Solicitud inválida'
                }
                break
              }
              case 401:
                errorMessage = data?.message || 'Contraseña incorrecta'
                break
              case 403:
                // Mensajes de estados de cuenta (PENDING / REJECTED / UNAVAILABLE)
                errorMessage = data?.message || 'Acceso no autorizado'
                break
              case 404:
                errorMessage = data?.message || 'Usuario no encontrado'
                break
              default:
                errorMessage = data?.message || errorMessage
            }
          } else if (error?.request && !error?.response) {
            // Error de red / servidor caído
            errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión.'
          }

          set({ isLoading: false, error: errorMessage })
          // Relanzar para permitir manejo adicional en componentes si lo desean
          throw error
        }
      },

      register: async (credentials: RegisterCredentials) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await api.post('/auth/register', credentials)
          const responseData = response.data
          
          // Si el usuario está pendiente de aprobación, no loguearlo automáticamente
          if (responseData.status === 'PENDING') {
            const message = responseData.message || '✅ Usuario registrado exitosamente. Tu cuenta está pendiente de aprobación por un administrador.'
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: message // Este será el mensaje de éxito con info de aprobación pendiente
            })
            // No lanzar excepción, el mensaje se mostrará como información
            return { status: 'PENDING', message }
          } else {
            // Usuario aprobado inmediatamente (caso poco común)
            const { user, token } = responseData
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
            return { status: 'APPROVED', user }
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Error al registrarse'
          set({
            isLoading: false,
            error: errorMessage
          })
          throw error
        }
      },

      logout: () => {
        // Desconectar socket y limpiar chat antes de borrar auth
        try { useSocketStore.getState().disconnect() } catch {}
        try { useChatStore.getState().resetChat() } catch {}
        try { useNotificationStore.getState().resetNotifications() } catch {}
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
        // Limpiar persistencias
        localStorage.removeItem('auth-storage')
        localStorage.removeItem('chat-storage')
        localStorage.removeItem('notification-storage')
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setUser: (user: User) => set({ user }),
      setToken: (token: string) => set({ token, isAuthenticated: true })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)