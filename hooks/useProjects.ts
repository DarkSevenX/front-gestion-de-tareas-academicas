import { useState, useEffect } from 'react'
import { projectsApi, CreateProjectData, UpdateProjectData } from '../lib/api/projects'
import type { Project } from '../lib/types'
import { useAuthStore } from '../lib/store/authStore'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuthStore()

  // Cargar todos los proyectos
  const loadProjects = async () => {
    if (!token) return
    
    try {
      setLoading(true)
      setError(null)
      const data = await projectsApi.getAll()
      setProjects(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar los proyectos')
      console.error('Error loading projects:', err)
    } finally {
      setLoading(false)
    }
  }

  // Crear nuevo proyecto
  const createProject = async (projectData: CreateProjectData): Promise<Project | null> => {
    try {
      const newProject = await projectsApi.create(projectData)
      setProjects(prev => [...prev, newProject])
      return newProject
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el proyecto')
      console.error('Error creating project:', err)
      throw err
    }
  }

  // Actualizar proyecto
  const updateProject = async (id: number, projectData: UpdateProjectData): Promise<Project | null> => {
    try {
      const updatedProject = await projectsApi.update(id, projectData)
      setProjects(prev => prev.map(project => project.id === id ? updatedProject : project))
      return updatedProject
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el proyecto')
      console.error('Error updating project:', err)
      throw err
    }
  }

  // Eliminar proyecto
  const deleteProject = async (id: number): Promise<void> => {
    try {
      await projectsApi.delete(id)
      setProjects(prev => prev.filter(project => project.id !== id))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar el proyecto')
      console.error('Error deleting project:', err)
      throw err
    }
  }

  // Cargar proyectos al montar el hook
  useEffect(() => {
    loadProjects()
  }, [token])

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: loadProjects
  }
}