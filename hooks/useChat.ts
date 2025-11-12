import { useState, useEffect, useCallback } from 'react'
import { chatService, type ChatMessage as ServiceChatMessage } from '@/lib/services/chatService'
import { useToast } from './use-toast'
import { useAuthStore } from '@/lib/store/authStore'
import { useSocketStore } from '@/lib/store/socketStore'
import { useChatStore } from '@/lib/store/chatStore'
import type { ChatMessage as DomainChatMessage, User } from '@/lib/types'

// Adaptar el tipo de servicio al dominio si faltan campos opcionales
// Forzamos casting del rol si el backend devuelve string genérico
function coerceRole(role: any): User['role'] {
  if (role === 'ALUMNO' || role === 'TUTOR' || role === 'ADMIN') return role
  return 'ALUMNO'
}

function mapServiceMessage(m: ServiceChatMessage): DomainChatMessage {
  return {
    id: m.id,
    userId: m.userId,
    user: {
      id: m.user.id,
      username: m.user.username,
      role: coerceRole(m.user.role),
      firstName: (m.user as any).firstName,
      lastName: (m.user as any).lastName,
      profileComplete: false,
      status: 'APPROVED'
    },
    message: m.message,
    timestamp: m.timestamp,
    recipientId: m.recipientId,
    recipient: m.recipient ? {
      id: m.recipient.id,
      username: m.recipient.username,
      role: coerceRole(m.recipient.role),
      firstName: (m.recipient as any).firstName,
      lastName: (m.recipient as any).lastName,
      profileComplete: false,
      status: 'APPROVED'
    } : undefined,
    isPrivate: m.isPrivate
  }
}

export const useChat = (otherUserId?: number | null) => {
  const { toast } = useToast()
  const { user } = useAuthStore()
  const { socket, isConnected, sendPublicMessage: socketSendPublic, sendPrivateMessage: socketSendPrivate } = useSocketStore()
  const { publicMessages, privateMessages, setInitialPublicMessages, setInitialPrivateMessages, pushPublicMessage, pushPrivateMessage } = useChatStore()

  const [messages, setMessages] = useState<DomainChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isPrivate = otherUserId !== null && otherUserId !== undefined

  const fetchMessages = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (isPrivate && otherUserId) {
        const cached = privateMessages[otherUserId] || []
        // Obtener del backend siempre para no perder mensajes que llegaron fuera y aún no guardados al store
        const data = await chatService.getPrivateMessages(otherUserId)
        const mapped = data.map(mapServiceMessage)
        // Merge (dedupe por id) entre store y backend
        const combinedMap = new Map<number, DomainChatMessage>()
        for (const m of [...cached, ...mapped]) combinedMap.set(m.id, m)
        const merged = Array.from(combinedMap.values()).sort((a,b)=> new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        setInitialPrivateMessages(otherUserId, merged)
        setMessages(merged)
      } else {
        const cached = publicMessages
        const data = await chatService.getPublicMessages()
        const mapped = data.map(mapServiceMessage)
        const combinedMap = new Map<number, DomainChatMessage>()
        for (const m of [...cached, ...mapped]) combinedMap.set(m.id, m)
        const merged = Array.from(combinedMap.values()).sort((a,b)=> new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        setInitialPublicMessages(merged)
        setMessages(merged)
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar mensajes'
      setError(errorMessage)
      toast({ variant: 'destructive', title: 'Error', description: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }, [isPrivate, otherUserId, setInitialPrivateMessages, setInitialPublicMessages, toast])

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return
    try {
      if (isPrivate && otherUserId) {
        if (socket && isConnected) {
          socketSendPrivate(otherUserId, messageText)
          return
        }
        const newMessage = mapServiceMessage(await chatService.sendPrivateMessage(otherUserId, messageText))
        pushPrivateMessage(otherUserId, newMessage, true)
        setMessages((prev: DomainChatMessage[]) => [...prev, newMessage])
        return newMessage
      } else {
        if (socket && isConnected) {
          socketSendPublic(messageText)
          return
        }
        const newMessage = mapServiceMessage(await chatService.sendPublicMessage(messageText))
        pushPublicMessage(newMessage, true)
        setMessages((prev: DomainChatMessage[]) => [...prev, newMessage])
        return newMessage
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al enviar mensaje'
      toast({ variant: 'destructive', title: 'Error', description: errorMessage })
      throw err
    }
  }

  useEffect(() => {
    if (!socket || !isConnected) return

    const handlePublicMessage = (raw: any) => {
      if (isPrivate) return
      const msg = mapServiceMessage(raw)
      // Estamos en público activo, no contar como no leído
      pushPublicMessage(msg, true)
      setMessages((prev: DomainChatMessage[]) => prev.some((m: DomainChatMessage) => m.id === msg.id) ? prev : [...prev, msg])
    }

    const handlePrivate = (raw: any) => {
      const msg = mapServiceMessage(raw)
      const otherId = msg.userId === user?.id ? msg.recipientId : msg.userId
      if (!otherId) return
      const isActive = isPrivate && otherUserId === otherId
      pushPrivateMessage(otherId, msg, !!isActive)
      if (isActive) {
        setMessages((prev: DomainChatMessage[]) => prev.some((m: DomainChatMessage) => m.id === msg.id) ? prev : [...prev, msg])
      }
    }

    socket.on('public-message', handlePublicMessage)
    socket.on('private-message', handlePrivate)
    socket.on('private-message-sent', handlePrivate)

    return () => {
      socket.off('public-message', handlePublicMessage)
      socket.off('private-message', handlePrivate)
      socket.off('private-message-sent', handlePrivate)
    }
  }, [socket, isConnected, isPrivate, otherUserId, user?.id, pushPublicMessage, pushPrivateMessage])

  // Solo refetch cuando cambia la conversación (otherUserId) o tipo (isPrivate)
  useEffect(() => {
    fetchMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPrivate, otherUserId])

  return { messages, isLoading, error, sendMessage, refetch: fetchMessages }
}
