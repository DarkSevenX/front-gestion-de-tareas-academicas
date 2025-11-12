import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { create } from 'zustand'
import type { ChatMessage, Notification, User } from '../types'

interface SocketState {
  socket: Socket | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  
  // Actions
  connect: (token: string) => void
  disconnect: () => void
  sendPublicMessage: (message: string) => void
  sendPrivateMessage: (recipientId: number, message: string) => void
  joinExam: (examId: number) => void
  submitExam: (examId: number, answers: any[]) => void
  
  // Event handlers que se pueden suscribir desde componentes
  onPublicMessage: (callback: (data: any) => void) => () => void
  onPrivateMessage: (callback: (data: any) => void) => () => void
  onNotification: (callback: (notification: Notification) => void) => () => void
  onExamEvent: (event: string, callback: (data: any) => void) => () => void
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  isConnecting: false,
  error: null,

  connect: (token: string) => {
    const currentSocket = get().socket
    
    // Si ya hay una conexión, desconectar primero
    if (currentSocket) {
      currentSocket.disconnect()
    }

    set({ isConnecting: true, error: null })

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    newSocket.on('connect', () => {
      console.log('Socket conectado:', newSocket.id)
      set({ 
        socket: newSocket, 
        isConnected: true, 
        isConnecting: false, 
        error: null 
      })
    })

    newSocket.on('disconnect', (reason: any) => {
      console.log('Socket desconectado:', reason)
      set({ isConnected: false })
    })

    newSocket.on('connect_error', (error: any) => {
      console.error('Error de conexión socket:', error)
      set({ 
        isConnecting: false, 
        error: error.message || 'Error de conexión' 
      })
    })

    newSocket.on('error', (error: any) => {
      console.error('Socket error:', error)
      set({ error: error.message || 'Error del socket' })
    })

    set({ socket: newSocket })
  },

  disconnect: () => {
    const socket = get().socket
    if (socket) {
      socket.disconnect()
      set({ 
        socket: null, 
        isConnected: false, 
        isConnecting: false,
        error: null 
      })
    }
  },

  sendPublicMessage: (message: string) => {
    const socket = get().socket
    if (socket && socket.connected) {
      socket.emit('public-message', message)
    }
  },

  sendPrivateMessage: (recipientId: number, message: string) => {
    const socket = get().socket
    if (socket && socket.connected) {
      socket.emit('private-message', { recipientId, message })
    }
  },

  joinExam: (examId: number) => {
    const socket = get().socket
    if (socket && socket.connected) {
      socket.emit('exam:start', { examId })
    }
  },

  submitExam: (examId: number, answers: any[]) => {
    const socket = get().socket
    if (socket && socket.connected) {
      socket.emit('exam:submit', { examId, answers })
    }
  },

  // Métodos para suscribirse a eventos (devuelven función cleanup)
  onPublicMessage: (callback: (data: any) => void) => {
    const socket = get().socket
    if (socket) {
      socket.on('public-message', callback)
      return () => socket.off('public-message', callback)
    }
    return () => {}
  },

  onPrivateMessage: (callback: (data: any) => void) => {
    const socket = get().socket
    if (socket) {
      socket.on('private-message', callback)
      return () => socket.off('private-message', callback)
    }
    return () => {}
  },

  onNotification: (callback: (notification: Notification) => void) => {
    const socket = get().socket
    if (socket) {
      socket.on('notification', callback)
      return () => socket.off('notification', callback)
    }
    return () => {}
  },

  onExamEvent: (event: string, callback: (data: any) => void) => {
    const socket = get().socket
    if (socket) {
      socket.on(event, callback)
      return () => socket.off(event, callback)
    }
    return () => {}
  }
}))

// Hook personalizado para usar socket en componentes
export const useSocket = () => {
  const socketStore = useSocketStore()
  
  return {
    ...socketStore,
    // Helpers adicionales
    isReady: socketStore.socket !== null && socketStore.isConnected
  }
}