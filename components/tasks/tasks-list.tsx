"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus, Calendar, Clock, Flag, User, RefreshCw, AlertCircle } from "lucide-react"
import { TaskCard } from "./task-card"
import { TasksCalendarView } from "./calendar-view"
import { TaskDialog } from "./task-dialog"
import { TaskDetailDialog } from "./task-detail-dialog"
import { usePermissions } from "@/hooks/usePermissions"
import { TutorOrAdmin } from "@/components/ui/permission-guard"
import { useTasks } from "@/hooks/useTasks"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError, EmptyState, NetworkStatus } from "@/components/ui/api-states"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"

export function TasksList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  const [refreshCounter, setRefreshCounter] = useState(0)
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid")
  
  const permissions = usePermissions()
  const { tasks, loading, error, createTask, updateTask, deleteTask, refetch } = useTasks()
  const { isOnline } = useNetworkStatus()

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    const matchesType = typeFilter === "all" || task.type === typeFilter
    return matchesSearch && matchesStatus && matchesPriority && matchesType
  })

  const handleCreateTask = async (taskData: any) => {
    try {
      const response = await createTask({
        name: taskData.name, // TaskDialog ya envía name en payload
        description: taskData.description,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        type: taskData.type,
        responsibleIds: taskData.responsibleIds,
        // status y tutorId se asignan por backend (defaults / user)
      })
      setShowNewTaskDialog(false)
      
      // Mostrar mensaje de éxito
      if (response && response.count) {
        alert(`✅ ${response.count} tarea(s) creada(s) exitosamente`)
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleUpdateTask = async (updatedTask: any) => {
    try {
      await updateTask(updatedTask.id, {
        name: updatedTask.title,
        description: updatedTask.description,
        dueDate: updatedTask.dueDate,
        priority: updatedTask.priority,
        status: updatedTask.status
      })
      setShowNewTaskDialog(false)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleViewDetail = (task: any) => {
    setSelectedTask(task)
    setShowTaskDetail(true)
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId)
      setShowTaskDetail(false)
      alert('✅ Tarea eliminada exitosamente')
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('❌ Error al eliminar la tarea')
    }
  }

  // Calcular métricas según el rol
  const statusCounts = (() => {
    // Para tutores/admins: contar basándose en los responsables de cada tarea
    if (permissions.isTutor() || permissions.isAdmin()) {
      let totalResponsibles = 0
      let pendientes = 0
      let enProgreso = 0
      let completadas = 0
      
      tasks.forEach(task => {
        if (task.responsibles && Array.isArray(task.responsibles)) {
          totalResponsibles += task.responsibles.length
          task.responsibles.forEach((r: any) => {
            if (r.status === 'Pendiente') pendientes++
            else if (r.status === 'En progreso') enProgreso++
            else if (r.status === 'Completada') completadas++
          })
        }
      })
      
      return {
        all: totalResponsibles,
        'Pendiente': pendientes,
        'En progreso': enProgreso,
        'Completada': completadas,
      }
    }
    
    // Para estudiantes: contar tareas normalmente
    return {
      all: tasks.length,
      'Pendiente': tasks.filter((t) => t.status === "Pendiente").length,
      'En progreso': tasks.filter((t) => t.status === "En progreso").length,
      'Completada': tasks.filter((t) => t.status === "Completada").length,
    }
  })()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Gestión de Tareas</h1>
          <p className="text-muted-foreground mt-1">Organiza y rastrea todas tus tareas académicas</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={async () => {
              const fresh = await refetch()
              if (fresh && selectedTask) {
                // Re-sincronizar la tarea seleccionada con la versión actualizada
                const updated = fresh.find(t => t.id === selectedTask.id)
                if (updated) setSelectedTask(updated)
              }
              setRefreshCounter(c => c + 1)
            }} 
            disabled={loading}
            title="Recargar (actualiza también la tarea abierta)"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <TutorOrAdmin>
            <Button className="gap-2" onClick={() => setShowNewTaskDialog(true)}>
              <Plus className="w-4 h-4" />
              Nueva Tarea
            </Button>
          </TutorOrAdmin>
        </div>
      </div>

      <NetworkStatus isOnline={isOnline} />

      <ApiError error={error} onRetry={refetch} />

      <div className={`grid grid-cols-1 gap-4 ${permissions.isTutor() || permissions.isAdmin() ? 'md:grid-cols-1' : 'md:grid-cols-4'}`}>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {permissions.isTutor() || permissions.isAdmin() ? 'Total de Tareas Asignadas' : 'Total'}
              </p>
              <p className="text-2xl font-bold mt-1">{statusCounts.all}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Flag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        {/* Solo mostrar métricas de estado para estudiantes */}
        {!permissions.isTutor() && !permissions.isAdmin() && (
          <>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold mt-1">{statusCounts['Pendiente']}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En Progreso</p>
                  <p className="text-2xl font-bold mt-1">{statusCounts['En progreso']}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completadas</p>
                  <p className="text-2xl font-bold mt-1">{statusCounts['Completada']}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Pendiente">Pendientes</SelectItem>
              <SelectItem value="En progreso">En Progreso</SelectItem>
              <SelectItem value="Completada">Completadas</SelectItem>
              <SelectItem value="Bloqueada">Bloqueadas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Alta">Alta</SelectItem>
              <SelectItem value="Media">Media</SelectItem>
              <SelectItem value="Baja">Baja</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="project">Proyecto</SelectItem>
              <SelectItem value="daily">Diaria</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              title="Vista de tarjetas"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("calendar")}
              title="Vista de calendario"
            >
              <Calendar className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading && (
              <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            )}
            {!loading && filteredTasks.length === 0 && !error && (
              <div className="col-span-full">
                <EmptyState 
                  title="No hay tareas disponibles"
                  description="No se encontraron tareas que coincidan con los filtros aplicados."
                  icon={<Flag className="w-12 h-12" />}
                />
              </div>
            )}
            {!loading && filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onViewDetail={() => handleViewDetail(task)} />
            ))}
          </div>
        ) : (
          <TasksCalendarView tasks={loading ? [] : filteredTasks} />
        )}
      </Card>

  <TaskDialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog} onSave={handleCreateTask} />

      <TaskDetailDialog 
        open={showTaskDetail} 
        onOpenChange={(open) => {
          setShowTaskDetail(open)
          if (!open) setSelectedTask(null)
        }} 
        task={selectedTask}
        onTaskUpdate={async () => {
          const fresh = await refetch()
          if (fresh && selectedTask) {
            const updated = fresh.find(t => t.id === selectedTask.id)
            if (updated) setSelectedTask(updated)
          }
          setRefreshCounter(c => c + 1)
        }}
        onTaskDelete={handleDeleteTask}
        refreshSignal={refreshCounter}
      />
    </div>
  )
}
