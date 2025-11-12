import { api } from '../api'
import type { Submission, SubmissionStats, StudentWithSubmission } from '../types'

export interface CreateSubmissionData {
  taskId: number
  content?: string
  files: File[]
}

export interface GradeSubmissionData {
  grade: number
  feedback?: string
}

export interface GetByTaskResponse {
  submissions: Submission[]
  studentsWithSubmissions: StudentWithSubmission[]
  stats: SubmissionStats
}

export const submissionsApi = {
  // Crear nueva entrega (alumno)
  create: async (data: CreateSubmissionData): Promise<{ message: string; submission: Submission }> => {
    const formData = new FormData()
    formData.append('taskId', data.taskId.toString())
    
    if (data.content) {
      formData.append('content', data.content)
    }
    
    data.files.forEach((file) => {
      formData.append('files', file)
    })

    const response = await api.post('/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Obtener entregas del estudiante actual
  getStudent: async (): Promise<Submission[]> => {
    const response = await api.get('/submissions/student')
    return response.data
  },

  // Obtener entregas pendientes de calificación (tutor)
  getForGrading: async (): Promise<Submission[]> => {
    const response = await api.get('/submissions/grading')
    return response.data
  },

  // Obtener entregas por tarea (tutor)
  getByTask: async (taskId: number): Promise<GetByTaskResponse> => {
    const response = await api.get(`/submissions/by-task/${taskId}`)
    return response.data
  },

  // Obtener entrega por ID
  getById: async (id: number): Promise<Submission> => {
    const response = await api.get(`/submissions/${id}`)
    return response.data
  },

  // Calificar entrega (tutor)
  grade: async (id: number, data: GradeSubmissionData): Promise<{ message: string; submission: Submission }> => {
    const response = await api.put(`/submissions/${id}/grade`, data)
    return response.data
  },

  // Eliminar entrega (alumno)
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/submissions/${id}`)
    return response.data
  },

  // Obtener URL de descarga de archivo
  getFileDownloadUrl: (submissionId: number, fileId: number): string => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    return `${baseURL}/submissions/${submissionId}/files/${fileId}/download`
  },

  // Descargar archivo
  downloadFile: async (submissionId: number, fileId: number): Promise<void> => {
    // Usar axios con headers de auth para evitar error "No token provided"
    const response = await api.get(
      `/submissions/${submissionId}/files/${fileId}/download`,
      { responseType: 'blob' }
    )

    // Intentar obtener el nombre de archivo del header Content-Disposition
    let fileName = `submission-${submissionId}-file-${fileId}`
    const dispo = response.headers['content-disposition'] as string | undefined
    if (dispo) {
      const match = dispo.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i)
      const encoded = match?.[1] || match?.[2]
      if (encoded) {
        try {
          fileName = decodeURIComponent(encoded)
        } catch {
          fileName = encoded
        }
      }
    }
    // Si no obtuvimos nombre, intentar inferir extensión desde Content-Type
    if (!dispo) {
      const ct = response.headers['content-type'] as string | undefined
      if (ct) {
        const map: Record<string, string> = {
          'application/pdf': 'pdf',
          'application/msword': 'doc',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
          'application/vnd.ms-excel': 'xls',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
          'application/vnd.ms-powerpoint': 'ppt',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
          'application/zip': 'zip',
          'application/x-7z-compressed': '7z',
          'application/x-rar-compressed': 'rar',
          'text/plain': 'txt',
          'image/jpeg': 'jpg',
          'image/png': 'png',
          'image/gif': 'gif'
        }
        const ext = map[ct]
        if (ext && !fileName.endsWith(`.${ext}`)) {
          fileName = `${fileName}.${ext}`
        }
      }
    }

    // Crear un blob y forzar descarga
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  // Obtener estadísticas
  getStats: async (): Promise<SubmissionStats> => {
    const response = await api.get('/submissions/stats')
    return response.data
  }
}
