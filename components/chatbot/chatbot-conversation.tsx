"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Sparkles, Copy, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useChatbotContext } from "./chatbot-provider"
import ReactMarkdown from "react-markdown"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

export function ChatbotConversation() {
  const { currentConversation, isSending, sendMessage } = useChatbotContext()
  const [newMessage, setNewMessage] = useState("")
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    console.log('Current conversation:', currentConversation)
  }, [currentConversation])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [currentConversation?.messages, isSending])

  const handleSendMessage = async () => {
    if (newMessage.trim() && !isSending) {
      const messageCopy = newMessage
      setNewMessage("")
      await sendMessage(messageCopy)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copiado",
      description: "Mensaje copiado al portapapeles",
    })
  }

  const formatTimestamp = (timestamp: string | Date) => {
    try {
      return format(new Date(timestamp), "HH:mm", { locale: es })
    } catch {
      return ""
    }
  }

  if (!currentConversation) {
    return null
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold">{currentConversation.title}</p>
            <p className="text-xs text-muted-foreground">Asistente IA • Siempre disponible</p>
          </div>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-4 bg-background">
        <div className="space-y-6 max-w-3xl mx-auto">
          {currentConversation.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
              <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Comienza la conversación</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Pregúntame cualquier cosa sobre temas educativos. Puedo ayudarte a buscar información,
                explicar conceptos y proporcionarte enlaces a fuentes confiables.
              </p>
            </div>
          ) : (
            currentConversation.messages.map((message, index) => (
              <div key={index} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                {message.role === "user" && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback>TÚ</AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex-1 max-w-[75%] ${message.role === "user" ? "flex flex-col items-end" : ""}`}>
                  <div className={`flex items-center gap-2 mb-1 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    <p className="text-xs font-medium">
                      {message.role === "assistant" ? "Asistente IA" : "Tú"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    
                    {message.links && message.links.length > 0 && (
                      <div className="mt-3 pt-3 border-t space-y-1">
                        <p className="text-xs font-semibold mb-2">📚 Enlaces recomendados:</p>
                        {message.links.map((link, linkIndex) => (
                          <a
                            key={linkIndex}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {link}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => handleCopyMessage(message.content)}
                      >
                        <Copy className="w-3 h-3" />
                        Copiar
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        <ThumbsUp className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {isSending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 max-w-[75%]">
                <p className="text-xs font-medium mb-1">Asistente IA</p>
                <div className="rounded-lg p-3 bg-muted">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="p-4 border-t flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            💡 Sugerencia: Haz preguntas específicas para mejores respuestas
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Escribe tu pregunta..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1"
            disabled={isSending}
          />
          <Button size="icon" onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
