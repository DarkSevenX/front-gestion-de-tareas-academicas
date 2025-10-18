import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSocket } from '../lib/socket';
import Notifications from './Notifications';
import type { Notification } from './Notifications';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: 'processes' | 'chat') => void;
}

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const socket = getSocket();

      // Escuchar nuevas notificaciones
      socket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [user]);

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como leída (lógica a implementar)
    console.log("Notification clicked:", notification);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Gestor de Proyectos</h1>
          {user && (
            <div className="flex items-center space-x-4">
              <div className="relative">
                {/* Botón que solo controla la visibilidad del menú */}
                <button onClick={() => setNotificationsOpen(!isNotificationsOpen)}>
                  <Notifications notifications={notifications} onNotificationClick={handleNotificationClick} />
                </button>
                {/* El menú se renderiza fuera del botón */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-10">
                    <div className="p-4 font-bold border-b">Notificaciones</div>
                    <ul className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? notifications.map(n => (
                        <li key={n.id} onClick={() => handleNotificationClick(n)} className="p-4 border-b hover:bg-gray-100 cursor-pointer">
                          {n.message}
                        </li>
                      )) : (
                        <li className="p-4 text-center text-gray-500">No hay notificaciones</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-600">Hola, {user.username} ({user.role})</span>
              <button 
                onClick={signOut}
                className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
        <nav className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center space-x-8">
              <button 
                onClick={() => onTabChange('processes')} 
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'processes' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  Tareas
              </button>
              <button 
                onClick={() => onTabChange('chat')} 
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'chat' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  Chat
              </button>
            </div>
          </div>
        </nav>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}