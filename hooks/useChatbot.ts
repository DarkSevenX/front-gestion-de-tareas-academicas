import { useState, useEffect, useCallback } from 'react'
import chatbotService from '@/lib/services/chatbotService'
import type {
  ChatbotConversation,
  ChatbotConversationSummary,
  ChatbotMessage,
} from '@/lib/types'
import { useToast } from './use-toast'

/**
 * Hook personalizado para gestionar el estado del chatbot
 */
export function useChatbot() {
  const [conversations, setConversations] = useState<ChatbotConversationSummary[]>([])
  const [currentConversation, setCurrentConversation] = useState<ChatbotConversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  /**
   * Carga todas las conversaciones del usuario
   */
  const loadConversations = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await chatbotService.getConversations()
      setConversations(data)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron cargar las conversaciones',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  /**
   * Carga una conversación específica
   */
  const loadConversation = useCallback(async (conversationId: number) => {
    setIsLoading(true)
    try {
      const data = await chatbotService.getConversation(conversationId)
      setCurrentConversation(data)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cargar la conversación',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  /**
   * Crea una nueva conversación
   */
  const createConversation = useCallback(async (title?: string) => {
    setIsLoading(true)
    try {
      const newConversation = await chatbotService.createConversation(title)
      setConversations(prev => [
        {
          id: newConversation.id,
          title: newConversation.title,
          createdAt: newConversation.createdAt,
          updatedAt: newConversation.updatedAt,
        },
        ...prev
      ])
      setCurrentConversation(newConversation)
      return newConversation
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la conversación',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  /**
   * Envía un mensaje a la conversación actual
   */
  const sendMessage = useCallback(async (message: string) => {
    if (!currentConversation) {
      toast({
        title: 'Error',
        description: 'No hay conversación activa',
        variant: 'destructive',
      })
      return null
    }

    // Añadir mensaje del usuario optimísticamente
    const userMessage: ChatbotMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }

    setCurrentConversation(prev => {
      if (!prev) return prev
      return {
        ...prev,
        messages: [...prev.messages, userMessage]
      }
    })

    setIsSending(true)
    try {
      const response = await chatbotService.sendMessage(
        currentConversation.id,
        message
      )

      // Añadir respuesta de la IA
      setCurrentConversation(prev => {
        if (!prev) return prev
        return {
          ...prev,
          messages: [...prev.messages.filter(m => m.role !== 'user' || m.content !== message), userMessage, response.assistantMessage],
          title: prev.title, // Mantener título actual
          updatedAt: new Date().toISOString()
        }
      })

      // Actualizar solo título en el sidebar si es el primer mensaje
      if (currentConversation.messages.length === 0) {
        // Recargar conversación para obtener título generado
        const updated = await chatbotService.getConversation(currentConversation.id)
        setCurrentConversation(prev => prev ? { ...prev, title: updated.title } : prev)
        
        setConversations(prev => {
          const filtered = prev.filter(c => c.id !== currentConversation.id)
          return [
            {
              id: currentConversation.id,
              title: updated.title,
              createdAt: currentConversation.createdAt,
              updatedAt: new Date().toISOString(),
            },
            ...filtered
          ]
        })
      } else {
        // Solo actualizar timestamp
        setConversations(prev => {
          const filtered = prev.filter(c => c.id !== currentConversation.id)
          const current = prev.find(c => c.id === currentConversation.id)
          if (!current) return prev
          return [
            { ...current, updatedAt: new Date().toISOString() },
            ...filtered
          ]
        })
      }

      return response
    } catch (error: any) {
      // Eliminar mensaje optimista en caso de error
      setCurrentConversation(prev => {
        if (!prev) return prev
        return {
          ...prev,
          messages: prev.messages.filter(m => m.role !== 'user' || m.content !== message)
        }
      })
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar el mensaje',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsSending(false)
    }
  }, [currentConversation, toast])

  /**
   * Elimina una conversación
   */
  const deleteConversation = useCallback(async (conversationId: number) => {
    try {
      await chatbotService.deleteConversation(conversationId)
      setConversations(prev => prev.filter(c => c.id !== conversationId))
      
      // Si es la conversación actual, limpiarla
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null)
      }

      toast({
        title: 'Éxito',
        description: 'Conversación eliminada',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la conversación',
        variant: 'destructive',
      })
    }
  }, [currentConversation, toast])

  /**
   * Selecciona una conversación como activa
   */
  const selectConversation = useCallback((conversationId: number) => {
    loadConversation(conversationId)
  }, [loadConversation])

  /**
   * Limpia la conversación actual
   */
  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation(null)
  }, [])

  // Cargar conversaciones al montar el componente
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  return {
    conversations,
    currentConversation,
    isLoading,
    isSending,
    loadConversations,
    loadConversation,
    createConversation,
    sendMessage,
    deleteConversation,
    selectConversation,
    clearCurrentConversation,
  }
}
