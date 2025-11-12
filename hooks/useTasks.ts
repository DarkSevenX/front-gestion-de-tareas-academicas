import { useState, useEffect } from 'react'
import { tasksApi, CreateTaskData, UpdateTaskData } from '../lib/api/tasks'
import type { Task } from '../lib/types'
import { useAuthStore } from '../lib/store/authStore'

// Helper function to group tasks by their logical identity (same as backend logic)
function groupTasks(tasks: Task[], userRole: string | undefined): Task[] {
  // Solo agrupar para tutores
  if (!userRole || userRole.toLowerCase() !== 'tutor') {
    return tasks
  }

  const grouped = new Map<string, Task>()

  for (const task of tasks) {
    // Si la tarea ya viene agrupada (tiene responsibles), usarla directamente
    if (task.responsibles && Array.isArray(task.responsibles) && task.responsibles.length > 0) {
      grouped.set(String(task.id), task)
      continue
    }

    // Normalizar fecha igual que en el backend
    const normalizedDate = task.dueDate 
      ? new Date(task.dueDate).toISOString().split('.')[0] 
      : 'null'
    
    // Crear clave única basada en los campos que definen una tarea "lógica"
    const key = [
      task.name?.trim() || '',
      task.description?.trim() || '',
      normalizedDate,
      String(task.projectId ?? 'null'),
      task.priority?.trim() || '',
      task.type?.trim() || ''
    ].join('||')

    if (!grouped.has(key)) {
      grouped.set(key, {
        ...task,
        responsibles: [{
          id: task.responsibleId,
          username: task.responsible?.username,
          firstName: task.responsible?.firstName,
          lastName: task.responsible?.lastName,
          status: task.status
        }]
      })
    } else {
      const entry = grouped.get(key)!
      
      // Agregar responsable si no existe ya
      if (!entry.responsibles!.some(r => r.id === task.responsibleId)) {
        entry.responsibles!.push({
          id: task.responsibleId,
          username: task.responsible?.username,
          firstName: task.responsible?.firstName,
          lastName: task.responsible?.lastName,
          status: task.status
        })
      }

      // Ajustar estado agregado basado en prioridad: Pendiente > En progreso > Completada
      if (entry.status !== 'Pendiente') {
        if (task.status === 'Pendiente') {
          entry.status = 'Pendiente'
        } else if (entry.status !== 'En progreso' && task.status === 'En progreso') {
          entry.status = 'En progreso'
        }
      }
    }
  }

  return Array.from(grouped.values())
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token, user } = useAuthStore()

  // Cargar todas las tareas
  const loadTasks = async (): Promise<Task[] | undefined> => {
    if (!token) return
    
    try {
      setLoading(true)
      setError(null)
      const data = await tasksApi.getAll()
      // El backend ya agrupa las tareas para tutores, pero por si acaso
      setTasks(data)
      return data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar las tareas')
      console.error('Error loading tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  // Crear nueva tarea
  const createTask = async (taskData: CreateTaskData): Promise<{ tasks: Task[]; count: number; calendarWarning?: string } | null> => {
    try {
      const response = await tasksApi.create(taskData)
      // response contiene { tasks, count, calendarWarning?, calendarWarningCode? }
      if (response.tasks && Array.isArray(response.tasks)) {
        // Agrupar las tareas nuevas antes de agregarlas al estado
        const groupedNewTasks = groupTasks(response.tasks, user?.role)
        
        // Para tutores, agregar las tareas agrupadas
        if (user?.role?.toLowerCase() === 'tutor') {
          setTasks(prev => [...prev, ...groupedNewTasks])
        } else {
          // Para alumnos, agregar normalmente (solo recibirán una tarea)
          setTasks(prev => [...prev, ...response.tasks])
        }
      }
      return response
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la tarea')
      console.error('Error creating task:', err)
      throw err
    }
  }

  // Actualizar tarea
  const updateTask = async (id: number, taskData: UpdateTaskData): Promise<Task | null> => {
    try {
      const updatedTask = await tasksApi.update(id, taskData)
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task))
      return updatedTask
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar la tarea')
      console.error('Error updating task:', err)
      throw err
    }
  }

  // Eliminar tarea
  const deleteTask = async (id: number): Promise<void> => {
    try {
      await tasksApi.delete(id)
      setTasks(prev => prev.filter(task => task.id !== id))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar la tarea')
      console.error('Error deleting task:', err)
      throw err
    }
  }

  // Cargar tareas al montar el hook
  useEffect(() => {
    loadTasks()
  }, [token])

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: loadTasks
  }
}