"use client"

import { useEffect } from 'react'
import type { ChatMessage } from '@/lib/types'
import { useSocketStore } from '@/lib/store/socketStore'
import { useAuthStore } from '@/lib/store/authStore'
import { useChatStore } from '@/lib/store/chatStore'

// Hook que registra listeners globales para mensajes de chat y los almacena, incluso si el usuario no está en la vista de chat
export function useChatSocketBridge() {
  const { socket, isConnected } = useSocketStore()
  const { user } = useAuthStore()
  const {
    pushPublicMessage,
    pushPrivateMessage,
    socketInitialized,
    setSocketInitialized
  } = useChatStore()

  useEffect(() => {
    if (!socket || !isConnected || socketInitialized || !user) return

    const handlePublic = (raw: any) => {
      const msg: ChatMessage = {
        id: raw.id,
        userId: raw.userId,
        user: {
          id: raw.user.id,
          username: raw.user.username,
          role: raw.user.role || 'ALUMNO',
          firstName: raw.user.firstName,
          lastName: raw.user.lastName,
          profileComplete: false,
          status: 'APPROVED'
        },
        message: raw.message,
        timestamp: raw.timestamp,
        recipientId: raw.recipientId,
        recipient: raw.recipient ? {
          id: raw.recipient.id,
          username: raw.recipient.username,
          role: raw.recipient.role || 'ALUMNO',
          firstName: raw.recipient.firstName,
          lastName: raw.recipient.lastName,
          profileComplete: false,
          status: 'APPROVED'
        } : undefined,
        isPrivate: raw.isPrivate
      }
      pushPublicMessage(msg, false)
    }

    const handlePrivate = (raw: any) => {
      const msg: ChatMessage = {
        id: raw.id,
        userId: raw.userId,
        user: {
          id: raw.user.id,
          username: raw.user.username,
          role: raw.user.role || 'ALUMNO',
          firstName: raw.user.firstName,
          lastName: raw.user.lastName,
          profileComplete: false,
          status: 'APPROVED'
        },
        message: raw.message,
        timestamp: raw.timestamp,
        recipientId: raw.recipientId,
        recipient: raw.recipient ? {
          id: raw.recipient.id,
          username: raw.recipient.username,
          role: raw.recipient.role || 'ALUMNO',
          firstName: raw.recipient.firstName,
          lastName: raw.recipient.lastName,
          profileComplete: false,
          status: 'APPROVED'
        } : undefined,
        isPrivate: raw.isPrivate
      }
      const otherUserId = msg.userId === user.id ? msg.recipientId : msg.userId
      if (otherUserId) {
        pushPrivateMessage(otherUserId, msg, false)
      }
    }

    socket.on('public-message', handlePublic)
    socket.on('private-message', handlePrivate)
    socket.on('private-message-sent', handlePrivate)

    setSocketInitialized()

    return () => {
      socket.off('public-message', handlePublic)
      socket.off('private-message', handlePrivate)
      socket.off('private-message-sent', handlePrivate)
    }
  }, [socket, isConnected, socketInitialized, user, pushPublicMessage, pushPrivateMessage, setSocketInitialized])
}
