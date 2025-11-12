// Tipos de datos que coinciden con el backend
export interface User {
  id: number;
  username: string;
  role: 'ALUMNO' | 'TUTOR' | 'ADMIN';
  firstName?: string;
  lastName?: string;
  email?: string;
  profileComplete: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  googleId?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleTokenExpiry?: string;
  calendarId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email?: string
  password: string
  firstName?: string
  lastName?: string
  role?: 'ALUMNO' | 'TUTOR'
}

export interface AuthResponse {
  user: User
  token: string
}

export interface TaskResponsibleStatus {
  id: number
  username?: string
  firstName?: string
  lastName?: string
  status: 'Pendiente' | 'En progreso' | 'Completada' | 'Bloqueada'
  submissionStatus?: 'none' | 'submitted' | 'graded'
  submissionId?: number
  grade?: number // Calificación en escala 0.0 - 5.0
}

export interface Task {
  id: number
  name: string
  description?: string
  dueDate?: string
  priority: 'Baja' | 'Media' | 'Alta'
  status: 'Pendiente' | 'En progreso' | 'Completada' | 'Bloqueada'
  type: 'daily' | 'project'
  projectId?: number
  responsibleId: number
  tutorId?: number
  responsible?: User
  tutor?: User
  project?: Project
  // Campos adicionales para vista de tutor con tareas agregadas
  responsibles?: TaskResponsibleStatus[]
  aggregated?: boolean
}

export interface Project {
  id: number
  name: string
  description?: string
  startDate?: string
  endDate?: string
  status: string
  participants: User[]
  tutor?: User
  tutorId?: number
  tasks?: Task[]
}

export interface ChatMessage {
  id: number
  userId: number
  user: User
  message: string
  timestamp: string
  recipientId?: number
  recipient?: User
  isPrivate: boolean
}

export interface Notification {
  id: number
  userId: number
  message: string
  type: string
  isRead: boolean
  createdAt: string
  relatedId?: number
  relatedType?: string
}

export interface ApiError {
  message: string
  status?: number
}

// Chatbot Types
export interface ChatbotMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date | string
  links?: string[]
}

export interface ChatbotConversation {
  id: number
  title: string
  messages: ChatbotMessage[]
  createdAt: Date | string
  updatedAt: Date | string
}

export interface ChatbotConversationSummary {
  id: number
  title: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface SendMessageResponse {
  userMessage: ChatbotMessage
  assistantMessage: ChatbotMessage
}

// Submission Types
export interface SubmissionFile {
  id: number
  filename: string
  originalName: string
  mimeType: string
  size: number
  path?: string
}

export interface Submission {
  id: number
  taskId: number
  studentId: number
  submittedAt: string
  content?: string
  grade?: number // Calificación en escala 0.0 - 5.0
  feedback?: string
  gradedAt?: string
  gradedBy?: number
  status: 'submitted' | 'graded' | 'returned'
  files: SubmissionFile[]
  student?: User
  task?: Task
  gradedByUser?: User
}

export interface SubmissionStats {
  totalStudents: number
  totalSubmissions: number
  gradedSubmissions: number
  pendingSubmissions: number
  averageGrade: number
}

export interface StudentWithSubmission {
  taskId: number
  student: User
  taskStatus: string
  submission: Submission | null
}