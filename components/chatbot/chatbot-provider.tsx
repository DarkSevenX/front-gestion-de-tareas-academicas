'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useChatbot } from '@/hooks/useChatbot'
import type { ChatbotConversation, ChatbotConversationSummary } from '@/lib/types'

interface ChatbotContextType {
  conversations: ChatbotConversationSummary[]
  currentConversation: ChatbotConversation | null
  isLoading: boolean
  isSending: boolean
  loadConversations: () => Promise<void>
  loadConversation: (conversationId: number) => Promise<void>
  createConversation: (title?: string) => Promise<ChatbotConversation | null>
  sendMessage: (message: string) => Promise<any>
  deleteConversation: (conversationId: number) => Promise<void>
  selectConversation: (conversationId: number) => void
  clearCurrentConversation: () => void
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const chatbot = useChatbot()

  return (
    <ChatbotContext.Provider value={chatbot}>
      {children}
    </ChatbotContext.Provider>
  )
}

export function useChatbotContext() {
  const context = useContext(ChatbotContext)
  if (context === undefined) {
    throw new Error('useChatbotContext must be used within a ChatbotProvider')
  }
  return context
}
