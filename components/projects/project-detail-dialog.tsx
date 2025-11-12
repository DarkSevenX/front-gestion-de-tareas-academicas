"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Calendar, Users, CheckSquare, Clock, Edit, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useAuthStore } from "@/lib/store/authStore"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface ProjectDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: any
  onEdit?: () => void
  onDelete?: () => void
}

export function ProjectDetailDialog({ open, onOpenChange, project, onEdit, onDelete }: ProjectDetailDialogProps) {
  const { user } = useAuthStore()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  if (!project) return null

  const isTutor = user?.role === 'TUTOR' || user?.role === 'ADMIN'
  const isProjectTutor = project.tutorId === user?.id

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: "bg-green-100 text-green-700 border-green-200",
      PLANNING: "bg-yellow-100 text-yellow-700 border-yellow-200",
      COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
      PAUSED: "bg-gray-100 text-gray-700 border-gray-200",
    }
    const labels = {
      ACTIVE: "Activo",
      PLANNING: "Planificación",
      COMPLETED: "Completado",
      PAUSED: "Pausado",
    }
    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const handleDelete = () => {
    setShowDeleteDialog(false)
    onDelete?.()
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: project.color || '#3b82f6' }}
              >
                {project.name?.charAt(0) || 'P'}
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl">{project.name}</DialogTitle>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(project.status)}
                {isTutor && isProjectTutor && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        onEdit?.()
                        onOpenChange(false)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Descripción</h3>
            <p className="text-muted-foreground">{project.description}</p>
          </div>

          {project.tasks && project.tasks.length > 0 && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progreso General</span>
                  <span className="text-sm font-bold">
                    {Math.round((project.tasks.filter((t: any) => t.status === 'Completada').length / project.tasks.length) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(project.tasks.filter((t: any) => t.status === 'Completada').length / project.tasks.length) * 100} 
                  className="h-3" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tareas</p>
                      <p className="text-xl font-bold">
                        {project.tasks.filter((t: any) => t.status === 'Completada').length}/{project.tasks.length}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Miembros</p>
                      <p className="text-xl font-bold">{project.participants?.length || 0}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}

          {(project.startDate || project.endDate) && (
            <div className="grid grid-cols-2 gap-4">
              {project.startDate && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Fecha de Inicio:</span>
                  </div>
                  <p className="text-sm">
                    {new Date(project.startDate).toLocaleDateString("es-ES", { dateStyle: "long" })}
                  </p>
                </div>
              )}
              {project.endDate && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Fecha de Fin:</span>
                  </div>
                  <p className="text-sm">{new Date(project.endDate).toLocaleDateString("es-ES", { dateStyle: "long" })}</p>
                </div>
              )}
            </div>
          )}

          <Separator />

          {project.participants && project.participants.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Miembros del Equipo
              </h3>
              <div className="space-y-2">
                {project.participants.map((member: any) => (
                  <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Avatar>
                      <AvatarImage src={member.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{member.username?.charAt(0) || member.firstName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium">{member.firstName && member.lastName ? `${member.firstName} ${member.lastName}` : member.username}</span>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {user?.googleId && user?.googleAccessToken && project.googleEventId && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Integración con Google Calendar
                </h3>
                <Card className="p-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-3">
                    Este proyecto está sincronizado con Google Calendar. Todas las fechas límite y eventos se actualizan
                    automáticamente.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Sincronizado</Badge>
                    <Badge variant="outline">Última sync: hace 2 horas</Badge>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>

    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente el proyecto
            <span className="font-semibold"> &quot;{project.name}&quot;</span> y todas sus tareas asociadas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
