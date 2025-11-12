"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Mail, Lock, AlertCircle } from "lucide-react"
import { useAuthStore } from "@/lib/store/authStore"

interface LoginViewProps {
  onLogin: (user: any) => void
  onSwitchToRegister: () => void
}

export function LoginView({ onLogin, onSwitchToRegister }: LoginViewProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  
  const { login, isLoading, error, clearError } = useAuthStore()

  // Limpiar errores cuando el usuario empiece a escribir
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
    if (error) clearError()
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (error) clearError()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await login({ username, password })
      // Si llega aquí, el login fue exitoso
      const user = useAuthStore.getState().user
      if (user) {
        onLogin(user)
      }
    } catch (error: any) {
      // Error ya está manejado por el store y se muestra en el Alert
      console.error('Login error:', error.status)
    }
  }

  const handleGoogleLogin = () => {
    // Redirigir al endpoint de Google OAuth del backend
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/google`
  }

  return (
    <Card className="w-full max-w-md shadow-2xl border-2 border-primary/10 bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-4 text-center pb-8">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
          <GraduationCap className="w-9 h-9 text-primary-foreground" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Bienvenido de vuelta
          </CardTitle>
          <CardDescription className="text-base">Ingresa para gestionar tus proyectos académicos</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant={error.includes('🕒') || error.includes('✅') ? 'default' : 'destructive'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Usuario o Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="tu-usuario"
                value={username}
                onChange={handleUsernameChange}
                className="pl-10 h-12 border-2 focus-visible:ring-primary"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                className="pl-10 h-12 border-2 focus-visible:ring-primary"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">O continúa con</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-2 hover:bg-muted/50 transition-colors bg-transparent"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">¿No tienes cuenta? </span>
          <Button variant="link" className="p-0 h-auto font-semibold text-primary" onClick={onSwitchToRegister}>
            Regístrate aquí
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
