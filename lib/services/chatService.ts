import { api } from '../api'

export interface ChatMessage {
  id: number
  userId: number
  user: {
    id: number
    username: string
    role: string
    firstName?: string
    lastName?: string
  }
  message: string
  timestamp: string
  recipientId?: number
  recipient?: {
    id: number
    username: string
    role: string
    firstName?: string
    lastName?: string
  }
  isPrivate: boolean
}

export interface CreateMessagePayload {
  message: string
  recipientId?: number
}

class ChatService {
  // Obtener mensajes públicos
  async getPublicMessages(): Promise<ChatMessage[]> {
    const response = await api.get<ChatMessage[]>('/api/chat/messages')
    return response.data
  }

  // Obtener mensajes privados con otro usuario
  async getPrivateMessages(otherUserId: number): Promise<ChatMessage[]> {
    const response = await api.get<ChatMessage[]>(`/api/chat/private/${otherUserId}`)
    return response.data
  }

  // Enviar mensaje público
  async sendPublicMessage(message: string): Promise<ChatMessage> {
    const response = await api.post<ChatMessage>('/api/chat/messages', { message })
    return response.data
  }

  // Enviar mensaje privado
  async sendPrivateMessage(recipientId: number, message: string): Promise<ChatMessage> {
    const response = await api.post<ChatMessage>('/api/chat/private', { 
      message,
      recipientId 
    })
    return response.data
  }

  // Obtener lista de usuarios para chat privado
  async getUsers(): Promise<any[]> {
    const response = await api.get<any[]>('/users')
    return response.data
  }
}

export const chatService = new ChatService()
