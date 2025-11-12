"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Clock, Plus, Trash2 } from "lucide-react"
import { useReminders } from "@/hooks/useReminders"

export function RemindersView() {
  const { items, isLoading, error, create, remove, reload } = useReminders()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    // Validación básica
    if (!title || !date || !time) return
    const scheduledAt = new Date(`${date}T${time}:00`)
    if (isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) return
    setSaving(true)
    try {
      await create({ title, description, scheduledAt })
      setOpen(false)
      setTitle("")
      setDescription("")
      setDate("")
      setTime("")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Recordatorios</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus recordatorios y fechas importantes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Recordatorio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Recordatorio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Entregar informe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Hora</Label>
                  <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={saving || !title || !date || !time}>
                {saving ? 'Guardando...' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 animate-pulse h-32" />
          ))
        ) : items.length === 0 ? (
          <div className="col-span-full text-sm text-muted-foreground">No tienes recordatorios</div>
        ) : (
          items.map((reminder) => (
            <Card key={reminder.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="outline">Activo: {reminder.isActive ? 'Sí' : 'No'}</Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => remove(reminder.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold mb-2">{reminder.title}</h3>
              {reminder.description && (
                <p className="text-sm text-muted-foreground mb-3">{reminder.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  {new Date(reminder.scheduledAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
