"use client"

import React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: any) => void
  task?: any
}

export function TaskDialog({ open, onOpenChange, onSave, task }: TaskDialogProps) {
  const [formData, setFormData] = useState({
    title: task?.name || "",
    description: task?.description || "",
    // Backend enums: priority ('Baja','Media','Alta'), status set server-side default 'Pendiente'
    priority: (task?.priority as 'Baja'|'Media'|'Alta') || 'Media',
    type: (task?.type as 'daily'|'project') || 'project',
    dueDate: task?.dueDate?.substring(0,10) || "",
  })
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [assignToAll, setAssignToAll] = useState(false)
  const [studentsOpen, setStudentsOpen] = useState(false)
  const [studentSearch, setStudentSearch] = useState("")
  const [loadingUsers, setLoadingUsers] = useState(false)
  const isEdit = !!task

  // Cargar alumnos para asignar responsable (solo al crear)
  React.useEffect(() => {
    if (!isEdit && open) {
      const load = async () => {
        try {
          setLoadingUsers(true)
          const res = await api.get('/users')
          const users = res.data
          const alumnosFiltered = users.filter((u: any) => (u.role || '').toUpperCase() === 'ALUMNO')
          setStudents(alumnosFiltered)
        } catch (e) {
          console.error('Error cargando alumnos', e)
        } finally {
          setLoadingUsers(false)
        }
      }
      load()
    }
  }, [open, isEdit])

  // Cuando se selecciona "Todos", marcar/desmarcar todos los alumnos
  React.useEffect(() => {
    if (assignToAll) {
      setSelectedStudents(students.map(s => s.id))
    } else if (selectedStudents.length === students.length && students.length > 0) {
      setSelectedStudents([])
    }
  }, [assignToAll])

  const toggleStudent = (studentId: number) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId)
      } else {
        return [...prev, studentId]
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mapear al payload esperado por el backend
    const payload: any = {
      name: formData.title,
      description: formData.description || null,
      priority: formData.priority, // 'Baja' | 'Media' | 'Alta'
      type: formData.type, // 'daily' | 'project'
      dueDate: formData.dueDate || null,
    }
    if (!isEdit) {
      payload.responsibleIds = selectedStudents
    }
    onSave(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{task ? "Editar Tarea" : "Nueva Tarea"}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Actualiza los detalles de la tarea.' : 'Completa los campos para crear una tarea. El estado inicial será "Pendiente".'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título de la tarea"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la tarea"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">Proyecto</SelectItem>
                    <SelectItem value="daily">Diaria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {!isEdit && (
              <div className="space-y-3">
                <Label>Asignar a Alumnos</Label>
                {loadingUsers ? (
                  <p className="text-sm text-muted-foreground">Cargando alumnos...</p>
                ) : (
                  <>
                    <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted">
                      <Checkbox
                        id="assign-all"
                        checked={assignToAll}
                        onCheckedChange={(checked) => setAssignToAll(checked as boolean)}
                      />
                      <label
                        htmlFor="assign-all"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Asignar a todos los alumnos ({students.length})
                      </label>
                    </div>
                    {!assignToAll && (
                      <Popover open={studentsOpen} onOpenChange={setStudentsOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={studentsOpen}
                            className="w-full justify-between"
                          >
                            {selectedStudents.length > 0
                              ? `${selectedStudents.length} alumno(s) seleccionados`
                              : 'Seleccionar alumnos'}
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-full" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Buscar alumno..."
                              value={studentSearch}
                              onValueChange={setStudentSearch as any}
                            />
                            <CommandEmpty>No se encontraron alumnos.</CommandEmpty>
                            <CommandGroup heading="Alumnos">
                              <CommandList>
                                {students
                                  .filter(s => {
                                    if (!studentSearch) return true
                                    const term = studentSearch.toLowerCase()
                                    return (
                                      (s.firstName && s.firstName.toLowerCase().includes(term)) ||
                                      (s.lastName && s.lastName.toLowerCase().includes(term)) ||
                                      s.username.toLowerCase().includes(term)
                                    )
                                  })
                                  .map(student => {
                                    const selected = selectedStudents.includes(student.id)
                                    return (
                                      <CommandItem
                                        key={student.id}
                                        onSelect={() => toggleStudent(student.id)}
                                      >
                                        <div className={cn('flex items-center gap-2 w-full')}>
                                          <Check
                                            className={cn(
                                              'h-4 w-4',
                                              selected ? 'opacity-100 text-primary' : 'opacity-0'
                                            )}
                                          />
                                          <span className="text-sm">
                                            {student.firstName && student.lastName
                                              ? `${student.firstName} ${student.lastName} (${student.username})`
                                              : student.username}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    )
                                  })}
                              </CommandList>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {assignToAll
                        ? `Se creará una tarea para cada uno de los ${students.length} alumnos`
                        : `${selectedStudents.length} alumno(s) seleccionados`}
                    </p>
                  </>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Fecha Límite</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isEdit && selectedStudents.length === 0}>{task ? "Guardar Cambios" : "Crear Tarea"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
