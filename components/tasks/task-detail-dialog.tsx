"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Calendar, Flag, Clock, User, MessageSquare, ChevronDown, Upload, FileText, Download, CheckCircle, AlertCircle, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState, useRef, useEffect } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { useSubmissions } from "@/hooks/useSubmissions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { submissionsApi } from "@/lib/api/submissions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TaskDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: any
  onTaskUpdate?: () => void
  onTaskDelete?: (taskId: number) => void
  refreshSignal?: number
}

export function TaskDetailDialog({ open, onOpenChange, task, onTaskUpdate, onTaskDelete, refreshSignal }: TaskDetailDialogProps) {
  const [isStudentsOpen, setIsStudentsOpen] = useState(false)
  const [submissionContent, setSubmissionContent] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null)
  const [gradeValue, setGradeValue] = useState('')
  const [gradeFeedback, setGradeFeedback] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isTutor, isAdmin, isStudent } = usePermissions()
  const { 
    mySubmission, 
    studentsWithSubmissions, 
    stats, 
    loading: submissionsLoading,
    error: submissionsError,
    createSubmission,
    gradeSubmission,
    refetch: refetchSubmissions
  } = useSubmissions(task?.id)

  // Cuando el padre indique refresh (por botón de recarga), actualizar las entregas
  useEffect(() => {
    if (!open || !task?.id) return
    try { refetchSubmissions() } catch {}
  }, [refreshSignal])

  // Importante: mover el early return después de los hooks para no romper el orden de hooks
  if (!task) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Sin tarea seleccionada</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Selecciona una tarea para ver sus detalles.</p>
        </DialogContent>
      </Dialog>
    )
  }
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }
  
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index))
  }
  
  const handleSubmit = async () => {
    if (!task || (selectedFiles.length === 0 && !submissionContent.trim())) {
      alert('Debes agregar archivos o contenido para hacer la entrega')
      return
    }
    
    try {
      setIsSubmitting(true)
      await createSubmission(task.id, submissionContent.trim() || undefined, selectedFiles)
      // Actualizar inmediatamente las entregas y tareas para reflejar el estado "Completada" del alumno
      try {
        await refetchSubmissions()
      } catch {}
      setSubmissionContent('')
      setSelectedFiles([])
      // Refrescar la lista de tareas para actualizar el estado
      if (onTaskUpdate) {
        onTaskUpdate()
      }
      alert('✅ Entrega realizada exitosamente')
    } catch (error: any) {
      alert(`❌ Error: ${error.message || 'No se pudo realizar la entrega'}`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleGradeSubmit = async () => {
    if (!selectedSubmissionId || !gradeValue) return
    
    try {
      const grade = parseFloat(gradeValue)
      if (isNaN(grade) || grade < 0 || grade > 5.0) {
        alert('La nota debe estar entre 0.0 y 5.0')
        return
      }
      
      await gradeSubmission(selectedSubmissionId, grade, gradeFeedback || undefined)
      // Refrescar entregas y tareas después de calificar
      try {
        await refetchSubmissions()
      } catch {}
      if (onTaskUpdate) {
        onTaskUpdate()
      }
      setGradeDialogOpen(false)
      setSelectedSubmissionId(null)
      setGradeValue('')
      setGradeFeedback('')
      alert('✅ Calificación guardada exitosamente')
    } catch (error: any) {
      alert(`❌ Error: ${error.message || 'No se pudo calificar'}`)
    }
  }
  
  const openGradeDialog = (submissionId: number) => {
    setSelectedSubmissionId(submissionId)
    setGradeDialogOpen(true)
  }
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

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

  const handleDeleteTask = () => {
    if (!task || !onTaskDelete) return
    
    if (window.confirm(`¿Estás seguro de que deseas eliminar la tarea "${task.name}"?`)) {
      onTaskDelete(task.id)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{task.name}</DialogTitle>
            {(isTutor() || isAdmin()) && onTaskDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteTask}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getPriorityColor(task.priority)}>
              <Flag className="w-3 h-3 mr-1" />
              {task.priority}
            </Badge>
            <Badge variant="outline" className={getStatusColor(task.status)}>
              {task.status}
            </Badge>
            <Badge variant="secondary">{task.type}</Badge>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Descripción</h3>
            <p className="text-muted-foreground">{task.description || 'Sin descripción'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Alumnos Asignados */}
            <Card className="p-4 md:col-span-2">
              <Collapsible open={isStudentsOpen} onOpenChange={setIsStudentsOpen}>
                <div className="space-y-3">
                  <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Alumnos Asignados</span>
                    </div>
                    {/* Mostrar contador para tutores desde studentsWithSubmissions o task.responsibles */}
                    {((isTutor() && studentsWithSubmissions && studentsWithSubmissions.length > 0) || 
                      (task.responsibles && Array.isArray(task.responsibles) && task.responsibles.length > 0)) && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {isTutor() && studentsWithSubmissions 
                            ? studentsWithSubmissions.length 
                            : task.responsibles?.length || 0} alumno(s)
                        </Badge>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isStudentsOpen ? 'transform rotate-180' : ''}`} />
                      </div>
                    )}
                  </CollapsibleTrigger>

                  {/* Para tutores, mostrar estudiantes desde studentsWithSubmissions */}
                  {isTutor() && studentsWithSubmissions && studentsWithSubmissions.length > 0 ? (
                    <CollapsibleContent className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pt-2">
                        {studentsWithSubmissions.map((item: any) => (
                          <div key={item.taskId} className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                            <Avatar className="w-7 h-7">
                              <AvatarImage src={"/placeholder.svg"} />
                              <AvatarFallback className="text-xs">{(item.student.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-xs font-medium truncate">
                                {item.student.firstName 
                                  ? `${item.student.firstName} ${item.student.lastName || ''}`.trim()
                                  : item.student.username}
                              </span>
                              <Badge variant="outline" className={`text-[10px] w-fit px-1 py-0 ${getStatusColor(item.taskStatus)}`}>
                                {item.taskStatus}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  ) : task.responsibles && Array.isArray(task.responsibles) && task.responsibles.length > 0 ? (
                    <CollapsibleContent className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pt-2">
                        {task.responsibles.map((resp: any) => (
                          <div key={resp.id} className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                            <Avatar className="w-7 h-7">
                              <AvatarImage src={"/placeholder.svg"} />
                              <AvatarFallback className="text-xs">{(resp.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-xs font-medium truncate">
                                {resp.username}
                              </span>
                              <Badge variant="outline" className={`text-[10px] w-fit px-1 py-0 ${getStatusColor(resp.status)}`}>
                                {resp.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  ) : task.responsible ? (
                    <div className="flex items-center gap-2 pt-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={"/placeholder.svg"} />
                        <AvatarFallback>{(task.responsible.firstName || task.responsible.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {task.responsible.firstName 
                            ? `${task.responsible.firstName} ${task.responsible.lastName || ''}`.trim()
                            : task.responsible.username}
                        </span>
                        <span className="text-xs text-muted-foreground">{task.responsible.email || task.responsible.username}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin asignar</span>
                  )}
                </div>
              </Collapsible>
            </Card>

            {/* Estado */}
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Estado</span>
                </div>
                <Badge variant="outline" className={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
              </div>
            </Card>

            {/* Prioridad */}
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Prioridad</span>
                </div>
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  <Flag className="w-3 h-3 mr-1" />
                  {task.priority}
                </Badge>
              </div>
            </Card>

            {/* Fecha Límite */}
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Fecha Límite</span>
                </div>
                <p className="text-sm font-medium">
                  {task.dueDate 
                    ? new Date(task.dueDate).toLocaleDateString("es-ES", { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'Sin fecha límite establecida'}
                </p>
                {task.dueDate && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(task.dueDate) < new Date() 
                      ? '⚠️ Fecha vencida' 
                      : `Faltan ${Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días`}
                  </p>
                )}
              </div>
            </Card>

            {/* Tutor */}
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tutor</span>
                </div>
                {task.tutor ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={"/placeholder.svg"} />
                      <AvatarFallback>{(task.tutor.firstName || task.tutor.username || 'T').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {task.tutor.firstName 
                          ? `${task.tutor.firstName} ${task.tutor.lastName || ''}`.trim()
                          : task.tutor.username}
                      </span>
                      <span className="text-xs text-muted-foreground">{task.tutor.email || task.tutor.username}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Sin tutor</span>
                )}
              </div>
            </Card>
          </div>


          {/* Sección de Entregas para Alumnos */}
          {isStudent() && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="w-4 h-4" />
                  <h3 className="font-semibold">Mi Entrega</h3>
                </div>
                
                {submissionsError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{submissionsError}</AlertDescription>
                  </Alert>
                )}
                
                {mySubmission ? (
                  <Card className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Entrega realizada</span>
                      </div>
                      <Badge variant={mySubmission.status === 'graded' ? 'default' : 'secondary'}>
                        {mySubmission.status === 'graded' ? 'Calificada' : 'Entregada'}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Fecha de entrega: {new Date(mySubmission.submittedAt).toLocaleString('es-ES')}
                    </div>
                    
                    {mySubmission.content && (
                      <div>
                        <Label className="text-sm font-medium">Contenido:</Label>
                        <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{mySubmission.content}</p>
                      </div>
                    )}
                    
                    {mySubmission.files && mySubmission.files.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Archivos adjuntos:</Label>
                        <div className="space-y-2">
                          {mySubmission.files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm">{file.originalName}</span>
                                <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => submissionsApi.downloadFile(mySubmission.id, file.id)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {mySubmission.grade !== null && mySubmission.grade !== undefined && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Calificación:</Label>
                          <Badge variant="default" className="text-lg">
                            {mySubmission.grade.toFixed(1)}/5.0
                          </Badge>
                        </div>
                        {mySubmission.feedback && (
                          <div className="mt-2">
                            <Label className="text-sm font-medium">Retroalimentación:</Label>
                            <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{mySubmission.feedback}</p>
                          </div>
                        )}
                        {mySubmission.gradedAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Calificada el {new Date(mySubmission.gradedAt).toLocaleString('es-ES')}
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                ) : (
                  <Card className="p-4 space-y-4">
                    <div className="text-sm text-muted-foreground mb-2">
                      Aún no has realizado la entrega para esta tarea.
                    </div>
                    
                    <div>
                      <Label htmlFor="content">Comentarios (opcional)</Label>
                      <Textarea
                        id="content"
                        placeholder="Agrega comentarios sobre tu entrega..."
                        value={submissionContent}
                        onChange={(e) => setSubmissionContent(e.target.value)}
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label>Archivos</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".txt,.zip,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      
                      {selectedFiles.length > 0 && (
                        <div className="space-y-2 mb-2 mt-2">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm">{file.name}</span>
                                <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveFile(index)}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-1"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Seleccionar archivos
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        Formatos: .txt, .zip, .pdf, documentos, imágenes (máx. 20MB por archivo)
                      </p>
                    </div>
                    
                    <Button
                      className="w-full"
                      onClick={handleSubmit}
                      disabled={isSubmitting || (selectedFiles.length === 0 && !submissionContent.trim())}
                    >
                      {isSubmitting ? 'Enviando...' : 'Realizar Entrega'}
                    </Button>
                  </Card>
                )}
              </div>
            </>
          )}
          
          {/* Sección de Entregas para Tutores */}
          {isTutor() && (
            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <h3 className="font-semibold">Entregas de los Alumnos</h3>
                  </div>
                  {stats && (
                    <div className="flex gap-2">
                      <Badge variant="outline">{stats.totalSubmissions}/{stats.totalStudents} Entregadas</Badge>
                      <Badge variant="secondary">{stats.pendingSubmissions} Pendientes</Badge>
                      {stats.averageGrade > 0 && (
                        <Badge variant="default">Promedio: {stats.averageGrade.toFixed(1)}</Badge>
                      )}
                    </div>
                  )}
                </div>
                
                {submissionsError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{submissionsError}</AlertDescription>
                  </Alert>
                )}
                
                {submissionsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Cargando entregas...</div>
                ) : studentsWithSubmissions && studentsWithSubmissions.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Alumno</TableHead>
                          <TableHead>Estado Tarea</TableHead>
                          <TableHead>Entrega</TableHead>
                          <TableHead>Nota</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentsWithSubmissions.map((item) => (
                          <TableRow key={item.taskId}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback>
                                    {item.student.username?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {item.student.firstName 
                                      ? `${item.student.firstName} ${item.student.lastName || ''}`.trim()
                                      : item.student.username}
                                  </div>
                                  <div className="text-xs text-muted-foreground">{item.student.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusColor(item.taskStatus)}>
                                {item.taskStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {item.submission ? (
                                <div className="space-y-1">
                                  <Badge variant={item.submission.status === 'graded' ? 'default' : 'secondary'}>
                                    {item.submission.status === 'graded' ? 'Calificada' : 'Entregada'}
                                  </Badge>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(item.submission.submittedAt).toLocaleDateString('es-ES')}
                                  </div>
                                  {item.submission.files && item.submission.files.length > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                      {item.submission.files.length} archivo(s)
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                                  Sin entregar
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {item.submission?.grade !== null && item.submission?.grade !== undefined ? (
                                <Badge variant="default">{item.submission.grade.toFixed(1)}/5.0</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.submission && (
                                <div className="flex justify-end gap-1">
                                  {item.submission.files && item.submission.files.length > 0 && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        item.submission!.files.forEach(file => {
                                          submissionsApi.downloadFile(item.submission!.id, file.id)
                                        })
                                      }}
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {item.submission.status === 'submitted' && (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => openGradeDialog(item.submission!.id)}
                                    >
                                      Calificar
                                    </Button>
                                  )}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay entregas aún.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
      
      {/* Modal de Calificación */}
      {gradeDialogOpen && (
        <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Calificar Entrega</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="grade">Nota (0.0-5.0)</Label>
                <Input
                  id="grade"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                  placeholder="0.0-5.0"
                />
              </div>
              <div>
                <Label htmlFor="feedback">Retroalimentación (opcional)</Label>
                <Textarea
                  id="feedback"
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="Comentarios sobre la entrega..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setGradeDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleGradeSubmit}>
                  Guardar Calificación
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}
