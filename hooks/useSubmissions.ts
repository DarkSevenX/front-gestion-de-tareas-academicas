import { useState, useEffect } from 'react'
import { submissionsApi } from '../lib/api/submissions'
import type { Submission, SubmissionStats, StudentWithSubmission } from '../lib/types'
import { useAuthStore } from '../lib/store/authStore'
import { usePermissions } from './usePermissions'

interface UseSubmissionsResult {
  submissions: Submission[]
  mySubmission: Submission | null
  studentsWithSubmissions: StudentWithSubmission[]
  stats: SubmissionStats | null
  loading: boolean
  error: string | null
  createSubmission: (taskId: number, content: string | undefined, files: File[]) => Promise<void>
  gradeSubmission: (submissionId: number, grade: number, feedback?: string) => Promise<void>
  deleteSubmission: (submissionId: number) => Promise<void>
  refetch: () => Promise<void>
}

export function useSubmissions(taskId?: number): UseSubmissionsResult {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [mySubmission, setMySubmission] = useState<Submission | null>(null)
  const [studentsWithSubmissions, setStudentsWithSubmissions] = useState<StudentWithSubmission[]>([])
  const [stats, setStats] = useState<SubmissionStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useAuthStore()
  const { isStudent, isTutor } = usePermissions()

  const loadSubmissions = async () => {
    if (!user || !taskId) return

    try {
      setLoading(true)
      setError(null)

      if (isTutor()) {
        // Para tutores: obtener todas las entregas de la tarea
        const data = await submissionsApi.getByTask(taskId)
        setSubmissions(data.submissions)
        setStudentsWithSubmissions(data.studentsWithSubmissions)
        setStats(data.stats)
      } else if (isStudent()) {
        // Para alumnos: obtener solo su entrega
        const allMySubmissions = await submissionsApi.getStudent()
        const myTaskSubmission = allMySubmissions.find(s => s.taskId === taskId)
        setMySubmission(myTaskSubmission || null)
        
        if (myTaskSubmission) {
          setSubmissions([myTaskSubmission])
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar las entregas')
      console.error('Error loading submissions:', err)
    } finally {
      setLoading(false)
    }
  }

  const createSubmission = async (taskId: number, content: string | undefined, files: File[]) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await submissionsApi.create({ taskId, content, files })
      setMySubmission(result.submission)
      await loadSubmissions()
    } catch (err: any) {
      setError(err.message || 'Error al crear la entrega')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const gradeSubmission = async (submissionId: number, grade: number, feedback?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await submissionsApi.grade(submissionId, { grade, feedback })
      await loadSubmissions()
    } catch (err: any) {
      setError(err.message || 'Error al calificar la entrega')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteSubmission = async (submissionId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      await submissionsApi.delete(submissionId)
      setMySubmission(null)
      await loadSubmissions()
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la entrega')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (taskId) {
      loadSubmissions()
    }
  }, [taskId, user])

  return {
    submissions,
    mySubmission,
    studentsWithSubmissions,
    stats,
    loading,
    error,
    createSubmission,
    gradeSubmission,
    deleteSubmission,
    refetch: loadSubmissions
  }
}
