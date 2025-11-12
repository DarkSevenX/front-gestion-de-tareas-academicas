import api from '../api'
import type {
  ChatbotConversation,
  ChatbotConversationSummary,
  SendMessageResponse,
} from '../types'

/**
 * Servicio para interactuar con el API del chatbot educativo
 */
class ChatbotService {
  private basePath = '/chatbot'

  /**
   * Obtiene todas las conversaciones del usuario
   */
  async getConversations(): Promise<ChatbotConversationSummary[]> {
    const response = await api.get<ChatbotConversationSummary[]>(
      `${this.basePath}/conversations`
    )
    return response.data
  }

  /**
   * Obtiene una conversación específica con todos sus mensajes
   */
  async getConversation(conversationId: number): Promise<ChatbotConversation> {
    const response = await api.get<ChatbotConversation>(
      `${this.basePath}/conversations/${conversationId}`
    )
    return response.data
  }

  /**
   * Crea una nueva conversación
   */
  async createConversation(title?: string): Promise<ChatbotConversation> {
    const response = await api.post<ChatbotConversation>(
      `${this.basePath}/conversations`,
      { title: title || 'Nueva Conversación' }
    )
    return response.data
  }

  /**
   * Envía un mensaje a una conversación y recibe la respuesta del asistente
   */
  async sendMessage(
    conversationId: number,
    message: string
  ): Promise<SendMessageResponse> {
    const response = await api.post<SendMessageResponse>(
      `${this.basePath}/conversations/${conversationId}/messages`,
      { message }
    )
    return response.data
  }

  /**
   * Elimina una conversación
   */
  async deleteConversation(conversationId: number): Promise<void> {
    await api.delete(`${this.basePath}/conversations/${conversationId}`)
  }
}

export const chatbotService = new ChatbotService()
export default chatbotService
