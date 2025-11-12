"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { api } from "@/lib/api"

interface ExamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (exam: any) => void
}

export function ExamDialog({ open, onOpenChange, onSave }: ExamDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    topics: "",
    numQuestions: "10",
    timeLimit: "60",
    passingScore: "", // Optional if backend auto-grades differently
  })
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [assignToAll, setAssignToAll] = useState(false)
  const [studentsOpen, setStudentsOpen] = useState(false)
  const [studentSearch, setStudentSearch] = useState("")
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Load students when dialog opens
  React.useEffect(() => {
    if (open) {
      const load = async () => {
        try {
          setLoadingUsers(true)
          const res = await api.get('/users')
            .then(r => r.data.filter((u: any) => (u.role || '').toUpperCase() === 'ALUMNO'))
          setStudents(res)
        } catch (e) {
          console.error('Error cargando alumnos', e)
        } finally {
          setLoadingUsers(false)
        }
      }
      load()
    }
  }, [open])

  React.useEffect(() => {
    if (assignToAll) {
      setSelectedStudents(students.map(s => s.id))
    } else if (selectedStudents.length === students.length && students.length > 0) {
      setSelectedStudents([])
    }
  }, [assignToAll])

  const toggleStudent = (id: number) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: formData.title.trim(),
      topics: formData.topics.trim(),
      numQuestions: Number.parseInt(formData.numQuestions) || 0,
      timeLimit: Number.parseInt(formData.timeLimit) || 0,
      assignedTo: assignToAll ? students.map(s => s.id) : selectedStudents,
    }
    onSave(payload)
    setFormData({ title: '', topics: '', numQuestions: '10', timeLimit: '60', passingScore: '' })
    setSelectedStudents([])
    setAssignToAll(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Examen</DialogTitle>
          <DialogDescription>
            Define título, temas, número de preguntas, tiempo límite y estudiantes asignados. Los temas se separan por comas.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del examen</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Título del examen" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topics">Temas (separados por coma)</Label>
              <Input id="topics" value={formData.topics} onChange={(e) => setFormData({ ...formData, topics: e.target.value })} placeholder="Matemáticas, Física, Química" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numQuestions">Número de preguntas</Label>
                <Input id="numQuestions" type="number" min={1} value={formData.numQuestions} onChange={(e) => setFormData({ ...formData, numQuestions: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Tiempo límite (minutos)</Label>
                <Input id="timeLimit" type="number" min={1} value={formData.timeLimit} onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-3">
              <Label>Asignar a estudiantes</Label>
              {loadingUsers ? (
                <p className="text-sm text-muted-foreground">Cargando alumnos...</p>
              ) : (
                <>
                  <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted">
                    <Checkbox id="assign-all" checked={assignToAll} onCheckedChange={(c) => setAssignToAll(c as boolean)} />
                    <label htmlFor="assign-all" className="text-sm font-medium cursor-pointer">
                      Asignar a todos ({students.length})
                    </label>
                  </div>
                  {!assignToAll && (
                    <Popover open={studentsOpen} onOpenChange={setStudentsOpen}>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" role="combobox" aria-expanded={studentsOpen} className="w-full justify-between">
                          {selectedStudents.length > 0 ? `${selectedStudents.length} estudiante(s) seleccionados` : 'Seleccionar estudiantes'}
                          <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-full" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar estudiante..." value={studentSearch} onValueChange={setStudentSearch as any} />
                          <CommandEmpty>No se encontraron estudiantes.</CommandEmpty>
                          <CommandGroup heading="Estudiantes">
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
                                .map(stu => {
                                  const selected = selectedStudents.includes(stu.id)
                                  return (
                                    <CommandItem key={stu.id} onSelect={() => toggleStudent(stu.id)}>
                                      <div className="flex items-center gap-2 w-full">
                                        <Check className={cn('h-4 w-4', selected ? 'opacity-100 text-primary' : 'opacity-0')} />
                                        <span className="text-sm">
                                          {stu.firstName && stu.lastName ? `${stu.firstName} ${stu.lastName} (${stu.username})` : stu.username}
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
                    {assignToAll ? `Se asignará a ${students.length} estudiante(s)` : `${selectedStudents.length} estudiante(s) seleccionados`}
                  </p>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear Examen</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
