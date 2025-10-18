import { useEffect, useState } from 'react';
import apiClient from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import CreateTaskModal from './CreateTaskModal';
import { getSocket } from '../lib/socket';

import TaskDetailModal from './TaskDetailModal';

// Interfaz para Tarea (la usaremos también en la tarjeta)
export interface Task {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  tutor: { id?: number; username: string };
  responsible?: { id?: number; username: string };
  // Cuando el tutor vea tareas, pueden venir agrupadas con varios responsables
  responsibles?: { id: number; username?: string; status?: string }[];
}

export const TaskList: React.FC = () => {
  const { user } = useAuth();
  console.log('User in TaskList:', user);
  console.log('User role in TaskList:', user?.role);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Para CreateTaskModal
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTaskDetailModalOpen, setTaskDetailModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/tasks');
      setTasks(response.data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  // useEffect para la carga inicial de tareas (o cuando el usuario cambia)
  useEffect(() => {
    fetchTasks();
  }, [user]); // Depende del usuario para recargar la lista si el rol cambia

  // useEffect separado para la escucha de sockets
  useEffect(() => {
    const socket = getSocket();

    const handleTaskCreatedSocket = (newTask: Task) => {
      // Solo los alumnos deben añadir tareas vía socket
      if (user?.role === 'alumno') {
        setTasks(prevTasks => {
          // Evitar duplicados: si la tarea ya existe por ID, no la añadimos
          if (prevTasks.some(task => task.id === newTask.id)) {
            return prevTasks;
          }
          return [...prevTasks, newTask];
        });
      }
    };

    socket.on('task-created', handleTaskCreatedSocket);

    return () => {
      socket.off('task-created', handleTaskCreatedSocket);
    };
  }, [user, setTasks]); // Depende de user y setTasks

  const handleTaskCreated = () => {
    fetchTasks(); // Recargar la lista de tareas después de crear una
  };

  if (loading) return <p>Cargando tareas...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tareas Académicas</h2>
        {user?.role === 'tutor' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Crear Tarea
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className="p-4 bg-white rounded-lg shadow-md border-l-4 border-blue-500 cursor-pointer"
            onClick={() => { setSelectedTaskId(task.id); setTaskDetailModalOpen(true); }}
          >
            <h3 className="font-bold">{task.name}</h3>
            <p className="text-sm text-gray-600">Asignada por: {task.tutor.username}</p>
            {task.responsible && <p className="text-sm text-gray-600">Responsable: {task.responsible.username}</p>}
            {task.responsibles && (
              <p className="text-sm text-gray-600">Asignada a: {task.responsibles.map(r => r.username ?? r.id).join(', ')}</p>
            )}
            <div className="flex justify-between items-center text-sm mt-2">
              <span>Estado: {task.status}</span>
              {task.dueDate && <span>Vence: {new Date(task.dueDate).toLocaleDateString()}</span>}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <CreateTaskModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onTaskCreated={handleTaskCreated}
        />
      )}

      {isTaskDetailModalOpen && selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          isOpen={isTaskDetailModalOpen}
          onClose={() => setTaskDetailModalOpen(false)}
          onTaskUpdated={handleTaskCreated} // Recargar lista al actualizar
          onTaskDeleted={handleTaskCreated} // Recargar lista al eliminar
        />
      )}
    </div>
  );
}
