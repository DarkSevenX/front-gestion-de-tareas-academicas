"use client"

import { Card } from "@/components/ui/card"
import { BarChart3, TrendingUp, Award, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function ReportsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Reportes y Estadísticas</h1>
        <p className="text-muted-foreground mt-1">Análisis detallado de tu rendimiento académico</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Promedio General</p>
              <p className="text-3xl font-bold mt-1">87.5</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tareas Completadas</p>
              <p className="text-3xl font-bold mt-1">24/30</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Horas de Estudio</p>
              <p className="text-3xl font-bold mt-1">156</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Progreso</p>
              <p className="text-3xl font-bold mt-1">78%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4">Rendimiento por Materia</h2>
        <div className="space-y-4">
          {[
            { name: "Programación", score: 92, color: "bg-blue-500" },
            { name: "Bases de Datos", score: 88, color: "bg-purple-500" },
            { name: "Diseño UX/UI", score: 85, color: "bg-pink-500" },
            { name: "Algoritmos", score: 83, color: "bg-green-500" },
          ].map((subject) => (
            <div key={subject.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{subject.name}</span>
                <span className="font-bold">{subject.score}/100</span>
              </div>
              <Progress value={subject.score} className="h-3" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
