"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Trophy, Target, Clock, CheckCircle, XCircle, Users } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useExams } from "@/hooks/useExams"
import { useAuthStore } from "@/lib/store/authStore"
import type { ExamSubmission } from "@/lib/services/examService"

interface ExamResultsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exam: any
}

export function ExamResultsDialog({ open, onOpenChange, exam }: ExamResultsDialogProps) {
  const { getExamResults } = useExams()
  const { user } = useAuthStore()
  const isTutor = user?.role === 'TUTOR' || user?.role === 'ADMIN'
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && exam && isTutor) {
      setLoading(true)
      getExamResults(exam.id)
        .then(setSubmissions)
        .finally(() => setLoading(false))
    }
  }, [open, exam?.id, isTutor])

  if (!exam) return null

  // Student view: use lastScore if present
  const studentScore = typeof exam.lastScore === 'number' ? exam.lastScore : undefined
  const passed = (studentScore ?? 0) >= 3

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Resultados del Examen</DialogTitle>
          <DialogDescription>
            {isTutor ? 'Lista de envíos de tus estudiantes y promedio del examen.' : 'Tu resultado más reciente y detalles del examen.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!isTutor ? (
          <>
          <Card className={`p-6 ${passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Puntuación (1-5)</p>
                <p className="text-5xl font-bold text-primary">{studentScore?.toFixed(1) ?? '—'}</p>
              </div>
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: passed ? "#10B981" : "#EF4444" }}
              >
                <Trophy className="w-10 h-10 text-white" />
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center gap-2">
              {passed ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-700">¡Examen Aprobado!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-700">Examen No Aprobado</span>
                </>
              )}
            </div>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Tiempo límite</p>
                  <p className="text-sm text-muted-foreground">{exam.timeLimit} minutos</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Preguntas</p>
                  <p className="text-sm text-muted-foreground">{exam.numQuestions}</p>
                </div>
              </div>
            </Card>
          </div>
          </>
          ) : (
          <Card className="p-6 bg-muted/30 border-dashed">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <div>
                  <p className="text-sm text-muted-foreground">Resultados de estudiantes</p>
                  <p className="text-xs text-muted-foreground">Examen: {exam.title}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm">Promedio</p>
                <p className="text-2xl font-bold">{(submissions.reduce((a,s)=>a+(s.score||0),0)/Math.max(submissions.length,1)).toFixed(1)}</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              {loading ? (
                <p className="text-sm text-muted-foreground">Cargando resultados...</p>
              ) : submissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aún no hay envíos.</p>
              ) : (
                submissions.map((s) => {
                  const studentName = s.student?.firstName && s.student?.lastName
                    ? `${s.student.firstName} ${s.student.lastName}`
                    : s.student?.username || `Alumno #${s.studentId}`
                  const passed = s.score >= 3
                  
                  return (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50">
                      <div className="text-sm flex-1">
                        <p className="font-medium">{studentName}</p>
                        <p className="text-muted-foreground text-xs">
                          {s.student?.email && `${s.student.email} • `}
                          {new Date(s.submittedAt || '').toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {passed ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <div>
                            <p className={`text-lg font-semibold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                              {s.score.toFixed(1)}
                            </p>
                            <p className="text-xs text-muted-foreground">escala 1–5</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
          )}

          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-900">
              {!isTutor ? (
                passed
                  ? "¡Felicitaciones! Has aprobado el examen."
                  : "Te recomendamos reforzar los temas e intentarlo nuevamente si está habilitado."
              ) : (
                "Vista de tutor: consulta los envíos y promedios para este examen."
              )}
            </p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
