"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Lock, Bell, ShieldCheck, AlertCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { User as AppUser } from "@/lib/types"

interface SettingsViewProps { currentUser: AppUser }
export function SettingsView({ currentUser }: SettingsViewProps) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-balance">Configuración</h1>
        <p className="text-muted-foreground mt-1">Administra tu perfil y preferencias</p>
      </div>

      <Card className="p-6">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5" /> Perfil de Usuario
          </CardTitle>
          <CardDescription>Resumen completo de tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-6">
          <div className="flex flex-wrap items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={"/placeholder.svg"} />
              <AvatarFallback className="text-lg font-semibold">
                {(currentUser.firstName?.[0] || currentUser.username?.[0] || 'U').toUpperCase()}
                {(currentUser.lastName?.[0] || '')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <p className="text-xl font-semibold">
                {currentUser.firstName || currentUser.lastName ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : currentUser.username}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">ID: {currentUser.id}</Badge>
                <Badge className="capitalize">{currentUser.role.toLowerCase()}</Badge>
                <Badge className={
                  currentUser.status === 'APPROVED' ? 'bg-green-600' :
                  currentUser.status === 'PENDING' ? 'bg-yellow-500 text-black' : 'bg-red-600'
                }>{currentUser.status}</Badge>
                {!currentUser.profileComplete && (
                  <Badge variant="outline">Completa tu perfil</Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Usuario</p>
                <p className="text-sm font-medium">{currentUser.username}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Correo</p>
                <p className="text-sm font-medium">{currentUser.email || '—'}</p>
              </div>
              {/* Campos de integración externa ocultos deliberadamente */}
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Creado</p>
                <p className="text-sm font-medium">{currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleString() : '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Actualizado</p>
                <p className="text-sm font-medium">{currentUser.updatedAt ? new Date(currentUser.updatedAt).toLocaleString() : '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Estado</p>
                <p className="text-sm font-medium flex items-center gap-2">
                  {currentUser.status === 'APPROVED' && <ShieldCheck className="w-4 h-4 text-green-600" />}
                  {currentUser.status === 'PENDING' && <Clock className="w-4 h-4 text-yellow-600" />}
                  {currentUser.status === 'REJECTED' && <AlertCircle className="w-4 h-4 text-red-600" />}
                  {currentUser.status}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Perfil</p>
                <p className="text-sm font-medium">{currentUser.profileComplete ? 'Completo' : 'Pendiente de completar'}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="firstName">Nombre</Label>
            <Input id="firstName" defaultValue={currentUser.firstName || ''} placeholder="Nombre" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido</Label>
            <Input id="lastName" defaultValue={currentUser.lastName || ''} placeholder="Apellido" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" defaultValue={currentUser.email || ''} placeholder="tu@correo.com" />
          </div>
          <Button className="mt-2">Guardar Cambios</Button>
        </CardContent>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Seguridad
        </h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Contraseña Actual</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva Contraseña</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button>Actualizar Contraseña</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificaciones
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificaciones por Email</p>
              <p className="text-sm text-muted-foreground">Recibe actualizaciones por correo</p>
            </div>
            <Button variant="outline">Activado</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Recordatorios de Tareas</p>
              <p className="text-sm text-muted-foreground">Alertas sobre fechas límite</p>
            </div>
            <Button variant="outline">Activado</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
