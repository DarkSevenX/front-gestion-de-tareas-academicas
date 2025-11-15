"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'

export default function ProfileSetupPage() {
  const router = useRouter()
  const { user, setUser, setToken, token } = useAuthStore()
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  // Email proveniente de Google, no editable
  const [email] = useState(user?.email || '')
  const [role, setRole] = useState<'ALUMNO' | 'TUTOR'>(user?.role === 'TUTOR' ? 'TUTOR' : 'ALUMNO')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Si viene token en query, guardarlo (para casos de redirección directa desde backend)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setToken(token)
        setUser({
          id: payload.id,
          username: payload.username,
          role: payload.role,
          status: payload.status,
          profileComplete: payload.profileComplete || false,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email
        } as any)
      } catch {}
    }
  }, [setToken, setUser])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!firstName || !lastName) {
      setError('Completa nombre y apellido')
      return
    }

    try {
      setIsSubmitting(true)
      const fullName = `${firstName} ${lastName}`.trim()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}profile/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // El token httpOnly también está en cookie; aquí no añadimos Authorization a propósito
        },
        credentials: 'include',
        body: JSON.stringify({ fullName, role }) // email ya está en backend
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo completar el perfil')
      }

      // Actualizar store con el usuario completo y token
      if (data.token) setToken(data.token)
      if (data.user) setUser({ ...(user as any), ...data.user })

      // Ambos roles quedan PENDING tras completar perfil
      if (data.user?.status === 'PENDING') {
        setSuccess('Tu perfil se completó. Tu cuenta está pendiente de aprobación. No puedes ingresar hasta que un administrador la apruebe.')
        // Forzar limpieza de auth en cliente
        try { localStorage.removeItem('auth-storage') } catch {}
        setTimeout(() => router.replace('/login'), 2000)
        return
      }
      setSuccess('Perfil completado. Redirigiendo...')
      setTimeout(() => router.replace('/'), 800)
    } catch (err: any) {
      setError(err.message || 'Error al completar perfil')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-xl border-2">
        <CardHeader>
          <CardTitle>Completa tu perfil</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div>
                <Label>Apellido</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            {email && (
              <div>
                <Label>Email (de Google)</Label>
                <Input type="email" value={email} disabled readOnly className="opacity-80" />
              </div>
            )}
            <div>
              <Label>Rol</Label>
              <Select value={role} onValueChange={(v: 'ALUMNO' | 'TUTOR') => setRole(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALUMNO">Alumno</SelectItem>
                  <SelectItem value="TUTOR">Tutor</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Ambos roles requieren aprobación de un administrador.</p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar y continuar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
