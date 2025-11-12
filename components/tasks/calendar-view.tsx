"use client"

import { useState, ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Flag } from "lucide-react"

interface TasksCalendarViewProps {
  tasks: any[]
}

export function TasksCalendarView({ tasks }: TasksCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return { bg: "bg-red-100/70", text: "text-red-700", border: "border-red-200" }
      case "Media":
        return { bg: "bg-yellow-100/70", text: "text-yellow-700", border: "border-yellow-200" }
      case "Baja":
        return { bg: "bg-green-100/70", text: "text-green-700", border: "border-green-200" }
      default:
        return { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" }
    }
  }

  const days: ReactNode[] = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="p-2 min-h-24" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayTasks = getTasksForDay(day)
    const isToday =
      day === new Date().getDate() &&
      currentDate.getMonth() === new Date().getMonth() &&
      currentDate.getFullYear() === new Date().getFullYear()

    days.push(
      <Card key={day} className={`p-2 min-h-24 ${isToday ? "border-primary border-2" : ""}`}>
        <div className="font-semibold text-sm mb-1">{day}</div>
        <div className="space-y-1">
          {dayTasks.slice(0, 3).map((task) => {
            const color = getPriorityColor(task.priority)
            return (
              <div
                key={task.id}
                className={`text-xs p-1 rounded truncate border ${color.bg} ${color.text} ${color.border} flex items-center gap-1`}
                title={task.name}
              >
                <Flag className="w-3 h-3" />
                {task.name}
              </div>
            )
          })}
          {dayTasks.length > 3 && (
            <div className="text-xs text-muted-foreground">+{dayTasks.length - 3} más</div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
          <div key={d} className="text-center font-semibold text-sm p-2">
            {d}
          </div>
        ))}
        {days}
      </div>
    </div>
  )
}
