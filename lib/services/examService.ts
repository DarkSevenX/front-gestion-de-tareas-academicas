import { api } from '../api'

// Backend-aligned exam shape
export interface Exam {
  id: number
  title: string
  topics: string[]
  numQuestions: number
  timeLimit: number // minutos
  createdBy: number
  assignedTo: number[]
  // Derived / optional fields present depending on route includes
  submissions?: ExamSubmission[]
  questions?: ExamQuestion[]
  generatedQuestions?: any
  status?: string // backend uses 'active' for filtering
  createdAt?: string
  updatedAt?: string
  // Convenience for tutor view
  assignedUsers?: { id: number; username: string }[]
  // Student last submission shortcut
  lastScore?: number
}

export interface ExamQuestion {
  id: number
  examId: number
  question: string
  options: string[]
  correctAnswer?: number
  type?: string
}

export interface ExamSubmission {
  id: number
  examId: number
  studentId: number
  student?: {
    id: number
    username: string
    email: string
    firstName?: string
    lastName?: string
  }
  answers: Record<string, any> | string
  score: number // escala 1-5 según backend
  review?: any
  submittedAt?: string
}

export interface CreateExamPayload {
  title: string
  topics: string // comma separated string
  numQuestions: number
  timeLimit: number
  assignedTo: number[]
}

export interface SubmitExamPayload {
  examId: number
  answers: Record<string, string> // questionId -> selected option index (as strings for backend)
}

class ExamService {
  // Obtener exámenes para estudiante
  async getExamsForStudent(): Promise<Exam[]> {
    const response = await api.get<any[]>('/exams/student')
    return response.data.map(raw => this.mapExam(raw, true))
  }

  // Obtener exámenes creados por tutor
  async getExamsForTutor(): Promise<Exam[]> {
    const response = await api.get<any[]>('/exams/tutor')
    return response.data.map(raw => this.mapExam(raw, false))
  }

  // Crear nuevo examen (IA en backend)
  async createExam(data: CreateExamPayload): Promise<Exam> {
    try {
      const response = await api.post<any>('/exams', data)
      return this.mapExam(response.data, false)
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Error al crear examen'
      throw new Error(msg)
    }
  }

  // Obtener preguntas de un examen (para tomar el examen)
  async getExamQuestions(examId: number): Promise<ExamQuestion[]> {
    const response = await api.get<any>(`/exams/${examId}/questions`)
    const payload = response.data
    const qs = payload?.questions || []
    return qs.map((q: any) => ({
      id: q.id,
      examId: examId,
      question: q.question,
      options: this.safeParseArray(q.options),
      type: q.type
    }))
  }

  // Enviar examen (estudiante)
  async submitExam(payload: SubmitExamPayload): Promise<ExamSubmission> {
    // Backend espera examId y answers (record) -> adapt
    const response = await api.post<any>('/exams/submit', {
      examId: payload.examId,
      answers: payload.answers
    })
    return this.mapSubmission(response.data)
  }

  // Obtener resultados de un examen (tutor)
  async getExamResults(examId: number): Promise<ExamSubmission[]> {
    const response = await api.get<any>(`/exams/${examId}/results`)
    const stats = response.data
    const subs = Array.isArray(stats?.submissions) ? stats.submissions : []
    return subs.map(this.mapSubmission)
  }

  // Eliminar examen (tutor)
  async deleteExam(examId: number): Promise<void> {
    try {
      await api.delete(`/exams/${examId}`)
    } catch (error: any) {
      console.error('Error deleting exam:', error)
      throw new Error(error.response?.data?.message || 'Error al eliminar examen')
    }
  }

  // Helpers
  private mapExam = (raw: any, isStudent: boolean): Exam => {
    let topics: string[] = []
    try { topics = Array.isArray(raw.topics) ? raw.topics : JSON.parse(raw.topics || '[]') } catch { topics = [] }
    let assignedTo: number[] = []
    try { assignedTo = Array.isArray(raw.assignedTo) ? raw.assignedTo : JSON.parse(raw.assignedTo || '[]') } catch { assignedTo = [] }
    let questions: ExamQuestion[] | undefined
    if (raw.questions) {
      questions = raw.questions.map((q: any) => ({
        id: q.id,
        examId: q.examId,
        question: q.question,
        options: this.safeParseArray(q.options),
        correctAnswer: q.correctAnswer,
        type: q.type
      }))
    }
    let submissions: ExamSubmission[] | undefined
    if (raw.submissions) {
      submissions = raw.submissions.map(this.mapSubmission)
    }
    const lastScore = submissions && submissions.length > 0 ? submissions[submissions.length - 1].score : undefined
    return {
      id: raw.id,
      title: raw.title,
      topics,
      numQuestions: raw.numQuestions ?? raw.totalQuestions ?? questions?.length ?? 0,
      timeLimit: raw.timeLimit ?? raw.duration ?? 0,
      createdBy: raw.createdBy,
      assignedTo,
      status: raw.status || 'active',
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      questions: isStudent ? questions : undefined, // only keep for student listing if needed
      submissions,
      assignedUsers: raw.assignedUsers,
      lastScore,
    }
  }

  private mapSubmission = (s: any): ExamSubmission => {
    let answersParsed: any = s.answers
    try { if (typeof s.answers === 'string') answersParsed = JSON.parse(s.answers) } catch {}
    return {
      id: s.id,
      examId: s.examId,
      studentId: s.studentId,
      student: s.student ? {
        id: s.student.id,
        username: s.student.username,
        email: s.student.email,
        firstName: s.student.firstName,
        lastName: s.student.lastName,
      } : undefined,
      answers: answersParsed,
      score: s.score,
      review: this.safeParse(s.review),
      submittedAt: s.submittedAt
    }
  }

  private safeParse(val: any) {
    if (typeof val !== 'string') return val
    try { return JSON.parse(val) } catch { return val }
  }
  private safeParseArray(val: any): string[] {
    if (Array.isArray(val)) return val
    if (typeof val === 'string') { try { return JSON.parse(val) } catch { return [] } }
    return []
  }
}

export const examService = new ExamService()
