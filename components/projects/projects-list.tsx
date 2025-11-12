"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus, CalendarIcon, RefreshCw, AlertCircle, FolderKanban } from "lucide-react"
import { ProjectCard } from "./project-card"
import { ProjectDialog } from "./project-dialog"
import { ProjectDetailDialog } from "./project-detail-dialog"
import { CalendarView } from "./calendar-view"
import { usePermissions } from "@/hooks/usePermissions"
import { TutorOrAdmin } from "@/components/ui/permission-guard"
import { useProjects } from "@/hooks/useProjects"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError, EmptyState, NetworkStatus } from "@/components/ui/api-states"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"
import { useAuthStore } from "@/lib/store/authStore"

export function ProjectsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid")

  const permissions = usePermissions()
  const { projects, loading, error, createProject, updateProject, deleteProject, refetch } = useProjects()
  const { isOnline } = useNetworkStatus()
  const { user } = useAuthStore()
  
  // Verificar si el usuario tiene Google Calendar conectado
  const hasGoogleCalendar = user?.googleId && user?.googleAccessToken

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateProject = async (projectData: any) => {
    try {
      await createProject({
        name: projectData.title, // El dialog usa 'title', mapearlo a 'name'
        description: projectData.description,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        status: projectData.status || 'Planificación',
        participants: projectData.participants || []
      })
      setIsDialogOpen(false)
      setSelectedProject(null)
    } catch (error) {
      console.error('Error creating project:', error)
      // Mostrar error al usuario
      alert('Error al crear el proyecto. Revisa la consola para más detalles.')
    }
  }

  const handleEditProject = async (projectData: any) => {
    if (!selectedProject) return
    
    try {
      await updateProject(selectedProject.id, {
        name: projectData.title,
        description: projectData.description,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        status: projectData.status,
        participants: projectData.participants || []
      })
      setIsDialogOpen(false)
      setSelectedProject(null)
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Error al actualizar el proyecto. Revisa la consola para más detalles.')
    }
  }

  const handleDeleteProject = async () => {
    if (!selectedProject) return
    
    try {
      await deleteProject(selectedProject.id)
      setSelectedProject(null)
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Error al eliminar el proyecto. Revisa la consola para más detalles.')
    }
  }

  const handleViewDetail = (project: any) => {
    setSelectedProject(project)
    setIsDetailOpen(true)
  }

  const handleEdit = () => {
    setIsDetailOpen(false)
    setIsDialogOpen(true)
  }

  const statusCounts = {
    all: projects.length,
    'Planificación': projects.filter((p) => p.status === "Planificación").length,
    'En progreso': projects.filter((p) => p.status === "En progreso").length,
    'Completado': projects.filter((p) => p.status === "Completado").length,
    'Pausado': projects.filter((p) => p.status === "Pausado").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Gestión de Proyectos</h1>
          <p className="text-muted-foreground mt-1">
            Administra tus proyectos académicos{hasGoogleCalendar ? ' y sincroniza con Google Calendar' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={refetch} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {hasGoogleCalendar && (
            <Button variant="outline" className="gap-2 bg-transparent">
              <CalendarIcon className="w-4 h-4" />
              Sincronizar con Google Calendar
            </Button>
          )}
          <TutorOrAdmin>
            <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Nuevo Proyecto
            </Button>
          </TutorOrAdmin>
        </div>
      </div>

      <NetworkStatus isOnline={isOnline} />

      <ApiError error={error} onRetry={refetch} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold mt-1">{statusCounts.all}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
                <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">En Planificación</p>
              <p className="text-2xl font-bold mt-1">{statusCounts['Planificación']}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">En Progreso</p>
              <p className="text-2xl font-bold mt-1">{statusCounts['En progreso']}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completados</p>
              <p className="text-2xl font-bold mt-1">{statusCounts['Completado']}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pausados</p>
              <p className="text-2xl font-bold mt-1">{statusCounts['Pausado']}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar proyectos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              <SelectItem value="Planificación">En Planificación</SelectItem>
              <SelectItem value="En progreso">En Progreso</SelectItem>
              <SelectItem value="Completado">Completados</SelectItem>
              <SelectItem value="Pausado">Pausados</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
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
            >
              <CalendarIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading && (
              <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            )}
            
            {!loading && filteredProjects.length === 0 && !error && (
              <EmptyState 
                title="No hay proyectos disponibles"
                description="No se encontraron proyectos que coincidan con los filtros aplicados."
                icon={<FolderKanban className="w-12 h-12" />}
              />
            )}
            
            {!loading && filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onViewDetail={() => handleViewDetail(project)} />
            ))}
          </div>
        ) : (
          <CalendarView projects={loading ? [] : filteredProjects} />
        )}
      </Card>

      <ProjectDialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setSelectedProject(null)
        }} 
        onSave={selectedProject ? handleEditProject : handleCreateProject}
        project={selectedProject}
      />

      <ProjectDetailDialog 
        open={isDetailOpen} 
        onOpenChange={setIsDetailOpen} 
        project={selectedProject}
        onEdit={handleEdit}
        onDelete={handleDeleteProject}
      />
    </div>
  )
}
