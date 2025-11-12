"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usersApi } from "@/lib/api/users"
import type { User } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users as UsersIcon } from "lucide-react"

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (project: any) => void
  project?: any
}

const colors = [
  { name: "Púrpura", value: "#8B5CF6" },
  { name: "Verde", value: "#10B981" },
  { name: "Azul", value: "#3B82F6" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Naranja", value: "#F59E0B" },
  { name: "Rojo", value: "#EF4444" },
]

export function ProjectDialog({ open, onOpenChange, onSave, project }: ProjectDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Planificación",
    startDate: "",
    endDate: "",
    color: "#8B5CF6",
    participants: [] as number[],
  })
  const [students, setStudents] = useState<User[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Cargar estudiantes al abrir el diálogo
  useEffect(() => {
    const loadStudents = async () => {
      if (open) {
        try {
          setLoadingStudents(true)
          const allUsers = await usersApi.getAll()
          // Filtrar solo estudiantes aprobados
          const approvedStudents = allUsers.filter(
            user => user.role === 'ALUMNO' && user.status === 'APPROVED'
          )
          setStudents(approvedStudents)
        } catch (error) {
          console.error('Error loading students:', error)
        } finally {
          setLoadingStudents(false)
        }
      }
    }
    loadStudents()
  }, [open])

  // Actualizar el formulario cuando cambia el proyecto o se abre/cierra el diálogo
  useEffect(() => {
    if (open && project) {
      setFormData({
        title: project.name || "",
        description: project.description || "",
        status: project.status || "Planificación",
        startDate: project.startDate?.substring(0, 10) || "",
        endDate: project.endDate?.substring(0, 10) || "",
        color: project.color || "#8B5CF6",
        participants: project.participants?.map((p: User) => p.id) || [],
      })
    } else if (!open) {
      // Resetear el formulario cuando se cierra
      setFormData({
        title: "",
        description: "",
        status: "Planificación",
        startDate: "",
        endDate: "",
        color: "#8B5CF6",
        participants: [],
      })
      setSearchQuery("")
    }
  }, [open, project])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      color: formData.color,
      participants: formData.participants,
    })
  }

  const toggleParticipant = (userId: number) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter(id => id !== userId)
        : [...prev.participants, userId]
    }))
  }

  const selectAllStudents = () => {
    setFormData(prev => ({
      ...prev,
      participants: [...new Set([...prev.participants, ...filteredStudents.map((s: User) => s.id)])]
    }))
  }

  const clearAllStudents = () => {
    setFormData(prev => ({
      ...prev,
      participants: []
    }))
  }

  // Memoize filtered students to prevent recalculation on every render
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students
    
    const query = searchQuery.toLowerCase()
    return students.filter(student => {
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase()
      const username = student.username.toLowerCase()
      const email = student.email?.toLowerCase() || ''
      
      return fullName.includes(query) || username.includes(query) || email.includes(query)
    })
  }, [students, searchQuery])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Editar Proyecto" : "Nuevo Proyecto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Proyecto</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nombre del proyecto"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el proyecto"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planificación">Planificación</SelectItem>
                    <SelectItem value="En progreso">En progreso</SelectItem>
                    <SelectItem value="Pausado">Pausado</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: color.value }} />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <UsersIcon className="w-4 h-4" />
                  Estudiantes Participantes
                  {formData.participants.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {formData.participants.length}
                    </span>
                  )}
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={selectAllStudents}
                    disabled={loadingStudents}
                  >
                    Seleccionar {searchQuery ? 'visibles' : 'todos'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearAllStudents}
                    disabled={loadingStudents || formData.participants.length === 0}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <Input
                  placeholder="Buscar estudiantes por nombre, usuario o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                  disabled={loadingStudents}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
              
              {loadingStudents ? (
                <div className="text-sm text-muted-foreground p-4 text-center">
                  Cargando estudiantes...
                </div>
              ) : students.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg">
                  No hay estudiantes disponibles
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg">
                  No se encontraron estudiantes que coincidan con &quot;{searchQuery}&quot;
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {searchQuery 
                        ? `Mostrando ${filteredStudents.length} de ${students.length} estudiantes`
                        : `${students.length} estudiantes disponibles`
                      }
                    </span>
                    {formData.participants.length > 0 && (
                      <span className="text-primary font-medium">
                        {formData.participants.length} seleccionado{formData.participants.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <ScrollArea className="h-[200px] border rounded-lg p-3">
                  <div className="space-y-2">
                    {filteredStudents.map((student: User) => (
                      <div
                        key={student.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={formData.participants.includes(student.id)}
                          onCheckedChange={() => toggleParticipant(student.id)}
                        />
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>
                            {student.firstName?.charAt(0) || student.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {student.firstName && student.lastName
                              ? `${student.firstName} ${student.lastName}`
                              : student.username}
                          </p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{project ? "Guardar Cambios" : "Crear Proyecto"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
