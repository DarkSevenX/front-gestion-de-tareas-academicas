"use client"

import { useState, ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Flag, Calendar as CalendarIcon, Clock, CheckCircle } from "lucide-react"

interface MiniCalendarProps {
  tasks: any[]
  currentUser: any
}

export function MiniCalendar({ tasks, currentUser }: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ]

  const isTutor = currentUser?.role === 'TUTOR' || currentUser?.role === 'ADMIN'
  const isStudent = currentUser?.role === 'ALUMNO'

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getTasksForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return tasks.filter((task) => {
      if (!task.dueDate) return false
      const due = new Date(task.dueDate).toISOString().split("T")[0]
      return due === dateStr
    })
  }

  const handleDayClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const tasksForDay = getTasksForDay(day)
    if (tasksForDay.length > 0) {
      setSelectedDay(date)
      setIsModalOpen(true)
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      'Alta': "bg-red-100 text-red-700 border-red-200",
      'Media': "bg-yellow-100 text-yellow-700 border-yellow-200",
      'Baja': "bg-green-100 text-green-700 border-green-200",
    }
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'Pendiente': "bg-slate-100 text-slate-700 border-slate-200",
      'En progreso': "bg-blue-100 text-blue-700 border-blue-200",
      'Completada': "bg-green-100 text-green-700 border-green-200",
      'Bloqueada': "bg-red-100 text-red-700 border-red-200",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  const days: ReactNode[] = []
  
  // Días vacíos al inicio
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />)
  }

  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const dayTasks = getTasksForDay(day)
    const isToday =
      day === new Date().getDate() &&
      currentDate.getMonth() === new Date().getMonth() &&
      currentDate.getFullYear() === new Date().getFullYear()
    const hasTasks = dayTasks.length > 0

    days.push(
      <button
        key={day}
        onClick={() => handleDayClick(day)}
        className={`aspect-square p-1 rounded-lg text-sm font-medium transition-colors relative ${
          isToday ? "bg-primary text-primary-foreground" : "hover:bg-muted"
        } ${hasTasks ? "cursor-pointer" : "cursor-default"}`}
      >
        <span>{day}</span>
        {hasTasks && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            <div className="w-1 h-1 rounded-full bg-primary" />
          </div>
        )}
      </button>
    )
  }

  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay.getDate()) : []

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {["D", "L", "M", "M", "J", "V", "S"].map((day, i) => (
            <div key={i} className="text-center text-xs font-semibold text-muted-foreground pb-1">
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {selectedDay && `Tareas para ${selectedDay.toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' })}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 mt-4">
            {selectedDayTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay tareas para este día
              </p>
            ) : (
              selectedDayTasks.map((task) => (
                <Card key={task.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-base">{task.name}</h4>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        <Flag className="w-3 h-3 mr-1" />
                        {task.priority}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Para estudiantes: mostrar estado y si fue entregada */}
                      {isStudent && (
                        <>
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          {task.submissions && task.submissions.length > 0 && (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Entregada
                            </Badge>
                          )}
                        </>
                      )}
                      
                      {/* Para tutores: solo mostrar info básica sin detalles de entregas */}
                      {isTutor && (
                        <>
                          <Badge variant="secondary" className="text-xs">
                            {task.type === 'project' ? 'Proyecto' : 'Diaria'}
                          </Badge>
                          {task.responsibles && task.responsibles.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {task.responsibles.length} alumno(s)
                            </Badge>
                          )}
                        </>
                      )}
                      
                      {task.project && (
                        <Badge variant="outline" className="text-xs">
                          {task.project.name}
                        </Badge>
                      )}
                      
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString("es-ES")}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
