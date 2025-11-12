import { useState, useEffect, useCallback } from 'react'
import { remindersApi, type Reminder, type ReminderInput } from '@/lib/api/reminders'
import { useAuthStore } from '@/lib/store/authStore'

export const useReminders = () => {
  const [items, setItems] = useState<Reminder[]>([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuthStore()

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const list = await remindersApi.list()
      setItems(list)
    } catch (e: any) {
      setError(e?.message || 'Error cargando recordatorios')
    } finally {
      setLoading(false)
    }
  }, [token])

  const create = useCallback(async (data: ReminderInput) => {
    setError(null)
    const created = await remindersApi.create(data)
    setItems(prev => [created, ...prev])
    return created
  }, [])

  const update = useCallback(async (id: number, data: Partial<ReminderInput & { isActive: boolean }>) => {
    setError(null)
    const updated = await remindersApi.update(id, data)
    setItems(prev => prev.map(r => r.id === id ? updated : r))
    return updated
  }, [])

  const remove = useCallback(async (id: number) => {
    setError(null)
    await remindersApi.remove(id)
    setItems(prev => prev.filter(r => r.id !== id))
  }, [])

  useEffect(() => { load() }, [load])

  return { items, isLoading, error, reload: load, create, update, remove }
}
