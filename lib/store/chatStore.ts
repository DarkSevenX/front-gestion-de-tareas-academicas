import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage } from '../types'

interface ChatStoreState {
  publicMessages: ChatMessage[]
  privateMessages: Record<number, ChatMessage[]> // key: otherUserId
  unreadPublic: number
  unreadPrivate: Record<number, number>
  socketInitialized: boolean

  // Actions
  setInitialPublicMessages: (messages: ChatMessage[]) => void
  setInitialPrivateMessages: (otherUserId: number, messages: ChatMessage[]) => void
  pushPublicMessage: (message: ChatMessage, isActive?: boolean) => void
  pushPrivateMessage: (otherUserId: number, message: ChatMessage, isActive?: boolean) => void
  markPublicRead: () => void
  markPrivateRead: (otherUserId: number) => void
  setSocketInitialized: () => void
  resetChat: () => void
}

export const useChatStore = create<ChatStoreState>()(persist((set, get) => ({
  publicMessages: [],
  privateMessages: {},
  unreadPublic: 0,
  unreadPrivate: {},
  socketInitialized: false,

  setSocketInitialized: () => set({ socketInitialized: true }),

  setInitialPublicMessages: (messages) => set({ publicMessages: messages }),
  setInitialPrivateMessages: (otherUserId, messages) => set(state => ({
    privateMessages: { ...state.privateMessages, [otherUserId]: messages }
  })),

  pushPublicMessage: (message, isActive = false) => set(state => {
    // Evitar duplicados
    if (state.publicMessages.some(m => m.id === message.id)) {
      return state
    }
    return {
      publicMessages: [...state.publicMessages, message],
      unreadPublic: isActive ? state.unreadPublic : state.unreadPublic + 1
    }
  }),

  pushPrivateMessage: (otherUserId, message, isActive = false) => set(state => {
    const existing = state.privateMessages[otherUserId] || []
    if (existing.some(m => m.id === message.id)) {
      return state
    }
    return {
      privateMessages: {
        ...state.privateMessages,
        [otherUserId]: [...existing, message]
      },
      unreadPrivate: {
        ...state.unreadPrivate,
        [otherUserId]: isActive ? (state.unreadPrivate[otherUserId] || 0) : (state.unreadPrivate[otherUserId] || 0) + 1
      }
    }
  }),

  markPublicRead: () => set(state => ({ unreadPublic: 0 })),
  markPrivateRead: (otherUserId) => set(state => ({
    unreadPrivate: { ...state.unreadPrivate, [otherUserId]: 0 }
  })),

  resetChat: () => set({
    publicMessages: [],
    privateMessages: {},
    unreadPublic: 0,
    unreadPrivate: {},
    socketInitialized: false
  })
}), {
  name: 'chat-storage',
  partialize: (state) => ({
    publicMessages: state.publicMessages,
    privateMessages: state.privateMessages,
    unreadPublic: state.unreadPublic,
    unreadPrivate: state.unreadPrivate
  })
}))
