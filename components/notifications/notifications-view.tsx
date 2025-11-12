"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Check, Trash2, Filter, AlertCircle, CheckCircle, Info, MessageSquare, Loader2 } from "lucide-react"
import { useNotifications } from "@/hooks/useNotifications"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export function NotificationsView() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [filter, setFilter] = useState("all")

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.isRead
    if (filter === "read") return notif.isRead
    return true
  })

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id)
    } catch (error) {
      console.error('Error al marcar como leída:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id)
    } catch (error) {
      console.error('Error al eliminar notificación:', error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />
      case "message":
        return <MessageSquare className="w-5 h-5 text-purple-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Notificaciones</h1>
          <p className="text-muted-foreground mt-1">Mantente al día con todas tus actividades</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead} className="gap-2 bg-transparent">
            <Check className="w-4 h-4" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas ({notifications.length})</SelectItem>
            <SelectItem value="unread">No leídas ({unreadCount})</SelectItem>
            <SelectItem value="read">Leídas ({notifications.length - unreadCount})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Bell className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay notificaciones</h3>
              <p className="text-sm text-muted-foreground">
                {filter === "unread" 
                  ? "No tienes notificaciones sin leer" 
                  : filter === "read" 
                  ? "No tienes notificaciones leídas" 
                  : "Aquí aparecerán tus notificaciones"}
              </p>
            </div>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 ${!notification.isRead ? "border-l-4 border-l-primary bg-primary/5" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold">{notification.message}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                  {notification.relatedType && (
                    <p className="text-xs text-muted-foreground">
                      Tipo: {notification.relatedType}
                      {notification.relatedId && ` #${notification.relatedId}`}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!notification.isRead && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(notification.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
