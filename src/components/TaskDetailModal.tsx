
import { useState, useEffect } from 'react';
import apiClient from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { Task } from './TaskList';
import EditTaskModal from './EditTaskModal';

interface TaskDetailModalProps {
  taskId: number;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
  onTaskDeleted: () => void;
}

export default function TaskDetailModal({ taskId, isOpen, onClose, onTaskUpdated, onTaskDeleted }: TaskDetailModalProps) {
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const fetchTaskDetails = async () => {
    if (!isOpen) return;
    try {
      setLoading(true);
      const response = await apiClient.get<Task>(`/tasks/${taskId}`);
      setTask(response.data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los detalles de la tarea');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId, isOpen]);

  const handleDelete = async () => {
    if (!task) return;
    if (window.confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
      try {
        await apiClient.delete(`/tasks/${task.id}`);
        onTaskDeleted();
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Error al eliminar la tarea');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-xl">
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : task ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">{task.name}</h2>
            <p className="text-gray-700 mb-2">Descripción: {task.description}</p>
            <p className="text-gray-700 mb-2">Estado: {task.status}</p>
            <p className="text-gray-700 mb-2">Prioridad: {task.priority}</p>
            <p className="text-gray-700 mb-2">Vence: {new Date(task.dueDate).toLocaleDateString()}</p>
            <p className="text-gray-700 mb-2">Asignada por: {task.tutor.username}</p>
            {/* Si la tarea viene agregada (vista tutor), mostrar la lista de responsables */}
            {task.responsibles && task.responsibles.length > 0 ? (
              <div className="mb-4">
                <p className="font-semibold">Responsables:</p>
                <ul className="list-disc list-inside">
                  {task.responsibles.map(r => (
                    <li key={r.id}>
                      {r.username ?? `Usuario ${r.id}`} - {r.status ?? 'Desconocido'}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              task.responsible && <p className="text-gray-700 mb-4">Responsable: {task.responsible.username}</p>
            )}

            {user?.role === 'tutor' && (
              <div className="flex justify-end space-x-4 mt-6">
                <button 
                  onClick={() => setEditModalOpen(true)}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Editar
                </button>
                <button 
                  onClick={handleDelete}
                  className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                Cerrar
              </button>
            </div>
          </div>
        ) : null}

        {isEditModalOpen && task && (
          <EditTaskModal
            isOpen={isEditModalOpen}
            onClose={() => setEditModalOpen(false)}
            task={task}
            onTaskUpdated={() => { fetchTaskDetails(); onTaskUpdated(); }}
          />
        )}
      </div>
    </div>
  );
}
