import { api } from '../api'

export interface ReminderInput {
  title: string
  description?: string
  scheduledAt: string | Date
  relatedId?: number
  relatedType?: string
}

export interface Reminder extends ReminderInput {
  id: number
  userId: number
  isActive: boolean
  scheduledAt: string
}

export const remindersApi = {
  async list(): Promise<Reminder[]> {
    const res = await api.get('/reminders')
    return res.data
  },
  async create(data: ReminderInput): Promise<Reminder> {
    const payload = { ...data, scheduledAt: new Date(data.scheduledAt).toISOString() }
    const res = await api.post('/reminders', payload)
    return res.data
  },
  async update(id: number, data: Partial<ReminderInput & { isActive: boolean }>): Promise<Reminder> {
    const payload: any = { ...data }
    if (payload.scheduledAt) payload.scheduledAt = new Date(payload.scheduledAt).toISOString()
    const res = await api.put(`/reminders/${id}`, payload)
    return res.data
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/reminders/${id}`)
  },
  // Legacy schedule endpoint (non-persistent)
  async schedule(message: string, scheduledAt: string | Date, relatedId?: number, relatedType?: string) {
    const res = await api.post('/reminders/schedule', {
      message,
      scheduledAt: new Date(scheduledAt).toISOString(),
      relatedId,
      relatedType,
    })
    return res.data as { message: string; jobId: string; scheduledAt: string }
  },
}