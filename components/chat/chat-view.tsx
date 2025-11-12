"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Users, Lock, Loader2 } from "lucide-react"
import { ChatConversation } from "./chat-conversation"
import { chatService } from "@/lib/services/chatService"
import { useChatStore } from "@/lib/store/chatStore"
import { useToast } from "@/hooks/use-toast"

export function ChatView({ currentUser }: { currentUser: any }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"private" | "public">("public")
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const { toast } = useToast()
  const { unreadPublic, unreadPrivate, markPublicRead, markPrivateRead } = useChatStore()

  // Cargar usuarios para chat privado
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true)
        const allUsers = await chatService.getUsers()
        // Filtrar usuarios aprobados y excluir al usuario actual
        const filteredUsers = allUsers.filter(
          (u) => u.id !== currentUser?.id && u.status === 'APPROVED'
        )
        setUsers(filteredUsers)
      } catch (error) {
        console.error('Error loading users:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los usuarios',
        })
      } finally {
        setLoadingUsers(false)
      }
    }

    if (activeTab === 'private') {
      loadUsers()
    }
  }, [activeTab, currentUser?.id, toast])

  const filteredContacts = users.filter((user) => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase()
    const username = user.username.toLowerCase()
    const query = searchQuery.toLowerCase()
    return fullName.includes(query) || username.includes(query)
  })

  const handleSelectContact = (contact: any) => {
    setSelectedContact(contact)
    if (contact?.id) {
      markPrivateRead(contact.id)
    }
  }

  const handleSelectPublic = () => {
    setSelectedContact(null)
    markPublicRead()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Sistema de Chat</h1>
        <p className="text-muted-foreground mt-1">Comunícate con estudiantes y tutores en tiempo real</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-220px)] min-h-0">
        <Card className="col-span-4 flex flex-col h-full min-h-0">
          <div className="p-4 border-b">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "private" | "public")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="public" className="gap-2">
                  <Users className="w-4 h-4" />
                  Público
                </TabsTrigger>
                <TabsTrigger value="private" className="gap-2">
                  <Lock className="w-4 h-4" />
                  Privado
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {activeTab === "private" && (
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto min-h-0">
            {activeTab === "public" ? (
              <div
                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedContact === null ? "bg-muted" : ""
                }`}
                onClick={handleSelectPublic}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center relative">
                    <Users className="w-5 h-5 text-primary-foreground" />
                    {unreadPublic > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full px-1 py-[1px] leading-none">
                        {unreadPublic}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">Chat General</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Canal público para todos los estudiantes y tutores
                    </p>
                  </div>
                </div>
              </div>
            ) : loadingUsers ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                {searchQuery ? "No se encontraron usuarios" : "No hay usuarios disponibles"}
              </div>
            ) : (
              <div className="divide-y">
                {filteredContacts.map((contact) => {
                  const displayName =
                    contact.firstName && contact.lastName
                      ? `${contact.firstName} ${contact.lastName}`
                      : contact.username
                  const initials =
                    contact.firstName?.charAt(0) || contact.username.charAt(0)
                  const unread = unreadPrivate[contact.id] || 0

                  return (
                    <div
                      key={contact.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedContact?.id === contact.id ? "bg-muted" : ""
                      }`}
                      onClick={() => handleSelectContact(contact)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{displayName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            @{contact.username} • {contact.role}
                          </p>
                        </div>
                        {unread > 0 && (
                          <span className="bg-primary text-primary-foreground text-[10px] rounded-full px-2 py-[2px] leading-none">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>

        <Card className="col-span-8 flex flex-col h-full min-h-0">
          <ChatConversation 
            contact={selectedContact} 
            isPublic={activeTab === "public" && !selectedContact}
            currentUser={currentUser} 
          />
        </Card>
      </div>
    </div>
  )
}
