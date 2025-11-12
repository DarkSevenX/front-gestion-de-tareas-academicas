"use client"

import { useEffect, useState } from "react"
import { LoginView } from "@/components/auth/login-view"
import { RegisterView } from "@/components/auth/register-view"
import { Dashboard } from "@/components/dashboard/dashboard"
import { UserManagement } from "@/components/admin/user-management"
import { TasksList } from "@/components/tasks/tasks-list"
import { ProjectsList } from "@/components/projects/projects-list"
import { ExamsList } from "@/components/exams/exams-list"
import { ChatView } from "@/components/chat/chat-view"
import { ChatbotView } from "@/components/chatbot/chatbot-view"
import { NotificationsView } from "@/components/notifications/notifications-view"
import { RemindersView } from "@/components/reminders/reminders-view"
import { ReportsView } from "@/components/reports/reports-view"
import { SettingsView } from "@/components/settings/settings-view"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useAuthStore } from "@/lib/store/authStore"
import { useSocketStore } from "@/lib/store/socketStore"
import { useGoogleAuthCallback } from "@/hooks/useGoogleAuthCallback"
import { useChatSocketBridge } from "@/hooks/useChatSocketBridge"

export default function Page() {
  const [currentView, setCurrentView] = useState<"login" | "register">("login")
  const [activeView, setActiveView] = useState("dashboard")
  
  const { user, isAuthenticated, logout, token } = useAuthStore()
  const { connect, disconnect, isConnected } = useSocketStore()
  
  // Hook para manejar callback de Google OAuth
  useGoogleAuthCallback()

  // Resetear la vista activa cuando cambia el usuario (ej: logout y nuevo login)
  useEffect(() => {
    if (isAuthenticated && user) {
      // Si la vista actual es "users" pero el usuario no es admin, volver al dashboard
      if (activeView === "users" && user.role !== "ADMIN") {
        setActiveView("dashboard")
      }
    }
  }, [user, isAuthenticated, activeView])

  // Conectar socket cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && token && !isConnected) {
      connect(token)
    } else if (!isAuthenticated && isConnected) {
      disconnect()
    }
  }, [isAuthenticated, token, isConnected, connect, disconnect])

  // Registrar listeners globales de chat para recibir mensajes siempre
  useChatSocketBridge()

  const handleLogin = (user: any) => {
    // El login ya está manejado por el store
    console.log('Usuario logueado:', user)
  }

  const handleLogout = () => {
    logout()
    disconnect()
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 flex items-center justify-center p-4">
        {currentView === "login" ? (
          <LoginView onLogin={handleLogin} onSwitchToRegister={() => setCurrentView("register")} />
        ) : (
          <RegisterView onRegister={handleLogin} onSwitchToLogin={() => setCurrentView("login")} />
        )}
      </div>
    )
  }

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard currentUser={user} onNavigate={setActiveView} />
      case "users":
        return <UserManagement />
      case "tasks":
        return <TasksList />
      case "projects":
        return <ProjectsList />
      case "exams":
        return <ExamsList currentUser={user} />
      case "chat":
        return <ChatView currentUser={user} />
      case "chatbot":
        return <ChatbotView />
      case "notifications":
        return <NotificationsView />
      case "reminders":
        return <RemindersView />
      case "reports":
        return <ReportsView />
      case "settings":
        return user ? <SettingsView currentUser={user} /> : null
      default:
        return <Dashboard currentUser={user} />
    }
  }

  return (
        <div className="min-h-screen bg-background flex">
      <Sidebar currentUser={user} activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 flex flex-col">
        <Header currentUser={user} onLogout={handleLogout} onNavigate={setActiveView} />
        <main className="flex-1 p-6">
          {renderView()}
        </main>
      </div>
    </div>
  )
}
