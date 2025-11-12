import { useState, useEffect } from 'react'
import { examService, type Exam, type ExamSubmission, type CreateExamPayload, type SubmitExamPayload, type ExamQuestion } from '@/lib/services/examService'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/lib/store/authStore'

export const useExams = () => {
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuthStore()

  const isStudent = user?.role === 'ALUMNO'
  const isTutor = user?.role === 'TUTOR' || user?.role === 'ADMIN'

  // Cargar exámenes según el rol del usuario
  const fetchExams = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      let data: Exam[]
      if (isStudent) {
        data = await examService.getExamsForStudent()
      } else if (isTutor) {
        data = await examService.getExamsForTutor()
      } else {
        data = []
      }
      
      setExams(data)
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar exámenes'
      setError(errorMessage)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Crear nuevo examen
  const createExam = async (examData: CreateExamPayload) => {
    try {
      setIsLoading(true)
      const newExam = await examService.createExam(examData)
      setExams([...exams, newExam])
      
      toast({
        title: 'Éxito',
        description: 'Examen creado correctamente',
      })
      
      return newExam
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear examen'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Eliminar examen
  const deleteExam = async (examId: number) => {
    try {
      setIsLoading(true)
      await examService.deleteExam(examId)
      setExams(exams.filter(exam => exam.id !== examId))
      
      toast({
        title: 'Éxito',
        description: 'Examen eliminado correctamente',
      })
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar examen'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Enviar examen (estudiante)
  const submitExam = async (submissionData: SubmitExamPayload) => {
    try {
      setIsLoading(true)
      const result = await examService.submitExam(submissionData)
      // Replace exam attempt logic with simple update (backend handles logic)
      setExams(exams.map(exam => exam.id === submissionData.examId ? { ...exam } : exam))
      toast({
        title: 'Examen enviado',
        description: `Puntuación obtenida: ${result.score}`,
      })
      return result
    } catch (err: any) {
      const errorMessage = err.message || 'Error al enviar examen'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Obtener preguntas de un examen
  const getExamQuestions = async (examId: number): Promise<ExamQuestion[]> => {
    try {
      return await examService.getExamQuestions(examId)
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener preguntas'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
      throw err
    }
  }

  // Obtener resultados de un examen (tutor)
  const getExamResults = async (examId: number) => {
    try {
      return await examService.getExamResults(examId)
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener resultados'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
      throw err
    }
  }

  useEffect(() => {
    if (user) {
      fetchExams()
    }
  }, [user?.id, user?.role])

  return {
    exams,
    isLoading,
    error,
    createExam,
    deleteExam,
    submitExam,
    getExamQuestions,
    getExamResults,
    refetch: fetchExams,
  }
}
