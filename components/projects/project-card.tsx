"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckSquare, Users } from "lucide-react"

interface ProjectCardProps {
  project: any
  onViewDetail: () => void
}

export function ProjectCard({ project, onViewDetail }: ProjectCardProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      'Planificación': "bg-yellow-100 text-yellow-700 border-yellow-200",
      'En progreso': "bg-green-100 text-green-700 border-green-200",
      'Completado': "bg-blue-100 text-blue-700 border-blue-200",
      'Pausado': "bg-gray-100 text-gray-700 border-gray-200",
    }
    
    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700 border-gray-200"}>
        {status}
      </Badge>
    )
  }

  // Generar color basado en el nombre del proyecto
  const getProjectColor = (name: string) => {
    const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#EF4444']
    const index = name.length % colors.length
    return colors[index]
  }

  return (
    <Card className="p-5 hover:shadow-lg transition-all cursor-pointer group" onClick={onViewDetail}>
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
          style={{ backgroundColor: getProjectColor(project.name) }}
        >
          {project.name.charAt(0).toUpperCase()}
        </div>
        {getStatusBadge(project.status)}
      </div>

      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.description || 'Sin descripción'}</p>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm pt-3 border-t">
          <div className="flex items-center gap-1 text-muted-foreground">
            <CheckSquare className="w-4 h-4" />
            <span>
              {project.tasks?.filter((t: any) => t.status === 'Completada').length || 0}/
              {project.tasks?.length || 0} tareas
            </span>
          </div>
          {project.endDate && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{new Date(project.endDate).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <div className="flex -space-x-2">
            {project.participants?.slice(0, 3).map((participant: any, idx: number) => (
              <Avatar key={participant.id || idx} className="w-7 h-7 border-2 border-background">
                <AvatarImage src={"/placeholder.svg"} />
                <AvatarFallback>
                  {(participant.firstName || participant.username || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {(project.participants?.length || 0) > 3 && (
              <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                +{(project.participants?.length || 0) - 3}
              </div>
            )}
          </div>
          {project.tutor && (
            <div className="ml-auto">
              <Badge variant="secondary" className="text-xs">
                Tutor: {project.tutor.firstName || project.tutor.username}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
