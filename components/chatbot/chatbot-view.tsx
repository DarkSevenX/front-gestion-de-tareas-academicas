"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Plus, Clock, Trash2, Loader2 } from "lucide-react"
import { ChatbotConversation } from "./chatbot-conversation"
import { ChatbotProvider, useChatbotContext } from "./chatbot-provider"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function ChatbotViewContent() {
  const {
    conversations,
    currentConversation,
    isLoading,
    createConversation,
    selectConversation,
    deleteConversation,
    clearCurrentConversation,
  } = useChatbotContext()

  const handleNewSession = async () => {
    await createConversation()
  }

  const handleDeleteConversation = async (e: React.MouseEvent, conversationId: number) => {
    e.stopPropagation()
    await deleteConversation(conversationId)
  }

  const formatTimestamp = (timestamp: string | Date) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: es,
      })
    } catch {
      return "Fecha desconocida"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-balance flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          Chatbot Educativo con IA
        </h1>
        <p className="text-muted-foreground mt-1">Asistente inteligente para resolver tus dudas académicas</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-220px)] min-h-0">
        <Card className="col-span-3 flex flex-col h-full min-h-0">
          <div className="p-4 border-b">
            <Button className="w-full gap-2" onClick={handleNewSession} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Nueva Conversación
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 min-h-0">
            {isLoading && conversations.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Sparkles className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No hay conversaciones aún</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group relative ${
                      currentConversation?.id === conversation.id ? "bg-muted" : ""
                    }`}
                    onClick={() => selectConversation(conversation.id)}
                  >
                    <h4 className="font-semibold text-sm mb-1 line-clamp-2 pr-8">
                      {conversation.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(conversation.updatedAt)}</span>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. La conversación y todos sus mensajes serán eliminados permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => handleDeleteConversation(e, conversation.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="col-span-9 flex flex-col h-full min-h-0">
          {currentConversation ? (
            <ChatbotConversation />
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8 overflow-y-auto">
              <div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Asistente IA Educativo</h3>
                <p className="text-muted-foreground text-sm mb-4 max-w-md">
                  Haz preguntas sobre cualquier tema académico y obtén respuestas detalladas y personalizadas
                </p>
                <Button onClick={handleNewSession} className="gap-2" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Comenzar Nueva Conversación
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export function ChatbotView() {
  return (
    <ChatbotProvider>
      <ChatbotViewContent />
    </ChatbotProvider>
  )
}
