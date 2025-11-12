import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'

export const useGoogleAuthCallback = () => {
  const router = useRouter()
  const { setToken, setUser, clearError, error } = useAuthStore()

  useEffect(() => {
    // Verificar si hay un token en la URL (callback de Google)
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const error = urlParams.get('error')
    const errorCode = urlParams.get('code')

    // Solo procesar si viene de Google OAuth (tiene token o error con código específico)
    const isGoogleCallback = token || (error && errorCode && ['ACCOUNT_PENDING_APPROVAL', 'ACCOUNT_REJECTED', 'ACCOUNT_UNAVAILABLE', 'google_auth_failed', 'no_user'].includes(errorCode))
    
    if (!isGoogleCallback) {
      return
    }

    if (error) {
      console.error('Error en Google OAuth:', error)
      
      // Personalizar mensaje según el código de error
      let displayMessage = decodeURIComponent(error)
      if (errorCode === 'ACCOUNT_PENDING_APPROVAL') {
        displayMessage = '🕒 Tu cuenta está pendiente de aprobación por un administrador. Te notificaremos cuando sea aprobada.'
      } else if (errorCode === 'ACCOUNT_REJECTED') {
        displayMessage = '❌ Tu cuenta ha sido rechazada. Contacta al soporte para más información.'
      } else if (errorCode === 'ACCOUNT_UNAVAILABLE') {
        displayMessage = '⚠️ Tu cuenta no está disponible. Contacta al soporte.'
      }
      
      // Establecer el error en el store
      useAuthStore.setState({ error: displayMessage })
      
      // Limpiar la URL de parámetros de error
      router.replace('/')
      return
    }

    if (token) {
      // Decodificar el JWT para obtener información del usuario
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        
        setToken(token)
        setUser({
          id: payload.id,
          username: payload.username,
          role: payload.role,
          status: payload.status,
          googleId: payload.googleId,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          profileComplete: payload.profileComplete || false
        })

        // Si el perfil no está completo, ir al flujo de completado
        if (!payload.profileComplete) {
          router.replace('/profile-setup')
        } else {
          // Limpiar la URL y continuar al home
          router.replace('/')
        }
      } catch (error) {
        console.error('Error decodificando token:', error)
      }
    }
  }, [router, setToken, setUser])
}