"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Calendar, Flag } from "lucide-react"

interface TaskCardProps {
  task: any
  onViewDetail: () => void
}

export function TaskCard({ task, onViewDetail }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    const colors = {
      'Alta': "bg-red-100 text-red-700 border-red-200",
      'Media': "bg-yellow-100 text-yellow-700 border-yellow-200",
      'Baja': "bg-green-100 text-green-700 border-green-200",
    }
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'Pendiente': "bg-slate-100 text-slate-700 border-slate-200",
      'En progreso': "bg-blue-100 text-blue-700 border-blue-200",
      'Completada': "bg-green-100 text-green-700 border-green-200",
      'Bloqueada': "bg-red-100 text-red-700 border-red-200",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  // Vista agregada para tutores (múltiples responsables)
  const isAggregated = task.responsibles && task.responsibles.length > 0

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onViewDetail}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">{task.name}</h3>
            {/* Solo mostrar prioridad y estado si NO es vista agregada de tutor */}
            {!isAggregated && (
              <>
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  <Flag className="w-3 h-3 mr-1" />
                  {task.priority}
                </Badge>
                <Badge variant="outline" className={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
              </>
            )}
          </div>
          <p className="text-muted-foreground text-sm mb-3">{task.description || 'Sin descripción'}</p>
          
          <div className="flex items-center gap-4 text-sm">
            {isAggregated ? (
              // Vista para tutores con múltiples responsables (solo mostrar el total de alumnos)
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {task.responsibles.length} alumno(s)
                </Badge>
              </div>
            ) : (
              // Vista normal para alumnos
              <>
                {task.responsible && (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={"/placeholder.svg"} />
                      <AvatarFallback>{(task.responsible.firstName || task.responsible.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-muted-foreground">
                      {task.responsible.firstName 
                        ? `${task.responsible.firstName} ${task.responsible.lastName || ''}`.trim()
                        : task.responsible.username
                      }
                    </span>
                  </div>
                )}
              </>
            )}
            
            {task.dueDate && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{new Date(task.dueDate).toLocaleDateString("es-ES")}</span>
              </div>
            )}
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {task.type === 'project' ? 'Proyecto' : 'Diaria'}
            </Badge>
            {task.project && (
              <Badge variant="outline" className="text-xs">
                {task.project.name}
              </Badge>
            )}
          </div>
        </div>
        <div className="w-16 text-right">
          <div className="text-xs text-muted-foreground">#{task.id}</div>
        </div>
      </div>
    </Card>
  )
}
