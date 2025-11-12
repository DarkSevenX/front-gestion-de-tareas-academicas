"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ListTodo, FolderKanban, CheckCircle2, Clock, TrendingUp, Calendar, AlertCircle, Award, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useDashboard } from "@/hooks/useDashboard"
import { usePermissions } from "@/hooks/usePermissions"
import { TutorOrAdmin } from "@/components/ui/permission-guard"
import type { User } from "@/lib/types"
import { MiniCalendar } from "./mini-calendar"
import { useTasks } from "@/hooks/useTasks"

interface DashboardProps {
  currentUser: User | null
  onNavigate?: (view: string) => void
}

export function Dashboard({ currentUser, onNavigate }: DashboardProps) {
  const { stats, recentTasks, activeProjects, upcomingEvents, isLoading, error, refresh } = useDashboard()
  const { permissions, isStudent } = usePermissions()
  const { tasks, loading: tasksLoading } = useTasks()
  
  if (!currentUser) {
    return <div>No hay usuario autenticado</div>
  }

  // Estadísticas según el rol del usuario
  const isTutor = currentUser?.role === 'TUTOR'
  const isAdmin = currentUser?.role === 'ADMIN'
  
  // Tutor ve estadísticas diferentes
  const statsCards = isTutor ? [
    {
      title: "Alumnos Asignados",
      value: stats?.assignedStudents?.toString() || "0",
      change: "Total bajo tu tutela",
      icon: ListTodo,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Proyectos Supervisando",
      value: stats?.activeProjects?.toString() || "0",
      change: "Proyectos activos",
      icon: FolderKanban,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Tareas Asignadas",
      value: stats?.assignedTasks?.toString() || "0",
      change: "A tus alumnos",
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Horas Trabajadas",
      value: `${stats?.hoursWorked || 0}h`,
      change: "Esta semana",
      icon: Clock,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ] : [
    {
      title: "Tareas Pendientes",
      value: stats?.pendingTasks?.toString() || "0",
      change: "+2 esta semana",
      icon: ListTodo,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Proyectos Activos",
      value: stats?.activeProjects?.toString() || "0",
      change: "2 por vencer",
      icon: FolderKanban,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Tareas Completadas",
      value: stats?.completedTasks?.toString() || "0",
      change: `+${stats?.completedTasks || 0} este mes`,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Horas Trabajadas",
      value: `${stats?.hoursWorked || 0}h`,
      change: "Esta semana",
      icon: Clock,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "Media":
        return "bg-warning/10 text-warning-foreground border-warning/20"
      case "Baja":
        return "bg-info/10 text-info-foreground border-info/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completada":
        return "bg-success/10 text-success border-success/20"
      case "En progreso":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20"
      case "Pendiente":
        return "bg-muted text-muted-foreground border-border"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">¡Hola, {currentUser?.firstName || currentUser?.username}! 👋</h1>
          <p className="text-muted-foreground mt-1">Aquí está tu resumen académico de hoy</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          {/* Solo tutores y admins pueden crear tareas */}
          {/* <TutorOrAdmin>
            <Button size="lg" className="shadow-lg">
              <Calendar className="w-4 h-4 mr-2" />
              Nueva Tarea
            </Button>
          </TutorOrAdmin> */}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <Card className="lg:col-span-2 border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Tareas Recientes</CardTitle>
                <CardDescription className="mt-1">Tus últimas asignaciones</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate?.('tasks')}
                title="Ir a todas las tareas"
              >
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-lg border-2">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.length > 0 ? recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 rounded-lg border-2 border-border hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">{task.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FolderKanban className="w-3 h-3" />
                        <span>{task.project?.name || 'Sin proyecto'}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>{task.dueDate || 'Sin fecha límite'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-8">
                    No hay tareas recientes
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mini Calendar with Task Markers */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Calendario
            </CardTitle>
            {/* <p className="text-xs text-muted-foreground mt-1">
              Días con tareas marcados. Haz clic para ver detalles.
            </p> */}
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 rounded-lg">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <MiniCalendar tasks={tasks} currentUser={currentUser} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projects Progress */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Progreso de Proyectos</CardTitle>
              <CardDescription className="mt-1">Estado actual de tus proyectos</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.('projects')}
              title="Ir a todos los proyectos"
            >
              <FolderKanban className="w-4 h-4 mr-2" />
              Ver todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {activeProjects.length > 0 ? activeProjects.map((project) => {
                const tasksCount = project.tasks?.length || 0
                const completedTasks = project.tasks?.filter(t => t.status === 'Completada').length || 0
                const progress = tasksCount > 0 ? Math.round((completedTasks / tasksCount) * 100) : 0
                
                return (
                  <div key={project.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{project.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span>
                            {completedTasks}/{tasksCount} tareas completadas
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {project.endDate || 'Sin fecha límite'}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
                        {progress}%
                      </Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )
              }) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay proyectos activos
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
