"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { User } from "@/lib/types"

interface ProfileViewProps {
  currentUser: User
}

export function ProfileView({ currentUser }: ProfileViewProps) {
  const initials = (currentUser.firstName?.[0] || currentUser.username?.[0] || 'U') + (currentUser.lastName?.[0] || '')

  const infoRows: { label: string; value?: string | number | boolean }[] = [
    { label: 'Usuario', value: currentUser.username },
    { label: 'Nombre', value: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || undefined },
    { label: 'Correo', value: currentUser.email || undefined },
    { label: 'Rol', value: currentUser.role },
    { label: 'Estado', value: currentUser.status },
    { label: 'Perfil Completo', value: currentUser.profileComplete ? 'Sí' : 'No' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-xl">
            {initials.toUpperCase()}
          </div>
          <div>
            <CardTitle className="text-2xl">Mi Perfil</CardTitle>
            <CardDescription>Información de tu cuenta</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">{currentUser.role}</Badge>
            <Badge className={currentUser.status === 'APPROVED' ? 'bg-green-600' : currentUser.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-600'}>
              {currentUser.status}
            </Badge>
            {currentUser.profileComplete ? (
              <Badge className="bg-primary">Perfil Completo</Badge>
            ) : (
              <Badge variant="outline">Perfil Incompleto</Badge>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infoRows.map((row) => (
              <div key={row.label} className="space-y-1">
                <p className="text-xs text-muted-foreground">{row.label}</p>
                <p className="text-sm font-medium">{row.value || '—'}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
