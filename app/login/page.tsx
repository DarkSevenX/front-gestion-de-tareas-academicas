"use client"

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Preservar cualquier parámetro de error al redirigir
    const error = searchParams.get('error')
    const code = searchParams.get('code')
    
    let redirectUrl = '/'
    if (error || code) {
      const params = new URLSearchParams()
      if (error) params.set('error', error)
      if (code) params.set('code', code)
      redirectUrl = `/?${params.toString()}`
    }

    // Redirigir a la página principal donde está el componente de login
    router.replace(redirectUrl)
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirigiendo al login...</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  )
}