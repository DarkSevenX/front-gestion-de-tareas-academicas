"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Paperclip, Loader2, Users } from "lucide-react"
import { useChat } from "@/hooks/useChat"
import { useChatStore } from "@/lib/store/chatStore"

interface ChatConversationProps {
  contact?: any
  isPublic: boolean
  currentUser: any
}

export function ChatConversation({ contact, isPublic, currentUser }: ChatConversationProps) {
  const { messages, isLoading, sendMessage } = useChat(
    isPublic ? null : contact?.id
  )
  const { markPublicRead, markPrivateRead } = useChatStore()
  const [newMessageText, setNewMessageText] = useState("")
  const [showNewIndicator, setShowNewIndicator] = useState(false)
  const lastLengthRef = useRef<number>(0)
  // Contenedor scrollable manual (evitamos problemas con ScrollArea en auto-scroll)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback((smooth = true) => {
    endRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' })
  }, [])

  // Detectar nuevos mensajes cuando el usuario no está al fondo
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const atBottom = Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 10
    const newLength = messages.length
    if (newLength > lastLengthRef.current) {
      if (atBottom) {
        scrollToBottom(true)
        setShowNewIndicator(false)
      } else {
        setShowNewIndicator(true)
      }
      lastLengthRef.current = newLength
    }
  }, [messages, scrollToBottom])

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return
    const atBottom = Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 10
    if (atBottom) {
      setShowNewIndicator(false)
    }
  }

  // Marcar como leídos al abrir
  useEffect(() => {
    if (isPublic) {
      markPublicRead()
    } else if (contact?.id) {
      markPrivateRead(contact.id)
    }
  }, [isPublic, contact?.id, markPublicRead, markPrivateRead])

  const handleSendMessage = async () => {
    if (newMessageText.trim()) {
      await sendMessage(newMessageText)
      setNewMessageText("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const displayName = isPublic 
    ? "Chat General" 
    : contact 
      ? (contact.firstName && contact.lastName 
          ? `${contact.firstName} ${contact.lastName}` 
          : contact.username)
      : ""

  if (!isPublic && !contact) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div>
          <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Selecciona una conversación</h3>
          <p className="text-muted-foreground text-sm">Elige un usuario o el chat público para comenzar a chatear</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {isPublic ? (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
          ) : (
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>
                {contact?.firstName?.charAt(0) || contact?.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <p className="font-semibold">{displayName}</p>
            <p className="text-sm text-muted-foreground">
              {isPublic ? "Canal público" : `@${contact?.username}`}
            </p>
          </div>
        </div>
      </div>
  <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-background relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-muted-foreground">No hay mensajes aún</p>
              <p className="text-sm text-muted-foreground mt-1">Sé el primero en enviar un mensaje</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.userId === currentUser?.id
            const senderName = message.user 
              ? (message.user.firstName && message.user.lastName 
                  ? `${message.user.firstName} ${message.user.lastName}` 
                  : message.user.username)
              : "Usuario"
            const senderInitial = message.user?.firstName?.charAt(0) || message.user?.username?.charAt(0) || "U"

            return (
              <div key={message.id} className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                {!isCurrentUser && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>{senderInitial}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex flex-col gap-1 max-w-[70%] ${isCurrentUser ? "items-end" : ""}`}>
                  {!isCurrentUser && (
                    <p className="text-xs font-medium text-muted-foreground">{senderName}</p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm break-words whitespace-pre-wrap">{message.message}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString("es-ES", { 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={endRef} />
        {showNewIndicator && (
          <button
            onClick={() => { scrollToBottom(true); setShowNewIndicator(false) }}
            className="absolute bottom-4 right-4 bg-primary text-primary-foreground text-xs font-medium px-3 py-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          >
            Nuevos mensajes ▾
          </button>
        )}
      </div>

      <div className="p-4 border-t flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            placeholder="Escribe un mensaje..."
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isLoading}
          />
          <Button size="icon" onClick={handleSendMessage} disabled={isLoading || !newMessageText.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
