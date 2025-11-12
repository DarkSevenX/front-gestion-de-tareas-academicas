"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus, BookOpen, TrendingUp, Award, Loader2, RefreshCw } from "lucide-react"
import { ExamCard } from "./exam-card"
import { ExamDialog } from "./exam-dialog"
import { TakeExamDialog } from "./take-exam-dialog"
import { ExamResultsDialog } from "./exam-results-dialog"
import { useExams } from "@/hooks/useExams"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function ExamsList({ currentUser }: { currentUser: any }) {
  const { exams, isLoading, error, createExam, deleteExam, refetch } = useExams()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  // subject filter removed; backend uses topics
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedExam, setSelectedExam] = useState<any>(null)
  const [isTakeExamOpen, setIsTakeExamOpen] = useState(false)
  const [isResultsOpen, setIsResultsOpen] = useState(false)

  const isTutor = currentUser?.role === "TUTOR" || currentUser?.role === "ADMIN"
  const canCreateExam = currentUser?.role === "TUTOR" // backend solo permite TUTOR crear

  const filteredExams = exams.filter((exam) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      exam.title.toLowerCase().includes(q) ||
      (Array.isArray(exam.topics) && exam.topics.join(', ').toLowerCase().includes(q))
    const matchesStatus = statusFilter === "all" || (exam.status || 'active').toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateExam = async (examData: any) => {
    try {
      await createExam(examData)
      setIsDialogOpen(false)
    } catch (error) {
      // Error ya manejado por el hook
      console.error('Error creating exam:', error)
    }
  }

  const handleTakeExam = (exam: any) => {
    setSelectedExam(exam)
    setIsTakeExamOpen(true)
  }

  const handleViewResults = (exam: any) => {
    setSelectedExam(exam)
    setIsResultsOpen(true)
  }

  const handleDeleteExam = async (examId: number) => {
    try {
      await deleteExam(examId)
    } catch (error) {
      // Error ya manejado por el hook
      console.error('Error deleting exam:', error)
    }
  }

  const statusCounts = {
    all: exams.length,
    active: exams.filter((e) => (e.status || 'active').toLowerCase() === "active").length,
    upcoming: exams.filter((e) => (e.status || '').toLowerCase() === "upcoming").length,
    completed: exams.filter((e) => (e.status || '').toLowerCase() === "completed").length,
  }
  const examsWithScores = exams.filter((e) => typeof e.lastScore === 'number')
  const averageScore = examsWithScores.length > 0
    ? examsWithScores.reduce((acc, e) => acc + (e.lastScore || 0), 0) / examsWithScores.length
    : 0
  const passedExams = examsWithScores.filter((e) => (e.lastScore || 0) >= 3).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Sistema de Exámenes</h1>
          <p className="text-muted-foreground mt-1">
            {isTutor ? "Crea y gestiona exámenes para tus estudiantes" : "Toma exámenes y consulta tus resultados"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refetch}
            disabled={isLoading}
            title="Recargar exámenes"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          {canCreateExam && (
            <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Crear Examen
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Exámenes</p>
              <p className="text-2xl font-bold mt-1">{statusCounts.all}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completados</p>
              <p className="text-2xl font-bold mt-1">{statusCounts.completed}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Promedio</p>
              <p className="text-2xl font-bold mt-1">{averageScore.toFixed(1)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Aprobados</p>
              <p className="text-2xl font-bold mt-1">{passedExams}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar exámenes..."
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
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="upcoming">Próximos</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
            </SelectContent>
          </Select>
          {/* Subject filter removed */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExams.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No hay exámenes</h3>
              <p className="text-muted-foreground">
                {exams.length === 0
                  ? isTutor
                    ? "Comienza creando tu primer examen"
                    : "Aún no hay exámenes disponibles"
                  : "No se encontraron exámenes con los filtros aplicados"}
              </p>
            </div>
          ) : (
            filteredExams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onTakeExam={() => handleTakeExam(exam)}
                onViewResults={() => handleViewResults(exam)}
                onDelete={() => handleDeleteExam(exam.id)}
                currentUser={currentUser}
              />
            ))
          )}
        </div>
      </Card>

      <ExamDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={handleCreateExam} />

      <TakeExamDialog
        open={isTakeExamOpen}
        onOpenChange={setIsTakeExamOpen}
        exam={selectedExam}
        onExamCompleted={refetch}
      />

      <ExamResultsDialog open={isResultsOpen} onOpenChange={setIsResultsOpen} exam={selectedExam} />
    </div>
  )
}
