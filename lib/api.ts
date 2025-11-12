import axios from 'axios'
import type { ApiError } from './types'

// Configuración base de Axios
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para manejar cookies de Google OAuth
})

// Interceptor de request para añadir token JWT
api.interceptors.request.use(
  (config) => {
    // Obtener token desde localStorage (se sincroniza con Zustand persist)
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage)
        const token = state?.token
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          // También enviarlo en header 'token' como espera el backend
          config.headers.token = token
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error)
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de response para manejar errores
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    let apiError: ApiError = {
      message: 'Error de conexión',
      status: error.response?.status
    }

    if (error.response) {
      // Error de respuesta del servidor
      apiError = {
        message: error.response.data?.message || 'Error del servidor',
        status: error.response.status
      }

      // Si el token expiró o es inválido, limpiar autenticación
      if (error.response.status === 401) {
        localStorage.removeItem('auth-storage')
        // Recargar página para resetear estado
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    } else if (error.request) {
      // Error de red
      apiError = {
        message: 'No se pudo conectar con el servidor',
        status: 0
      }
    } else {
      // Error de configuración
      apiError = {
        message: error.message || 'Error desconocido',
        status: 0
      }
    }

    return Promise.reject(apiError)
  }
)

export default api