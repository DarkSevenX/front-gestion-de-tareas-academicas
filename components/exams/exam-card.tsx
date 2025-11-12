"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, FileQuestion, ListChecks, Trophy, Trash2 } from "lucide-react"
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

interface ExamCardProps {
  exam: any
  onTakeExam: () => void
  onViewResults: () => void
  onDelete: () => void
  currentUser: any
}

export function ExamCard({ exam, onTakeExam, onViewResults, onDelete, currentUser }: ExamCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  const status = (exam.status || 'active').toLowerCase()
  const getStatusBadge = () => {
    const map: Record<string, { label: string; className: string }> = {
      active: { label: 'Activo', className: 'bg-green-100 text-green-700 border-green-200' },
      completed: { label: 'Completado', className: 'bg-purple-100 text-purple-700 border-purple-200' },
      upcoming: { label: 'Próximo', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      expired: { label: 'Expirado', className: 'bg-gray-100 text-gray-700 border-gray-200' }
    }
    const data = map[status] || map.active
    return <Badge variant="outline" className={data.className}>{data.label}</Badge>
  }

  // Solo los alumnos pueden tomar el examen
  const isStudent = currentUser?.role === 'ALUMNO'
  const isTutor = currentUser?.role === 'TUTOR' || currentUser?.role === 'ADMIN'
  // Solo puede tomar el examen si está activo, es estudiante y NO lo ha completado aún
  const hasCompleted = typeof exam.lastScore === 'number'
  const canTakeExam = status === 'active' && isStudent && !hasCompleted
  
  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }
  
  const handleConfirmDelete = () => {
    onDelete()
    setShowDeleteDialog(false)
  }

  return (
    <>
    <Card className="p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {isTutor && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleDeleteClick}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

  <h3 className="font-bold text-lg mb-2">{exam.title}</h3>
  <p className="text-muted-foreground text-xs mb-4 line-clamp-2">Temas: {exam.topics?.join(', ') || '—'}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <FileQuestion className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{exam.numQuestions} preguntas</span>
          <span className="text-muted-foreground">•</span>
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{exam.timeLimit} min</span>
        </div>
        {exam.assignedUsers && exam.assignedUsers.length > 0 && (
          <div className="flex items-center gap-2 text-xs mt-1 text-muted-foreground">
            <ListChecks className="w-4 h-4" />
            <span>Asignados: {exam.assignedUsers.length}</span>
          </div>
        )}
      </div>

      {isStudent && typeof exam.lastScore === 'number' && (
        <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Última puntuación (1-5):</span>
            <span className="text-2xl font-bold text-primary">{exam.lastScore.toFixed(1)}</span>
          </div>
          {exam.lastScore >= 3 && (
            <Badge variant="outline" className="mt-2 bg-green-100 text-green-700 border-green-200">
              Aprobado
            </Badge>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {canTakeExam && (
          <Button className="flex-1" onClick={onTakeExam}>
            Tomar Examen
          </Button>
        )}
        {isTutor && (
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onViewResults}>
            Ver Resultados
          </Button>
        )}
        {isStudent && hasCompleted && (
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onViewResults}>
            Ver Mi Resultado
          </Button>
        )}
      </div>
    </Card>

    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar examen?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el examen "{exam.title}" 
            y todos los resultados asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
