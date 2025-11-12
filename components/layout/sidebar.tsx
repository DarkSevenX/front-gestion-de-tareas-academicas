"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  GraduationCap,
  MessageSquare,
  Bot,
  Bell,
  Clock,
  BarChart3,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/usePermissions"
import { useChatStore } from "@/lib/store/chatStore"

interface SidebarProps {
  currentUser: any
  activeView: string
  onViewChange: (view: string) => void
}

export function Sidebar({ currentUser, activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { permissions, isStudent, isTutor, isAdmin } = usePermissions()

  const { unreadPublic, unreadPrivate } = useChatStore()
  const totalPrivateUnread = Object.values(unreadPrivate).reduce((a,b)=> a + b, 0)
  const totalUnread = unreadPublic + totalPrivateUnread

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    { id: "tasks", label: "Tareas", icon: ListTodo, show: true },
    { id: "projects", label: "Proyectos", icon: FolderKanban, show: true },
    { id: "exams", label: "Exámenes", icon: GraduationCap, show: true },
    { id: "chat", label: "Chat", icon: MessageSquare, show: true },
    { id: "chatbot", label: "Chatbot IA", icon: Bot, show: true },
    { id: "reminders", label: "Recordatorios", icon: Clock, show: true },
    // { 
    //   id: "reports", 
    //   label: "Reportes", 
    //   icon: BarChart3, 
    //   show: permissions.canViewDetailedReports || permissions.canViewOwnProgress 
    // },
  ]

  const bottomItems = [
    { 
      id: "users", 
      label: "Usuarios", 
      icon: Users, 
      show: permissions.canManageUsers // Solo ADMIN puede gestionar usuarios
    },
    // Ocultamos Configuración del sidebar; solo accesible desde el botón del header
    { id: "settings", label: "Configuración", icon: Settings, show: false },
  ]

  return (
    <aside
      className={cn(
        "h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="p-6 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">SimBack</h1>
              <p className="text-xs text-muted-foreground mt-1">Gestión Académica</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-8 w-8", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.filter(item => item.show).map((item) => {
          const isChat = item.id === 'chat'
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? "secondary" : "ghost"}
              className={cn(
                "relative w-full justify-start gap-3 h-11 font-medium transition-colors",
                collapsed && "justify-center",
                activeView === item.id && "bg-primary/10 text-primary hover:bg-primary/15",
              )}
              onClick={() => onViewChange(item.id)}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {isChat && totalUnread > 0 && activeView !== 'chat' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[11px] px-2 py-[2px] rounded-full">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </Button>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        {bottomItems.filter(item => item.show).map((item) => {
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11 font-medium",
                collapsed && "justify-center",
                activeView === item.id && "bg-primary/10 text-primary hover:bg-primary/15",
              )}
              onClick={() => onViewChange(item.id)}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          )
        })}
      </div>
    </aside>
  )
}
