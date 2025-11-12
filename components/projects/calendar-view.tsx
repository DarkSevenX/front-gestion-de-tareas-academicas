"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarViewProps {
  projects: any[]
}

export function CalendarView({ projects }: CalendarViewProps) {
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

  const getProjectsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return projects.filter((project) => {
      const startDate = new Date(project.startDate).toISOString().split("T")[0]
      const endDate = new Date(project.endDate).toISOString().split("T")[0]
      return dateStr >= startDate && dateStr <= endDate
    })
  }

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="p-2 min-h-24" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayProjects = getProjectsForDay(day)
    const isToday =
      day === new Date().getDate() &&
      currentDate.getMonth() === new Date().getMonth() &&
      currentDate.getFullYear() === new Date().getFullYear()

    days.push(
      <Card key={day} className={`p-2 min-h-24 ${isToday ? "border-primary border-2" : ""}`}>
        <div className="font-semibold text-sm mb-1">{day}</div>
        <div className="space-y-1">
          {dayProjects.slice(0, 2).map((project) => (
            <div
              key={project.id}
              className="text-xs p-1 rounded truncate"
              style={{ backgroundColor: (project.color || '#3b82f6') + "20", color: project.color || '#3b82f6' }}
            >
              {project.name}
            </div>
          ))}
          {dayProjects.length > 2 && <div className="text-xs text-muted-foreground">+{dayProjects.length - 2} más</div>}
        </div>
      </Card>,
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
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div key={day} className="text-center font-semibold text-sm p-2">
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  )
}
