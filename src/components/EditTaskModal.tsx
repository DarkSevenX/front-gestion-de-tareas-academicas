
import { useState, useEffect } from 'react';
import apiClient from '../lib/api';
import type { Task } from './TaskList';

interface User {
  id: number;
  username: string;
  role: string;
}

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task; // La tarea a editar
  onTaskUpdated: () => void; // Callback para refrescar la lista de tareas
}

export default function EditTaskModal({ isOpen, onClose, task, onTaskUpdated }: EditTaskModalProps) {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : ''); // Formato YYYY-MM-DD
  const [priority, setPriority] = useState(task.priority);
  // Si la tarea viene agrupada (vista tutor) puede traer `responsibles` con varios alumnos.
  // Inicializamos el responsibleId con el primero si existe, sino con task.responsible (vista alumno).
  const [responsibleId, setResponsibleId] = useState<number | null>(() => {
    const t = task as any;
    if (t && Array.isArray(t.responsibles) && t.responsibles.length > 0) return t.responsibles[0].id;
    // task.responsible puede ser un objeto sin id (por cómo tipamos); intentar obtener id de forma segura
    return (t && t.responsible && (t.responsible as any).id) ?? null;
  });
  
  const [alumnos, setAlumnos] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar la lista de alumnos cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      const fetchAlumnos = async () => {
        try {
          const response = await apiClient.get('/user');
          // El frontend maneja roles en minúscula ('alumno' | 'tutor')
          setAlumnos(response.data.filter((user: User) => user.role.toLowerCase() === 'alumno'));
        } catch (err) {
          console.error("Error fetching users:", err);
        }
      };
      fetchAlumnos();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!responsibleId) {
      setError("Debes seleccionar un alumno responsable.");
      setLoading(false);
      return;
    }

    try {
      const updatedTaskData = {
        name,
        description,
        dueDate: new Date(dueDate).toISOString(),
        priority,
        responsibleId,
        status: task.status, // Mantener el estado actual o permitir editarlo
      };

      await apiClient.put(`/tasks/${task.id}`, updatedTaskData);
      onTaskUpdated(); // Llama al callback para refrescar
      onClose(); // Cierra el modal
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Ocurrió un error al actualizar la tarea');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold">Editar Tarea: {task.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos del formulario */}
          <div>
            <label>Nombre de la Tarea</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border rounded-md p-2" />
          </div>
          <div>
            <label>Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required className="w-full border rounded-md p-2"></textarea>
          </div>
          <div>
            <label>Fecha de Entrega</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full border rounded-md p-2" />
          </div>
          <div>
            <label>Prioridad</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} required className="w-full border rounded-md p-2">
              <option>Baja</option>
              <option>Media</option>
              <option>Alta</option>
            </select>
          </div>
          <div>
            <label>Asignar a</label>
            <select value={responsibleId ?? ''} onChange={e => setResponsibleId(Number(e.target.value))} required className="w-full border rounded-md p-2">
              <option value="" disabled>Selecciona un alumno</option>
              {alumnos.map(alumno => (
                <option key={alumno.id} value={alumno.id}>{alumno.username}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
              {loading ? 'Actualizando...' : 'Actualizar Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
