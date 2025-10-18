import { useState, useEffect } from 'react';
import apiClient from '../lib/api';

interface User {
  id: number;
  username: string;
  role: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Media');
  const [selectedAlumnos, setSelectedAlumnos] = useState<number[]>([]);
  
  const [alumnos, setAlumnos] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchAlumnos = async () => {
        try {
          const response = await apiClient.get('/user');
          setAlumnos(response.data.filter((user: User) => user.role === 'alumno'));
        } catch (err) {
          console.error("Error fetching users:", err);
        }
      };
      fetchAlumnos();
    }
  }, [isOpen]);

  const handleAlumnoSelection = (alumnoId: number) => {
    setSelectedAlumnos(prev => 
      prev.includes(alumnoId) 
        ? prev.filter(id => id !== alumnoId) 
        : [...prev, alumnoId]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedAlumnos(alumnos.map(a => a.id));
    } else {
      setSelectedAlumnos([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (selectedAlumnos.length === 0) {
      setError("Debes seleccionar al menos un alumno.");
      setLoading(false);
      return;
    }

    try {
      const taskData = {
        
        name,
        description,
        dueDate: new Date(dueDate).toISOString(),
        priority,
        status: 'Pendiente',
      };

      const creationPromises = selectedAlumnos.map(alumnoId => 
        apiClient.post('/tasks', { ...taskData, responsibleId: alumnoId })
      );
      await Promise.all(creationPromises);

      onTaskCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold">Crear Nueva Tarea</h2>
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

          {/* Sección para asignar responsables */}
          <div>
            <label className="font-bold">Asignar a</label>
            <div className="mt-2 p-2 border rounded-md max-h-48 overflow-y-auto">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="select-all"
                  onChange={handleSelectAll}
                  // Determinar si "todos" están seleccionados
                  checked={alumnos.length > 0 && selectedAlumnos.length === alumnos.length}
                />
                <label htmlFor="select-all" className="ml-2 font-semibold">Seleccionar Todos</label>
              </div>
              <hr className="my-2" />
              {alumnos.map(alumno => (
                <div key={alumno.id} className="flex items-center">
                  <input 
                    type="checkbox" 
                    id={`alumno-${alumno.id}`} 
                    checked={selectedAlumnos.includes(alumno.id)} 
                    onChange={() => handleAlumnoSelection(alumno.id)}
                  />
                  <label htmlFor={`alumno-${alumno.id}`} className="ml-2">{alumno.username}</label>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
              {loading ? 'Creando...' : 'Crear Tarea(s)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}